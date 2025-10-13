import { useState, useMemo, useEffect } from 'react';
import type { Task, TaskDependency } from '../types';

/**
 * Custom hook for managing task data and derived computations
 */
export const useTaskData = (initialTasks: Task[] = []) => {
  console.log('useTaskData called with initialTasks:', initialTasks?.length || 0);
  const [tasks, setTasks] = useState<Task[]>(() => {
    console.log('useTaskData useState initializer called with:', initialTasks?.length || 0);
    return initialTasks || [];
  });

  // Update tasks when initialTasks changes
  useEffect(() => {
    console.log('useTaskData useEffect: initialTasks changed to:', initialTasks?.length || 0);
    if (initialTasks && initialTasks.length > 0) {
      setTasks(initialTasks);
    }
  }, [initialTasks]);

  // Derived maps for efficient lookups
  const tasksById = useMemo(() => 
    Object.fromEntries((tasks || []).map(task => [task.id, task])), 
    [tasks]
  );

  const childrenOf = useMemo(() => {
    const map: Record<string, string[]> = {};
    (tasks || []).forEach(task => {
      if (task.parentId) {
        (map[task.parentId] ||= []).push(task.id);
      }
    });
    return map;
  }, [tasks]);

  // Calculate bounds
  const maxDay = useMemo(() => {
    const taskArray = tasks || [];
    if (taskArray.length === 0) return 0;
    return Math.max(...taskArray.map(task => task.start + task.duration), 0);
  }, [tasks]);

  const maxLane = useMemo(() => {
    const taskArray = tasks || [];
    if (taskArray.length === 0) return 0;
    return Math.max(...taskArray.map(task => task.lane), 0);
  }, [tasks]);

  // Parent-child relationships for edges (arrows from parent to child)
  const parentChildEdges = useMemo((): TaskDependency[] => {
    const list: TaskDependency[] = [];
    (tasks || []).forEach(task => {
      if (task.parentId) {
        list.push({ from: task.parentId, to: task.id });
      }
    });
    return list;
  }, [tasks]);

  return {
    tasks,
    setTasks,
    tasksById,
    childrenOf,
    maxDay,
    maxLane,
    dependencies: parentChildEdges // Renamed for clarity: now contains parent-child edges
  };
};
