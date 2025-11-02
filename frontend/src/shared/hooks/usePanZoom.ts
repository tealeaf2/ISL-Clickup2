/**
 * usePanZoom Hook
 * 
 * A custom React hook that provides pan and zoom functionality for interactive
 * canvas-like views. Supports:
 * - Mouse wheel zooming with zoom-around-cursor behavior
 * - Pointer-based panning (drag to pan)
 * - Programmatic zoom controls (zoom in, zoom out, reset, fit to view)
 * - Automatic scale clamping to prevent extreme zoom levels
 * 
 * This hook is designed for use with SVG or canvas-based visualizations that
 * need interactive navigation capabilities.
 * 
 * @fileoverview Custom hook for pan and zoom functionality in interactive views
 */

import { useState, useRef, useEffect } from 'react';
import { clamp } from '../utils';
import type { PanState } from '../types';

/**
 * Custom hook for managing pan and zoom functionality
 * 
 * Provides state and handlers for panning and zooming an interactive view.
 * Handles pointer events for panning and wheel events for zooming.
 * 
 * @param {number} contentWidth - Width of the content being viewed (for fit-to-view calculations)
 * @param {number} contentHeight - Height of the content being viewed (for fit-to-view calculations)
 * @returns {Object} Object containing pan/zoom state and control functions
 * @returns {React.RefObject<HTMLDivElement>} containerRef - Ref to attach to the container element
 * @returns {number} scale - Current zoom scale (1.0 = 100%, 0.5 = 50%, 2.0 = 200%)
 * @returns {PanState} pan - Current pan offset {x, y} in pixels
 * @returns {boolean} isPanning - Whether the user is currently panning
 * @returns {Function} onPointerDown - Handler for pointer down events (attach to container)
 * @returns {Function} onPointerMove - Handler for pointer move events (attach to container)
 * @returns {Function} onPointerUp - Handler for pointer up events (attach to container)
 * @returns {Function} zoomIn - Function to zoom in by 20%
 * @returns {Function} zoomOut - Function to zoom out by 20%
 * @returns {Function} resetView - Function to reset zoom to 0.8x and pan to (0, 0)
 * @returns {Function} fitToView - Function to scale and center content to fit container
 * @returns {Function} setScale - Function to directly set the zoom scale
 * 
 * @example
 * const { containerRef, scale, pan, zoomIn, zoomOut } = usePanZoom(2000, 1500);
 */
export const usePanZoom = (contentWidth: number, contentHeight: number) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);
  const [pan, setPan] = useState<PanState>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  /**
   * Handles mouse wheel events for zooming around the cursor position
   * 
   * @param {WheelEvent} e - The wheel event
   */
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault(); // This will work when added directly to DOM
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const prevScale = scale;
    const factor = e.deltaY < 0 ? 1.1 : 0.9; // up = zoom in
    const nextScale = clamp(prevScale * factor, 0.25, 4);

    const newPanX = mouseX - ((mouseX - pan.x) / prevScale) * nextScale;
    const newPanY = mouseY - ((mouseY - pan.y) / prevScale) * nextScale;

    setScale(nextScale);
    setPan({ x: newPanX, y: newPanY });
  };

  // Add wheel event listener directly to DOM to avoid passive listener issues
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  /**
   * Handles pointer down events to initiate panning
   * 
   * @param {PointerEvent} e - The pointer down event
   */
  const handlePointerDown = (e: PointerEvent) => {
    if (e.target instanceof Element && e.target.closest('.task-bar, .dependency-edge, button')) return;
    
    setIsPanning(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { x: pan.x, y: pan.y };
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  /**
   * Handles pointer move events during panning
   * 
   * @param {PointerEvent} e - The pointer move event
   */
  const handlePointerMove = (e: PointerEvent) => {
    if (!isPanning) return;
    
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;
    
    setPan({
      x: panStart.current.x + deltaX,
      y: panStart.current.y + deltaY
    });
  };

  /**
   * Handles pointer up events to end panning
   * 
   * @param {PointerEvent} [e] - Optional pointer up event
   */
  const handlePointerUp = (e?: PointerEvent) => {
    setIsPanning(false);
    if (e && containerRef.current) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
  };

  /**
   * Zooms in by 20% (multiplies scale by 1.2)
   */
  const zoomIn = () => {
    const factor = 1.2;
    const nextScale = clamp(scale * factor, 0.25, 4);
    setScale(nextScale);
  };

  /**
   * Zooms out by 20% (multiplies scale by 0.8)
   */
  const zoomOut = () => {
    const factor = 0.8;
    const nextScale = clamp(scale * factor, 0.25, 4);
    setScale(nextScale);
  };

  /**
   * Resets the view to default zoom (0.8x) and center position (0, 0)
   */
  const resetView = () => {
    setScale(0.8);
    setPan({ x: 0, y: 0 });
  };

  /**
   * Calculates and applies zoom/pan to fit all content within the container viewport
   * Centers the content and scales it to fit with 10% padding
   */
  const fitToView = () => {
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    
    // Calculate scale to fit content in view
    const scaleX = containerWidth / contentWidth;
    const scaleY = containerHeight / contentHeight;
    const fitScale = Math.min(scaleX, scaleY) * 0.9; // 0.9 for some padding
    
    const clampedScale = clamp(fitScale, 0.25, 4);
    
    // Center the content
    const newPanX = (containerWidth - contentWidth * clampedScale) / 2;
    const newPanY = (containerHeight - contentHeight * clampedScale) / 2;
    
    setScale(clampedScale);
    setPan({ x: newPanX, y: newPanY });
  };

  return {
    containerRef,
    scale,
    pan,
    isPanning,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    zoomIn,
    zoomOut,
    resetView,
    fitToView,
    setScale
  };
};
