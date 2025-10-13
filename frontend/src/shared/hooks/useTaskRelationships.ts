import { useCallback } from 'react';
import type { Task, TaskStatus, TaskBlocker } from '../types';

/**
 * Custom hook for managing task relationships and auto-updating parent tasks based on children
 */
export const useTaskRelationships = (tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>) => {
  
  // Get all children of a task
  const getChildren = useCallback((parentId: string, currentTasks: Task[] | null = null): Task[] => {
    const tasksToUse = currentTasks || tasks;
    return tasksToUse.filter(task => task.parentId === parentId);
  }, [tasks]);

  // Get parent task
  const getParent = useCallback((childId: string, currentTasks: Task[] | null = null): Task | null => {
    const tasksToUse = currentTasks || tasks;
    const child = tasksToUse.find(task => task.id === childId);
    return child ? tasksToUse.find(task => task.id === child.parentId) || null : null;
  }, [tasks]);

  // Determine parent status based on children (bottom-up propagation)
  const calculateParentStatus = useCallback((children: Task[]): TaskStatus | null => {
    if (children.length === 0) return null;

    const statuses = children.map(child => child.status);
    
    // Merged hierarchy: blocked > in-progress > done > todo
    // If any child is blocked, parent is blocked
    if (statuses.includes('blocked')) return 'blocked';
    
    // If any child is in-progress, parent is in-progress
    if (statuses.includes('in-progress')) return 'in-progress';
    
    // If any child is todo, parent is todo (can't be done if children aren't started)
    if (statuses.includes('todo')) return 'todo';
    
    // If all children are done, parent is done
    if (statuses.every(status => status === 'done')) return 'done';
    
    // Mixed statuses fallback
    return 'in-progress';
  }, []);

  // Update parent task status based on children (bottom-up)
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

  // Main function to update all related tasks (now only updates parents)
  const updateRelatedTasks = useCallback((taskId: string, currentTasks: Task[] | null = null) => {
    // Update parent task based on children (bottom-up)
    updateParentStatus(taskId, currentTasks);
  }, [updateParentStatus]);

  // Get blockers for a task (tasks that block this task)
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
