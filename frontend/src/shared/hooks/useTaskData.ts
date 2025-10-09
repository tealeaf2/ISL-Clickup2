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

  // Dependencies list for edges
  const dependencies = useMemo((): TaskDependency[] => {
    const list: TaskDependency[] = [];
    (tasks || []).forEach(task => {
      (task.depends || []).forEach(depId => {
        list.push({ from: depId, to: task.id });
      });
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
    dependencies
  };
};
