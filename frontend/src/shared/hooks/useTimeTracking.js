import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for accurate time tracking with safeguards
 */
export const useTimeTracking = (tasks, setTasks) => {
  const [timeEntries, setTimeEntries] = useState({});
  const [isTracking, setIsTracking] = useState(false);

  // Safeguards for time tracking
  const validateTimeEntry = useCallback((taskId, hours, date) => {
    const errors = [];

    if (!taskId) {
      errors.push('Task ID is required');
    }

    if (hours <= 0) {
      errors.push('Hours must be greater than 0');
    }

    if (hours > 24) {
      errors.push('Hours cannot exceed 24 per day');
    }

    if (date > new Date()) {
      errors.push('Cannot log time for future dates');
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      errors.push('Task not found');
    }

    if (task && task.status === 'done') {
      errors.push('Cannot log time to completed tasks');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [tasks]);

  // Add time entry with validation
  const addTimeEntry = useCallback((taskId, hours, date = new Date(), description = '') => {
    const validation = validateTimeEntry(taskId, hours, date);
    
    if (!validation.isValid) {
      console.warn('Time entry validation failed:', validation.errors);
      return { success: false, errors: validation.errors };
    }

    const entryId = `${taskId}-${date.toISOString().split('T')[0]}-${Date.now()}`;
    const newEntry = {
      id: entryId,
      taskId,
      hours: parseFloat(hours),
      date: date.toISOString(),
      description,
      createdAt: new Date().toISOString()
    };

    setTimeEntries(prev => ({
      ...prev,
      [entryId]: newEntry
    }));

    // Update task's total logged time
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const currentLoggedTime = task.loggedTime || 0;
        return {
          ...task,
          loggedTime: currentLoggedTime + parseFloat(hours),
          lastTimeEntry: new Date().toISOString()
        };
      }
      return task;
    }));

    return { success: true, entry: newEntry };
  }, [validateTimeEntry, setTasks]);

  // Get time entries for a task
  const getTaskTimeEntries = useCallback((taskId) => {
    return Object.values(timeEntries).filter(entry => entry.taskId === taskId);
  }, [timeEntries]);

  // Get total logged time for a task
  const getTaskTotalTime = useCallback((taskId) => {
    const entries = getTaskTimeEntries(taskId);
    return entries.reduce((total, entry) => total + entry.hours, 0);
  }, [getTaskTimeEntries]);

  // Calculate time variance (logged vs estimated)
  const getTimeVariance = useCallback((task) => {
    const loggedTime = task.loggedTime || 0;
    const estimatedTime = task.estimatedHours || (task.duration * 8); // Assume 8 hours per day
    return {
      logged: loggedTime,
      estimated: estimatedTime,
      variance: loggedTime - estimatedTime,
      variancePercentage: estimatedTime > 0 ? ((loggedTime - estimatedTime) / estimatedTime) * 100 : 0
    };
  }, []);

  // Get time tracking summary for all tasks
  const getTimeSummary = useCallback(() => {
    return tasks.map(task => ({
      taskId: task.id,
      taskName: task.name,
      estimatedHours: task.estimatedHours || (task.duration * 8),
      loggedTime: task.loggedTime || 0,
      variance: getTimeVariance(task),
      entries: getTaskTimeEntries(task.id)
    }));
  }, [tasks, getTimeVariance, getTaskTimeEntries]);

  return {
    timeEntries,
    isTracking,
    setIsTracking,
    addTimeEntry,
    getTaskTimeEntries,
    getTaskTotalTime,
    getTimeVariance,
    getTimeSummary,
    validateTimeEntry
  };
};
