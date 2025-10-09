import { useState, useCallback } from 'react';
import type { Task, TaskDraft, ModalPosition } from '../types';

/**
 * Custom hook for managing task selection and editing
 */
export const useTaskSelection = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<TaskDraft | null>(null);
  const [modalPosition, setModalPosition] = useState<ModalPosition>({ x: 0, y: 0 });
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Update draft when selected task changes
  const updateDraft = useCallback((selectedTask: Task | null) => {
    if (selectedTask && editOpen) {
      setDraft({
        ...selectedTask,
        dependsText: (selectedTask.depends || []).join(',')
      });
    }
  }, [editOpen]);

  // Close selection and edit modal
  const closeSelection = () => {
    setSelectedId(null);
    setEditOpen(false);
    setShowAddTaskModal(false); // Also close add task modal
  };

  // Open edit modal for selected task
  const openEdit = () => {
    console.log('openEdit called, selectedId:', selectedId);
    setEditOpen(true);
    // Keep selectedId so edit modal knows which task to edit
    // The task details modal will be hidden by the conditional rendering
  };

  // Set task selection with position
  const selectTask = (taskId: string, position: ModalPosition) => {
    setSelectedId(taskId);
    setModalPosition(position);
  };

  // Open add task modal
  const openAddTaskModal = () => {
    setShowAddTaskModal(true);
  };

  // Close add task modal
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
