/**
 * useTaskSelection Hook
 * 
 * A custom React hook that manages task selection state and modal visibility
 * for the dependency graph interface. Handles selection, editing, and modal
 * positioning.
 * 
 * Features:
 * - Task selection state management
 * - Modal visibility control (edit modal, add task modal)
 * - Draft task state for editing
 * - Modal positioning based on click location
 * 
 * @fileoverview Custom hook for managing task selection and modal states
 */

import { useState, useCallback } from 'react';
import type { Task, TaskDraft, ModalPosition } from '../types';

/**
 * Custom hook for managing task selection and editing
 * 
 * Manages state for task selection, modal visibility, and draft editing.
 * Provides functions to select tasks, open/close modals, and manage draft state.
 * 
 * @returns {Object} Object containing selection state and control functions
 * @returns {string|null} selectedId - ID of currently selected task, or null
 * @returns {Function} setSelectedId - Function to set the selected task ID
 * @returns {Function} selectTask - Function to select a task with modal position
 * @returns {boolean} editOpen - Whether the edit/detail modal is open
 * @returns {Function} setEditOpen - Function to set edit modal visibility
 * @returns {TaskDraft|null} draft - Current draft task for editing, or null
 * @returns {Function} setDraft - Function to set the draft task
 * @returns {Function} updateDraft - Function to update draft from selected task
 * @returns {Function} closeSelection - Function to close selection and all modals
 * @returns {Function} openEdit - Function to open the edit modal
 * @returns {ModalPosition} modalPosition - Current modal position {x, y}
 * @returns {boolean} showAddTaskModal - Whether the add task modal is open
 * @returns {Function} openAddTaskModal - Function to open the add task modal
 * @returns {Function} closeAddTaskModal - Function to close the add task modal
 */
export const useTaskSelection = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<TaskDraft | null>(null);
  const [modalPosition, setModalPosition] = useState<ModalPosition>({ x: 0, y: 0 });
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  /**
   * Updates draft task when selected task changes and edit modal is open
   * 
   * Converts the task's dependency array to a comma-separated string for editing.
   * 
   * @param {Task|null} selectedTask - The task to create a draft from, or null
   */
  const updateDraft = useCallback((selectedTask: Task | null) => {
    if (selectedTask && editOpen) {
      setDraft({
        ...selectedTask,
        dependsText: (selectedTask.depends || []).join(',')
      });
    }
  }, [editOpen]);

  /**
   * Closes the current selection and all modals
   * 
   * Resets selectedId, closes edit modal, and closes add task modal.
   */
  const closeSelection = () => {
    setSelectedId(null);
    setEditOpen(false);
    setShowAddTaskModal(false); // Also close add task modal
  };

  /**
   * Opens the edit modal for the currently selected task
   * 
   * Requires a task to be selected (selectedId must be set).
   */
  const openEdit = () => {
    console.log('openEdit called, selectedId:', selectedId);
    setEditOpen(true);
    // Keep selectedId so edit modal knows which task to edit
    // The task details modal will be hidden by the conditional rendering
  };

  /**
   * Sets the selected task and modal position
   * 
   * @param {string} taskId - The ID of the task to select, or empty string to clear selection
   * @param {ModalPosition} position - Screen position {x, y} for modal placement
   */
  const selectTask = (taskId: string, position: ModalPosition) => {
    setSelectedId(taskId);
    setModalPosition(position);
  };

  /**
   * Opens the add task modal for creating a new task
   */
  const openAddTaskModal = () => {
    setShowAddTaskModal(true);
  };

  /**
   * Closes the add task modal
   */
  const closeAddTaskModal = () => {
    setShowAddTaskModal(false);
  };

  return {
    selectedId,
    setSelectedId,
    selectTask,
    editOpen,
    setEditOpen,
    draft,
    setDraft,
    updateDraft,
    closeSelection,
    openEdit,
    modalPosition,
    showAddTaskModal,
    openAddTaskModal,
    closeAddTaskModal
  };
};
