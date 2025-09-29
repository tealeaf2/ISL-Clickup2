import { useCallback } from 'react';

/**
 * Custom hook for managing task relationships and auto-updating parent/dependent tasks
 */
export const useTaskRelationships = (tasks, setTasks) => {
  
  // Get all children of a task
  const getChildren = useCallback((parentId, currentTasks = null) => {
    const tasksToUse = currentTasks || tasks;
    return tasksToUse.filter(task => task.parentId === parentId);
  }, [tasks]);

  // Get all dependents of a task
  const getDependents = useCallback((taskId, currentTasks = null) => {
    const tasksToUse = currentTasks || tasks;
    return tasksToUse.filter(task => task.depends && task.depends.includes(taskId));
  }, [tasks]);

  // Get parent task
  const getParent = useCallback((childId, currentTasks = null) => {
    const tasksToUse = currentTasks || tasks;
    const child = tasksToUse.find(task => task.id === childId);
    return child ? tasksToUse.find(task => task.id === child.parentId) : null;
  }, [tasks]);

  // Determine parent status based on children
  const calculateParentStatus = useCallback((children) => {
    if (children.length === 0) return null;

    const statuses = children.map(child => child.status);
    
    // New hierarchy: blocked > in-progress > done > todo
    // If one child is blocked, parent is blocked (overrides in-progress rule)
    if (statuses.includes('blocked')) return 'blocked';
    
    // If one child is in-progress, parent is in-progress
    if (statuses.includes('in-progress')) return 'in-progress';
    
    // If all children are done, parent is done
    if (statuses.every(status => status === 'done')) return 'done';
    
    // If all children are todo, parent is todo
    if (statuses.every(status => status === 'todo')) return 'todo';
    
    // Mixed statuses (shouldn't happen with above logic, but fallback)
    return 'in-progress';
  }, []);

  // Determine dependent status based on dependencies
  const calculateDependentStatus = useCallback((dependencies) => {
    if (dependencies.length === 0) return null;

    const dependencyStatuses = dependencies.map(dep => dep.status);
    
    // New dependency rules:
    // If any dependency is blocked, dependent is blocked
    if (dependencyStatuses.includes('blocked')) return 'blocked';
    
    // If any dependency is in-progress, dependent is todo
    if (dependencyStatuses.includes('in-progress')) return 'todo';
    
    // If any dependency is todo, dependent is todo
    if (dependencyStatuses.includes('todo')) return 'todo';
    
    // If all dependencies are done, dependent is in-progress
    if (dependencyStatuses.every(status => status === 'done')) return 'in-progress';
    
    // Fallback
    return 'todo';
  }, []);

  // Update parent task status based on children
  const updateParentStatus = useCallback((taskId, currentTasks = null) => {
    const tasksToUse = currentTasks || tasks;
    const parent = getParent(taskId, tasksToUse);
    if (!parent) {
      return;
    }

    const children = getChildren(parent.id, tasksToUse);
    const newStatus = calculateParentStatus(children);
    
    if (newStatus && newStatus !== parent.status) {
      
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

  // Update dependent task status based on dependencies
  const updateDependentStatus = useCallback((taskId, currentTasks = null) => {
    const tasksToUse = currentTasks || tasks;
    const dependents = getDependents(taskId, tasksToUse);
    
    dependents.forEach(dependent => {
      const dependencies = dependent.depends.map(depId => 
        tasksToUse.find(task => task.id === depId)
      ).filter(Boolean);
      
      const newStatus = calculateDependentStatus(dependencies);
      
      if (newStatus && newStatus !== dependent.status) {
        console.log(`Updating dependent task "${dependent.name}" status from "${dependent.status}" to "${newStatus}" based on dependencies`);
        
        setTasks(prev => {
          const updatedTasks = prev.map(task => 
            task.id === dependent.id 
              ? { ...task, status: newStatus }
              : task
          );
          
          // Recursively update dependents of this dependent
          setTimeout(() => {
            updateDependentStatus(dependent.id, updatedTasks);
          }, 50);
          
          return updatedTasks;
        });
      }
    });
  }, [getDependents, tasks, calculateDependentStatus, setTasks]);


  // Main function to update all related tasks
  const updateRelatedTasks = useCallback((taskId, currentTasks = null) => {
    // Update parent task
    updateParentStatus(taskId, currentTasks);
    
    // Update dependent tasks
    updateDependentStatus(taskId, currentTasks);
  }, [updateParentStatus, updateDependentStatus]);

  return {
    getChildren,
    getDependents,
    getParent,
    calculateParentStatus,
    calculateDependentStatus,
    updateRelatedTasks
  };
};
