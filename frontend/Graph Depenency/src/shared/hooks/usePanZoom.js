import { useState, useRef, useEffect } from 'react';
import { clamp } from '../utils';

/**
 * Custom hook for managing pan and zoom functionality
 */
export const usePanZoom = (contentWidth, contentHeight) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.8);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  // Zoom around cursor position
  const handleWheel = (e) => {
    e.preventDefault();
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

  // Pan handling
  const handlePointerDown = (e) => {
    if (e.target.closest('.task-bar, .dependency-edge, button')) return;
    
    setIsPanning(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { x: pan.x, y: pan.y };
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isPanning) return;
    
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;
    
    setPan({
      x: panStart.current.x + deltaX,
      y: panStart.current.y + deltaY
    });
  };

  const handlePointerUp = () => {
    setIsPanning(false);
    containerRef.current?.releasePointerCapture();
  };

  // Zoom functions
  const zoomIn = () => {
    const factor = 1.2;
    const nextScale = clamp(scale * factor, 0.25, 4);
    setScale(nextScale);
  };

  const zoomOut = () => {
    const factor = 0.8;
    const nextScale = clamp(scale * factor, 0.25, 4);
    setScale(nextScale);
  };

  const resetView = () => {
    setScale(0.8);
    setPan({ x: 0, y: 0 });
  };

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
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    zoomIn,
    zoomOut,
    resetView,
    fitToView,
    setScale
  };
};