import { useState, useMemo, useEffect } from 'react';

/**
 * Custom hook for managing task data and derived computations
 */
export const useTaskData = (initialTasks = []) => {
  const [tasks, setTasks] = useState(() => initialTasks);

  // Derived maps for efficient lookups
  const tasksById = useMemo(() => 
    Object.fromEntries(tasks.map(task => [task.id, task])), 
    [tasks]
  );

  const childrenOf = useMemo(() => {
    const map = {};
    tasks.forEach(task => {
      if (task.parentId) {
        (map[task.parentId] ||= []).push(task.id);
      }
    });
    return map;
  }, [tasks]);

  // Calculate bounds
  const maxDay = useMemo(() => 
    Math.max(...tasks.map(task => task.start + task.duration), 0), 
    [tasks]
  );

  const maxLane = useMemo(() => 
    Math.max(...tasks.map(task => task.lane), 0), 
    [tasks]
  );

  // Dependencies list for edges
  const dependencies = useMemo(() => {
    const list = [];
    tasks.forEach(task => {
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
