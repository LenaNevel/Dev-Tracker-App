'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTasks, getTask, updateTask, updateTaskStatus, Task, TaskStatus } from '../../api/task';
import TaskModal from "../../components/TaskModal";
import TaskEditModal from "../../components/TaskEditModal";
import DroppableColumn from "../../components/DroppableColumn";
import TaskDragOverlay from "../../components/TaskDragOverlay";
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverEvent,
  closestCenter
} from '@dnd-kit/core';
import './dashboard.css';
import '../../styles/dragAndDrop.css';

import { TASK_STATUS_CONFIG, TASK_STATUS_ORDER } from '../../constants/taskStatus';

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoadingTask, setIsLoadingTask] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Configure drag sensors for better mobile support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms delay for touch to prevent accidental drags
        tolerance: 8, // 8px tolerance for touch movement
      },
    })
  );

  useEffect(() => {
    const fetchTasks = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const response = await getTasks();
        if (response.status === 'success' && response.data) {
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

  const handleEditTask = async (taskId: number) => {
    setIsLoadingTask(true);
    try {
      const response = await getTask(taskId);
      if (response.status === 'success' && response.data) {
        setEditingTask(response.data.task);
        setEditModalOpen(true);
      } else {
        setError(response.error || 'Failed to load task details');
      }
    } catch (err) {
      setError('Failed to load task details');
    } finally {
      setIsLoadingTask(false);
    }
  };

  const handleTaskUpdate = (taskId: number, updatedTask: Task) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updatedTask } : task
    ));
    // Update the editing task with the new data so the modal shows updated content
    setEditingTask(updatedTask);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingTask(null);
  };

  const handleTaskDelete = (taskId: number) => {
    // Remove task from UI immediately (optimistic delete)
    setTasks(prev => prev.filter(task => task.id !== taskId));
    
    // Close modal if the deleted task was being viewed/edited
    if (editingTask && editingTask.id === taskId) {
      setEditModalOpen(false);
      setEditingTask(null);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'task') {
      setActiveTask(active.data.current.task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !active.data.current?.task) return;

    const task = active.data.current.task as Task;
    const newStatus = over.data.current?.status as TaskStatus;

    // Don't update if dropped in the same column
    if (task.status === newStatus) return;

    // Find the original task for rollback
    const originalTask = tasks.find(t => t.id === task.id);
    if (!originalTask) return;

    // Optimistic update
    setTasks(prev => prev.map(t => 
      t.id === task.id ? { ...t, status: newStatus } : t
    ));

    try {
      const response = await updateTaskStatus(task.id, newStatus);
      if (response.status === 'success' && response.data) {
        // Update with the actual response data
        setTasks(prev => prev.map(t => 
          t.id === task.id ? { ...t, ...response.data.task } : t
        ));
        // Clear any previous errors
        setError(null);
      } else {
        // Rollback on API error
        setTasks(prev => prev.map(t => 
          t.id === task.id ? originalTask : t
        ));
        setError(response.error || 'Failed to update task status');
      }
    } catch (err) {
      // Rollback on network error
      setTasks(prev => prev.map(t => 
        t.id === task.id ? originalTask : t
      ));
      setError('Failed to update task status');
    }
  };


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

  const groupedTasks = groupTasksByStatus(tasks);

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

        {error && <div className="error-message">{error}</div>}

        {tasks.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="kanban-board">
              {TASK_STATUS_ORDER.map((status) => (
                <DroppableColumn
                  key={status}
                  status={status}
                  tasks={groupedTasks[status]}
                  onTaskClick={handleEditTask}
                  onTaskDelete={handleTaskDelete}
                />
              ))}
            </div>
            <TaskDragOverlay activeTask={activeTask} />
          </DndContext>
        )}
      </div>
      <TaskModal />
      <TaskEditModal 
        isOpen={editModalOpen}
        task={editingTask}
        onClose={handleCloseEditModal}
        onUpdate={handleTaskUpdate}
        onDelete={handleTaskDelete}
      />
    </main>
  );
}
