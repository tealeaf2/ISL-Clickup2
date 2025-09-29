import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for managing automatic parent task status propagation
 * with precedence rules and debouncing
 */
export const useStatusPropagation = (tasks, setTasks, options = {}) => {
  const {
    debounceMs = 300,
    parentBlockedIfAnyChildBlocked = true,
    enableAutoPropagation = true
  } = options;

  const debounceTimeoutRef = useRef(null);
  const [isPropagating, setIsPropagating] = useState(false);

  // Status precedence rules (higher number = higher priority)
  const STATUS_PRECEDENCE = {
    'blocked': 4,
    'in-progress': 3,
    'done': 2,
    'todo': 1
  };

  // Calculate task depth for proper propagation order
  const calculateDepths = useCallback((tasksById) => {
    const depth = {};
    
    const getDepth = (taskId) => {
      if (depth[taskId] != null) return depth[taskId];
      const parent = tasksById[taskId]?.parentId;
      depth[taskId] = parent ? 1 + getDepth(parent) : 0;
      return depth[taskId];
    };

    Object.keys(tasksById).forEach(getDepth);
    return depth;
  }, []);

  // Get all children of a task
  const getChildren = useCallback((parentId, tasksById) => {
    return Object.values(tasksById).filter(task => task.parentId === parentId);
  }, []);

  // Determine new status based on children with precedence rules
  const calculateParentStatus = useCallback((children, currentStatus) => {
    if (children.length === 0) return currentStatus;

    // Get status counts
    const statusCounts = children.reduce((acc, child) => {
      acc[child.status] = (acc[child.status] || 0) + 1;
      return acc;
    }, {});

    // Apply precedence rules
    if (parentBlockedIfAnyChildBlocked && statusCounts.blocked > 0) {
      return 'blocked';
    }

    // Find highest precedence status among children
    let highestPrecedence = 0;
    let newStatus = currentStatus;

    Object.entries(statusCounts).forEach(([status, count]) => {
      const precedence = STATUS_PRECEDENCE[status] || 0;
      if (precedence > highestPrecedence) {
        highestPrecedence = precedence;
        newStatus = status;
      }
    });

    // Special case: if all children are done, parent should be done
    if (statusCounts.done === children.length && children.length > 0) {
      return 'done';
    }

    return newStatus;
  }, [parentBlockedIfAnyChildBlocked]);

  // Propagate status changes up the hierarchy
  const propagateStatusChanges = useCallback((updatedTasks, tasksById) => {
    const depths = calculateDepths(tasksById);
    const nextTasks = [...updatedTasks];
    let hasChanges = false;

    // Group tasks by parent for efficient processing
    const childrenByParent = {};
    updatedTasks.forEach(task => {
      if (task.parentId) {
        if (!childrenByParent[task.parentId]) {
          childrenByParent[task.parentId] = [];
        }
        childrenByParent[task.parentId].push(task);
      }
    });

    // Process parents from deepest to shallowest (bottom-up propagation)
    const parentIds = Object.keys(childrenByParent).sort((a, b) => depths[b] - depths[a]);

    parentIds.forEach(parentId => {
      const parentIndex = nextTasks.findIndex(t => t.id === parentId);
      if (parentIndex === -1) return;

      const parent = nextTasks[parentIndex];
      const children = childrenByParent[parentId];
      const newStatus = calculateParentStatus(children, parent.status);

      if (newStatus !== parent.status) {
        nextTasks[parentIndex] = {
          ...parent,
          status: newStatus,
          lastStatusUpdate: new Date().toISOString()
        };
        hasChanges = true;
        console.log(`Status propagated: ${parent.id} -> ${newStatus} (children: ${children.map(c => `${c.id}:${c.status}`).join(', ')})`);
      }
    });

    return { nextTasks, hasChanges };
  }, [calculateDepths, calculateParentStatus]);

  // Debounced status propagation
  const debouncedPropagate = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setIsPropagating(true);
      
      const tasksById = Object.fromEntries(tasks.map(t => [t.id, t]));
      const { nextTasks, hasChanges } = propagateStatusChanges(tasks, tasksById);
      
      if (hasChanges) {
        setTasks(nextTasks);
      }
      
      setIsPropagating(false);
    }, debounceMs);
  }, [tasks, setTasks, propagateStatusChanges, debounceMs]);

  // Auto-propagate when tasks change
  useEffect(() => {
    if (enableAutoPropagation && tasks.length > 0) {
      debouncedPropagate();
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [tasks, enableAutoPropagation, debouncedPropagate]);

  // Manual propagation trigger
  const triggerPropagation = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debouncedPropagate();
  }, [debouncedPropagate]);

  return {
    isPropagating,
    triggerPropagation,
    STATUS_PRECEDENCE
  };
};
