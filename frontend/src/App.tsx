import React, { useState, useEffect, useCallback } from 'react'
import { Calendar, User, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

// `npm run dev` in command prompt
interface ClickUpUser {
  id: number;
  username: string;
  email: string;
  color: string;
  profilePicture?: string;
}

interface ClickUpStatus {
  status: string;
  color: string;
  type: string;
  orderindex: number;
}

interface ClickUpPriority {
  id: string;
  priority: string;
  color: string;
  orderindex: string;
}
interface ClickUpTask {
  id: string;
  name: string;
  text_content: string;
  description: string;
  status: ClickUpStatus;
  orderindex: string;
  date_created: string;
  date_updated: string;
  date_closed?: string;
  date_done?: string;
  creator: ClickUpUser;
  assignees: ClickUpUser[];
  watchers: ClickUpUser[];
  checklists: any[];
  tags: any[];
  parent?: string;
  priority?: ClickUpPriority;
  due_date?: string;
  start_date?: string;
  points?: number;
  time_estimate?: number;
  time_spent?: number;
  custom_fields: any[];
  dependencies: string[];
  linked_tasks: string[];
  team_id: string;
  url: string;
  permission_level: string;
  list: any;
  project: any;
  folder: any;
  space: any;
}

interface Team {
  id: string;
  name: string;
  color?: string;
}

// Custom hook for ClickUp API integration
const useClickUp = (apiToken: string) => {
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

// Main App component
const App: React.FC = () => {
  // Your ClickUp API token (in production, use environment variables)
  const API_TOKEN = 'pk_162298770_TTFOD6EK7IPQ39DI7OGZTT78PQTCBGC4';
  const USER_EMAIL = 'strugglingstudent090@gmail.com';
  
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
  } = useClickUp(API_TOKEN);

  const [selectedTeam, setSelectedTeam] = useState<string>('');

  // Fetch teams on component mount
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

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
  const myTasks = getMyTasks(USER_EMAIL);
  const completedTasks = getTasksByStatus('complete');
  const overdueTasks = getOverdueTasks();

  const handleRefresh = () => {
    if (selectedTeam) {
      fetchTasks(selectedTeam);
    }
  };

  const getPriorityColor = (priority?: ClickUpPriority): string => {
    if (!priority) return 'text-gray-600 bg-gray-100';
    
    switch (priority.priority.toLowerCase()) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return 'No due date';
    return new Date(parseInt(dateStr)).toLocaleDateString();
  };

  const TaskCard: React.FC<{ task: ClickUpTask; highlight?: boolean }> = ({ task, highlight = false }) => (
    <div className={`p-4 rounded-lg border hover:shadow-md transition-shadow ${
      highlight ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 truncate pr-2">{task.name}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
          {task.priority?.priority || 'No Priority'}
        </span>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
        <div className="flex items-center gap-1">
          <CheckCircle className="w-4 h-4" />
          <span>{task.status.status}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(task.due_date)}</span>
        </div>
      </div>
      
      {task.assignees.length > 0 && (
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
          <User className="w-4 h-4" />
          <span>{task.assignees.map(a => a.username).join(', ')}</span>
        </div>
      )}
      
      <a 
        href={task.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        View in ClickUp →
      </a>
    </div>
  );

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

export default App;