import { useState, useCallback } from 'react';
import type { ClickUpTask, Team } from '../types';

export const useClickUp = (apiToken: string) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [tasks, setTasks] = useState<ClickUpTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const baseUrl = 'https://api.clickup.com/api/v2';
  const headers = {
    'Authorization': apiToken,
    'Content-Type': 'application/json'
  };

  // Fetch teams
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

  // Fetch tasks from a specific team
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
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [apiToken]);

  // Get tasks assigned to a specific user
  const getMyTasks = useCallback((userEmail: string): ClickUpTask[] => {
    return tasks.filter(task => 
      task.assignees.some(assignee => assignee.email === userEmail)
    );
  }, [tasks]);

  // Get tasks by status
  const getTasksByStatus = useCallback((status: string): ClickUpTask[] => {
    return tasks.filter(task => task.status.status.toLowerCase() === status.toLowerCase());
  }, [tasks]);

  // Get overdue tasks
  const getOverdueTasks = useCallback((): ClickUpTask[] => {
    const now = Date.now();
    return tasks.filter(task => 
      task.due_date && 
      parseInt(task.due_date) < now && 
      task.status.type !== 'closed'
    );
  }, [tasks]);

  return {
    teams,
    tasks,
    loading,
    error,
    fetchTeams,
    fetchTasks,
    getMyTasks,
    getTasksByStatus,
    getOverdueTasks
  };
};
