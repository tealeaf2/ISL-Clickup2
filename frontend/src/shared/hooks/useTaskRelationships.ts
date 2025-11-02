/**
 * useTaskRelationships Hook
 * 
 * A custom React hook that manages task relationships (parent-child) and provides
 * utilities for navigating and analyzing task hierarchies. Currently provides
 * read-only relationship analysis; status propagation is disabled in read-only mode.
 * 
 * Features:
 * - Get children of a task
 * - Get parent of a task
 * - Calculate parent status based on children (for future status propagation)
 * - Identify blockers (tasks blocking a parent)
 * 
 * @fileoverview Custom hook for managing task relationships and hierarchies
 */

import { useCallback } from 'react';
import type { Task, TaskStatus, TaskBlocker } from '../types';

/**
 * Custom hook for managing task relationships and auto-updating parent tasks based on children
 * 
 * Provides utilities for navigating parent-child relationships and analyzing
 * task hierarchies. Status propagation features are kept for potential future use
 * but are currently disabled in read-only mode.
 * 
 * @param {Task[]} tasks - Current array of tasks
 * @param {React.Dispatch<React.SetStateAction<Task[]>>} setTasks - State setter for tasks array
 * @returns {Object} Object containing relationship utility functions
 * @returns {Function} getChildren - Function to get all children of a task
 * @returns {Function} getParent - Function to get the parent of a task
 * @returns {Function} calculateParentStatus - Function to calculate parent status from children
 * @returns {Function} updateRelatedTasks - Function to update related tasks (currently disabled)
 * @returns {Function} getBlockers - Function to get tasks blocking a given task
 */
export const useTaskRelationships = (tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>) => {
  
  /**
   * Gets all child tasks of a parent task
   * 
   * @param {string} parentId - The ID of the parent task
   * @param {Task[]|null} [currentTasks=null] - Optional tasks array to use instead of current state
   * @returns {Task[]} Array of child tasks
   */
  const getChildren = useCallback((parentId: string, currentTasks: Task[] | null = null): Task[] => {
    const tasksToUse = currentTasks || tasks;
    return tasksToUse.filter(task => task.parentId === parentId);
  }, [tasks]);

  /**
   * Gets the parent task of a child task
   * 
   * @param {string} childId - The ID of the child task
   * @param {Task[]|null} [currentTasks=null] - Optional tasks array to use instead of current state
   * @returns {Task|null} The parent task, or null if not found or task has no parent
   */
  const getParent = useCallback((childId: string, currentTasks: Task[] | null = null): Task | null => {
    const tasksToUse = currentTasks || tasks;
    const child = tasksToUse.find(task => task.id === childId);
    return child ? tasksToUse.find(task => task.id === child.parentId) || null : null;
  }, [tasks]);

  /**
   * Determines parent status based on children's statuses (bottom-up propagation)
   * 
   * Status hierarchy: blocked > in-progress > todo
   * - If any child is blocked, parent is blocked
   * - Else if any child is in-progress, parent is in-progress
   * - Else if any child is todo, parent is todo
   * 
   * Note: This is kept for potential future use, but status propagation is currently disabled
   * 
   * @param {Task[]} children - Array of child tasks
   * @returns {TaskStatus|null} The calculated parent status, or null if no children
   */
  const calculateParentStatus = useCallback((children: Task[]): TaskStatus | null => {
    if (children.length === 0) return null;

    const statuses = children.map(child => child.status);
    
    // Status hierarchy: blocked > in-progress > todo
    // If any child is blocked, parent is blocked
    if (statuses.includes('blocked')) return 'blocked';
    
    // If any child is in-progress, parent is in-progress
    if (statuses.includes('in-progress')) return 'in-progress';
    
    // If any child is todo, parent is todo
    if (statuses.includes('todo')) return 'todo';
    
    // All children completed (shouldn't happen since completed tasks are removed)
    // Fallback to in-progress
    return 'in-progress';
  }, []);

  /**
   * Updates parent task status based on children (bottom-up propagation)
   * 
   * Note: Currently disabled in read-only mode, kept for potential future use
   * 
   * @param {string} taskId - The ID of the task whose parent should be updated
   * @param {Task[]|null} [currentTasks=null] - Optional tasks array to use instead of current state
   */
  const updateParentStatus = useCallback((taskId: string, currentTasks: Task[] | null = null) => {
    const tasksToUse = currentTasks || tasks;
    const parent = getParent(taskId, tasksToUse);
    if (!parent) {
      return;
    }

    const children = getChildren(parent.id, tasksToUse);
    const newStatus = calculateParentStatus(children);
    
    if (newStatus && newStatus !== parent.status) {
      console.log(`Updating parent task "${parent.name}" status from "${parent.status}" to "${newStatus}" based on children`);
      
      setTasks(prev => {
        const updatedTasks = prev.map(task => 
          task.id === parent.id 
            ? { ...task, status: newStatus }
            : task
        );
        
        // Recursively update grandparent if needed
        setTimeout(() => {
          updateParentStatus(parent.id, updatedTasks);
        }, 50);
        
        return updatedTasks;
      });
    }
  }, [getParent, getChildren, calculateParentStatus, setTasks, tasks]);

  /**
   * Main function to update all related tasks (currently only updates parents)
   * 
   * Note: Currently disabled in read-only mode, kept for potential future use
   * 
   * @param {string} taskId - The ID of the task to update related tasks for
   * @param {Task[]|null} [currentTasks=null] - Optional tasks array to use instead of current state
   */
  const updateRelatedTasks = useCallback((taskId: string, currentTasks: Task[] | null = null) => {
    // Update parent task based on children (bottom-up)
    updateParentStatus(taskId, currentTasks);
  }, [updateParentStatus]);

  /**
   * Gets blockers for a task (tasks that block this task)
   * 
   * Currently identifies blocked children that block their parent task.
   * A task is considered a blocker if it is a child of the given task and has
   * status 'blocked'.
   * 
   * @param {Task} task - The task to get blockers for
   * @returns {TaskBlocker[]} Array of blocker objects containing blocker ID, owner, type, and timestamp
   */
  const getBlockers = useCallback((task: Task): TaskBlocker[] => {
    const blockers: TaskBlocker[] = [];
    
    // Check if any children are blocking this parent task
    const children = getChildren(task.id);
    children.forEach(child => {
      if (child.status === 'blocked') {
        blockers.push({
          by: child.id,
          owner: child.owner,
          type: 'child',
          since: child.lastUpdated || new Date().toISOString()
        });
      }
    });
    
    return blockers;
  }, [tasks, getChildren]);

  return {
    getChildren,
    getParent,
    calculateParentStatus,
    updateRelatedTasks,
    getBlockers
  };
};
