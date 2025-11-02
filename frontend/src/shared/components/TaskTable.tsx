/**
 * TaskTable Component
 * 
 * A comprehensive dashboard component that displays ClickUp tasks in an organized
 * table/card layout. Features include:
 * - Team selection dropdown
 * - Task statistics (total, my tasks, completed, overdue)
 * - Filtered task sections (my tasks, overdue tasks, all tasks)
 * - Task refresh functionality
 * - Loading and error states
 * 
 * This component serves as the main task management interface and can notify
 * parent components when tasks are loaded via the onTasksUpdate callback.
 * 
 * @fileoverview Main dashboard component for displaying and managing ClickUp tasks
 */

import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import { useClickUp } from '../hooks/useClickUp';
import { TaskCard } from './TaskCard';

/**
 * Props for TaskTable component
 */
interface TaskTableProps {
  /** ClickUp API token for authentication */
  apiToken?: string;
  /** User email to filter "my tasks" */
  userEmail?: string;
  /** Callback function called when tasks are loaded/updated */
  onTasksUpdate?: (tasks: any[]) => void;
}

/**
 * TaskTable component - Main dashboard for ClickUp tasks
 * 
 * Displays a comprehensive dashboard with team selection, task statistics,
 * and filtered task lists. Automatically fetches teams and tasks, and can
 * notify parent components via onTasksUpdate callback.
 * 
 * @param {TaskTableProps} props - Component props
 * @returns {JSX.Element} A dashboard with task management interface
 * 
 * @example
 * <TaskTable 
 *   apiToken={token} 
 *   userEmail="user@example.com"
 *   onTasksUpdate={handleTasksUpdate}
 * />
 */
export const TaskTable: React.FC<TaskTableProps> = ({ 
  apiToken = 'pk_162298770_TTFOD6EK7IPQ39DI7OGZTT78PQTCBGC4',
  userEmail = 'strugglingstudent090@gmail.com',
  onTasksUpdate
}) => {
  const { 
    teams, 
    tasks, 
    loading, 
    error, 
    fetchTeams, 
    fetchTasks, 
    getMyTasks, 
    getTasksByStatus,
    getOverdueTasks 
  } = useClickUp(apiToken);

  const [selectedTeam, setSelectedTeam] = useState<string>('');

  // Fetch teams on component mount
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Update parent component when tasks change
  useEffect(() => {
    console.log('TaskTable: Tasks changed, count:', tasks.length, 'hasCallback:', !!onTasksUpdate);
    if (tasks.length > 0 && onTasksUpdate) {
      console.log('TaskTable: Calling onTasksUpdate with', tasks.length, 'tasks');
      onTasksUpdate(tasks);
    }
  }, [tasks, onTasksUpdate]);

  // Auto-select first team when teams are loaded
  useEffect(() => {
    if (teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0].id);
    }
  }, [teams, selectedTeam]);

  // Fetch tasks when team is selected
  useEffect(() => {
    if (selectedTeam) {
      fetchTasks(selectedTeam);
    }
  }, [selectedTeam, fetchTasks]);

  // Computed values
  const myTasks = getMyTasks(userEmail);
  const completedTasks = getTasksByStatus('complete');
  const overdueTasks = getOverdueTasks();

  /**
   * Handles the refresh button click to reload tasks for the selected team
   */
  const handleRefresh = () => {
    if (selectedTeam) {
      fetchTasks(selectedTeam);
    }
  };

  if (loading && teams.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Clock className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-xl text-gray-600">Loading ClickUp data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full p-6 bg-red-100 border border-red-300 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-700">Error Loading Data</h2>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={fetchTeams}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">ClickUp Dashboard</h1>
          
          {/* Team Selection and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-4">
              <select 
                value={selectedTeam} 
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white min-w-48"
              >
                <option value="">Select a team...</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              
              <button 
                onClick={handleRefresh}
                disabled={!selectedTeam || loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {tasks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total Tasks</h3>
              <p className="text-3xl font-bold text-blue-600">{tasks.length}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2">My Tasks</h3>
              <p className="text-3xl font-bold text-green-600">{myTasks.length}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Completed</h3>
              <p className="text-3xl font-bold text-purple-600">{completedTasks.length}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Overdue</h3>
              <p className="text-3xl font-bold text-red-600">{overdueTasks.length}</p>
            </div>
          </div>
        )}

        {/* My Tasks Section */}
        {myTasks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">My Tasks ({myTasks.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myTasks.map(task => (
                <TaskCard key={task.id} task={task} highlight={true} />
              ))}
            </div>
          </div>
        )}

        {/* Overdue Tasks Section */}
        {overdueTasks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-red-700 mb-6">Overdue Tasks ({overdueTasks.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {overdueTasks.map(task => (
                <div key={task.id} className="border-l-4 border-red-500">
                  <TaskCard task={task} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Tasks Section */}
        {tasks.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">All Tasks ({tasks.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {selectedTeam && tasks.length === 0 && !loading && (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">This team doesn't have any tasks yet, or they might all be completed.</p>
          </div>
        )}
      </div>
    </div>
  );
};
