/**
 * useClickUp Hook
 * 
 * A custom React hook for interacting with the ClickUp API v2. Provides state
 * management and functions for fetching teams and tasks, with built-in error
 * handling and loading states.
 * 
 * Features:
 * - Team fetching and management
 * - Task fetching from teams with customizable parameters
 * - Automatic comment fetching for all tasks
 * - Task filtering utilities (by user, status, overdue)
 * - Automatic error handling and loading state management
 * - Uses Vite proxy for CORS-free development
 * 
 * @fileoverview Custom hook for ClickUp API integration
 */

import { useState, useCallback } from 'react';
import type { ClickUpTask, Team } from '../types';

/**
 * Custom hook for ClickUp API integration
 * 
 * Provides state and functions for fetching and managing ClickUp teams and tasks.
 * All API requests use the Vite development proxy to avoid CORS issues.
 * 
 * @param {string} apiToken - ClickUp API token for authentication
 * @returns {Object} Object containing teams, tasks, loading state, error state, and API functions
 * @returns {Team[]} teams - Array of teams fetched from ClickUp
 * @returns {ClickUpTask[]} tasks - Array of tasks fetched from ClickUp
 * @returns {Map<string, string[]>} taskComments - Map of task IDs to their comment arrays
 * @returns {boolean} loading - Whether an API request is currently in progress
 * @returns {string} error - Error message if an API request failed
 * @returns {Function} fetchTeams - Function to fetch all teams for the authenticated user
 * @returns {Function} fetchTasks - Function to fetch tasks from a specific team (also fetches comments)
 * @returns {Function} getMyTasks - Function to filter tasks by user email
 * @returns {Function} getTasksByStatus - Function to filter tasks by status
 * @returns {Function} getOverdueTasks - Function to get tasks that are overdue
 * 
 * @example
 * const { teams, tasks, loading, fetchTeams, fetchTasks } = useClickUp(apiToken);
 */
export const useClickUp = (apiToken: string) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [tasks, setTasks] = useState<ClickUpTask[]>([]);
  const [taskComments, setTaskComments] = useState<Map<string, string[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Use proxy URL to avoid CORS issues in development
  // The Vite proxy will forward /api/clickup/* to https://api.clickup.com/api/v2/*
  const baseUrl = '/api/clickup';
  const headers = {
    'Authorization': apiToken,
    'Content-Type': 'application/json'
  };

  /**
   * Fetches all teams accessible to the authenticated user
   * 
   * Updates the teams state with the fetched teams. Sets loading state during
   * the request and error state if the request fails.
   * 
   * @returns {Promise<void>} Promise that resolves when teams are fetched
   */
  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${baseUrl}/team`, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setTeams(data.teams || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  }, [apiToken]);

  /**
   * Fetches tasks from a specific team
   * 
   * Fetches tasks from the specified team with default parameters (excludes closed
   * tasks, includes subtasks). Additional query parameters can be provided.
   * 
   * @param {string} teamId - The ID of the team to fetch tasks from
   * @param {Record<string, string>} [params={}] - Additional query parameters for the API request
   * @returns {Promise<void>} Promise that resolves when tasks are fetched
   */
  const fetchTasks = useCallback(async (teamId: string, params: Record<string, string> = {}) => {
    try {
      setLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams({
        include_closed: 'false',
        subtasks: 'true',
        ...params
      });
      
      const response = await fetch(`${baseUrl}/team/${teamId}/task?${queryParams}`, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const fetchedTasks = data.tasks || [];
      setTasks(fetchedTasks);
      
      // Fetch comments for each task
      const commentsMap = new Map<string, string[]>();
      await Promise.all(
        fetchedTasks.map(async (task: ClickUpTask) => {
          try {
            const commentResponse = await fetch(`${baseUrl}/task/${task.id}/comment`, { headers });
            if (commentResponse.ok) {
              const commentData = await commentResponse.json();
              const comments = commentData.comments || [];
              if (comments.length > 0) {
                const allComments = comments
                  .map((c: any) => c.comment_text || '')
                  .filter((text: string) => text.trim());
                commentsMap.set(task.id, allComments);
              }
            }
          } catch (err) {
            // Silently fail for individual comment fetches
            console.error(`Failed to fetch comments for task ${task.id}:`, err);
          }
        })
      );
      
      setTaskComments(commentsMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [apiToken]);

  /**
   * Filters tasks to return only those assigned to a specific user
   * 
   * @param {string} userEmail - The email address of the user to filter by
   * @returns {ClickUpTask[]} Array of tasks assigned to the specified user
   */
  const getMyTasks = useCallback((userEmail: string): ClickUpTask[] => {
    return tasks.filter(task => 
      task.assignees.some(assignee => assignee.email === userEmail)
    );
  }, [tasks]);

  /**
   * Filters tasks to return only those with a specific status
   * 
   * Status comparison is case-insensitive.
   * 
   * @param {string} status - The status to filter by (e.g., 'complete', 'in progress')
   * @returns {ClickUpTask[]} Array of tasks with the specified status
   */
  const getTasksByStatus = useCallback((status: string): ClickUpTask[] => {
    return tasks.filter(task => task.status.status.toLowerCase() === status.toLowerCase());
  }, [tasks]);

  /**
   * Filters tasks to return only those that are overdue
   * 
   * A task is considered overdue if:
   * - It has a due_date set
   * - The due_date is in the past (before now)
   * - The task status is not 'closed'
   * 
   * @returns {ClickUpTask[]} Array of tasks that are overdue
   */
  const getOverdueTasks = useCallback((): ClickUpTask[] => {
    const now = Date.now();
    return tasks.filter(task => {
      if (!task.due_date) return false;
      // Handle both string and number due_date formats
      const dueDateValue = typeof task.due_date === 'number' 
        ? task.due_date 
        : parseInt(task.due_date);
      return dueDateValue < now && task.status.type !== 'closed';
    });
  }, [tasks]);

  /**
   * TODO: Update task in ClickUp API
   * 
   * This function will send a PUT/PATCH request to update a task in ClickUp.
   * Should handle updating task properties like name, status, dates, assignees, etc.
   * 
   * @param {string} taskId - The ID of the task to update
   * @param {Object} updates - Object containing the fields to update
   * @param {string} [updates.name] - New task name
   * @param {string} [updates.status] - New task status
   * @param {number|string} [updates.start_date] - New start date (timestamp or ISO string)
   * @param {number|string} [updates.due_date] - New due date (timestamp or ISO string)
   * @param {string[]} [updates.assignees] - Array of user IDs to assign
   * @param {string} [updates.priority] - New priority level
   * @param {string} [updates.description] - New task description
   * @returns {Promise<ClickUpTask>} Promise that resolves with the updated task
   * 
   * @example
   * await updateTask('task123', { 
   *   status: 'in progress',
   *   due_date: Date.now() + 7*24*60*60*1000 
   * });
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateTask = useCallback(async (taskId: string, updates: {
    name?: string;
    status?: string;
    start_date?: number | string;
    due_date?: number | string;
    assignees?: string[];
    priority?: string;
    description?: string;
  }): Promise<ClickUpTask> => {
    // TODO: Implement API call to ClickUp
    // PUT /api/clickup/task/{task_id}
    // Headers: Authorization, Content-Type
    // Body: { ...updates }
    // Handle response and update local tasks state
    // Handle errors appropriately
    
    throw new Error('updateTask not yet implemented');
  }, [apiToken]);

  /**
   * TODO: Update task dates in ClickUp API
   * 
   * Convenience function specifically for updating task start and due dates.
   * This will be called when a task is moved or resized on the graph.
   * 
   * @param {string} taskId - The ID of the task to update
   * @param {number|string} startDate - New start date (timestamp or ISO string)
   * @param {number|string} dueDate - New due date (timestamp or ISO string)
   * @returns {Promise<ClickUpTask>} Promise that resolves with the updated task
   * 
   * @example
   * await updateTaskDates('task123', Date.now(), Date.now() + 7*24*60*60*1000);
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateTaskDates = useCallback(async (
    taskId: string, 
    startDate: number | string, 
    dueDate: number | string
  ): Promise<ClickUpTask> => {
    // TODO: Implement API call to ClickUp
    // PUT /api/clickup/task/{task_id}
    // Update start_date and due_date fields
    // Handle response and update local tasks state
    
    throw new Error('updateTaskDates not yet implemented');
  }, [apiToken]);

  /**
   * TODO: Update task status in ClickUp API
   * 
   * Convenience function specifically for updating task status.
   * This will be called when a task status is changed on the graph.
   * 
   * @param {string} taskId - The ID of the task to update
   * @param {string} status - New status (must match a valid ClickUp status for the workspace)
   * @returns {Promise<ClickUpTask>} Promise that resolves with the updated task
   * 
   * @example
   * await updateTaskStatus('task123', 'in progress');
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateTaskStatus = useCallback(async (
    taskId: string, 
    status: string
  ): Promise<ClickUpTask> => {
    // TODO: Implement API call to ClickUp
    // PUT /api/clickup/task/{task_id}
    // Update status field
    // Note: Status must be a valid status ID or name for the workspace
    // Handle response and update local tasks state
    
    throw new Error('updateTaskStatus not yet implemented');
  }, [apiToken]);

  /**
   * TODO: Batch update multiple tasks in ClickUp API
   * 
   * Updates multiple tasks in a single API call for efficiency.
   * This will be called when multiple tasks are moved or updated at once.
   * 
   * @param {Array<{taskId: string, updates: Object}>} taskUpdates - Array of task update objects
   * @returns {Promise<ClickUpTask[]>} Promise that resolves with updated tasks
   * 
   * @example
   * await batchUpdateTasks([
   *   { taskId: 'task1', updates: { start_date: Date.now() } },
   *   { taskId: 'task2', updates: { due_date: Date.now() + 86400000 } }
   * ]);
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const batchUpdateTasks = useCallback(async (
    taskUpdates: Array<{ taskId: string; updates: Record<string, any> }>
  ): Promise<ClickUpTask[]> => {
    // TODO: Implement batch update API call to ClickUp
    // May need to make multiple PUT requests or use a batch endpoint if available
    // Handle partial failures appropriately
    // Update local tasks state after successful updates
    
    throw new Error('batchUpdateTasks not yet implemented');
  }, [apiToken]);

  return {
    teams,
    tasks,
    taskComments,
    loading,
    error,
    fetchTeams,
    fetchTasks,
    getMyTasks,
    getTasksByStatus,
    getOverdueTasks,
    // TODO: Export these update functions when implemented
    // updateTask,
    // updateTaskDates,
    // updateTaskStatus,
    // batchUpdateTasks
  };
};
