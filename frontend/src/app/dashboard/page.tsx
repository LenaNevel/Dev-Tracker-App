'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTasks, Task, TaskStatus } from '../../api/task';
import TaskModal from "../../components/TaskModal";
import './dashboard.css';

const STATUS_CONFIG = {
  backlog: { label: '🧠 Backlog', emoji: '🧠' },
  in_progress: { label: '🔨 In Progress', emoji: '🔨' },
  in_review: { label: '🧐 In Review', emoji: '🧐' },
  done: { label: '✅ Done', emoji: '✅' },
  wont_do: { label: '🚫 Won\'t Do', emoji: '🚫' }
};

const STATUS_ORDER: TaskStatus[] = ['backlog', 'in_progress', 'in_review', 'done', 'wont_do'];

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');

  useEffect(() => {
    const fetchTasks = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const response = await getTasks();
        if (response.status === 'success' && response.data) {
          console.log('DEBUG: Received tasks:', response.data.tasks);
          setTasks(response.data.tasks);
        } else {
          console.error('API Error:', response);
          setError(response.error || 'Failed to fetch tasks');
        }
      } catch (err) {
        console.error('Request Error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [isAuthenticated]);

  const groupTasksByStatus = (tasks: Task[]) => {
    const grouped: Record<TaskStatus, Task[]> = {
      backlog: [],
      in_progress: [],
      in_review: [],
      done: [],
      wont_do: []
    };
    
    tasks.forEach(task => {
      // Ensure task.status is a valid status, fallback to 'backlog' if not
      const status = (task.status in grouped) ? task.status : 'backlog';
      grouped[status].push(task);
    });
    
    return grouped;
  };

  if (loading) {
    return (
      <main className="page">
        <div className="dashboard-container">
          <div className="dashboard-title-section">
            <h2 className="dashboard-title">Loading your tasks...</h2>
          </div>
        </div>
        <TaskModal />
      </main>
    );
  }

  const filteredTasks = statusFilter === 'all' ? tasks : tasks.filter(task => task.status === statusFilter);
  const groupedTasks = groupTasksByStatus(filteredTasks);

  return (
    <main className="page">
      <div className="dashboard-container">
        <div className="dashboard-title-section">
          <h2 className="dashboard-title">Your Task Dashboard</h2>
          {tasks.length === 0 && (
            <div className="empty-state">
              <p className="dashboard-subtitle">
                You haven't spun up any tasks yet.
              </p>
              <p className="dashboard-subtitle">
                Click "🔧 Spin Up a Task" in the header to get started! 🚀
              </p>
            </div>
          )}
        </div>

        {tasks.length > 0 && (
          <div className="filter-section">
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All Tasks
              </button>
              <button 
                className={`filter-btn ${statusFilter === 'backlog' ? 'active' : ''}`}
                onClick={() => setStatusFilter('backlog')}
              >
                🧠 Backlog
              </button>
              <button 
                className={`filter-btn ${statusFilter === 'in_progress' ? 'active' : ''}`}
                onClick={() => setStatusFilter('in_progress')}
              >
                🔨 In Progress
              </button>
              <button 
                className={`filter-btn ${statusFilter === 'done' ? 'active' : ''}`}
                onClick={() => setStatusFilter('done')}
              >
                ✅ Done
              </button>
            </div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {tasks.length > 0 && (
          <div className="kanban-board">
            {STATUS_ORDER.map((status) => (
              <div key={status} className="kanban-column">
                <div className="column-header">
                  <h3 className="column-title">
                    {STATUS_CONFIG[status].label}
                  </h3>
                  <span className="task-count">
                    {groupedTasks[status].length}
                  </span>
                </div>
                <div className="column-tasks">
                  {groupedTasks[status].map((task) => (
                    <div key={task.id} className="task-card">
                      <h4 className="task-title">{task.title}</h4>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <TaskModal />
    </main>
  );
}
