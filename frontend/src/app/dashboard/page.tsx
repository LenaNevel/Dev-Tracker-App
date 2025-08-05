'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTasks, getTask, updateTask, updateTaskStatus, reorderTask, Task, TaskStatus } from '../../api/task';
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
  const [isProcessingDrop, setIsProcessingDrop] = useState(false);

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
    setIsProcessingDrop(true);

    if (!over || !active.data.current?.task) return;

    const draggedTask = active.data.current.task as Task;
    const targetStatus = over.data.current?.status as TaskStatus;
    
    // Find the original task for rollback
    const originalTask = tasks.find(t => t.id === draggedTask.id);
    if (!originalTask) return;

    // Calculate target position based on drop target type
    let targetPosition = 0;

    if (over.data.current?.type === 'position') {
      // Dropping on a specific position drop zone
      targetPosition = over.data.current.position as number;
    } else if (over.data.current?.type === 'task') {
      // Dropping on a specific task (insert before it)
      const targetTask = over.data.current.task as Task;
      const targetColumnTasks = tasks.filter(t => t.status === targetStatus && t.id !== draggedTask.id);
      targetPosition = targetColumnTasks.findIndex(t => t.id === targetTask.id);
      if (targetPosition === -1) targetPosition = targetColumnTasks.length;
    } else {
      // Dropping on column (add to end)
      const targetColumnTasks = tasks.filter(t => t.status === targetStatus && t.id !== draggedTask.id);
      targetPosition = targetColumnTasks.length;
    }

    // Skip if no actual change needed
    if (draggedTask.status === targetStatus) {
      // Get current position of the dragged task
      const allTasksInColumn = tasks.filter(t => t.status === targetStatus);
      const currentPosition = allTasksInColumn.findIndex(t => t.id === draggedTask.id);
      if (currentPosition === targetPosition) {
        setIsProcessingDrop(false);
        return;
      }
    }

    // Optimistic update - reorder tasks locally
    const updatedTask = { ...draggedTask, status: targetStatus };
    setTasks(prev => {
      // Remove the dragged task from its current position
      const withoutDragged = prev.filter(t => t.id !== draggedTask.id);
      
      // Get tasks in target column
      const targetTasks = withoutDragged.filter(t => t.status === targetStatus);
      const otherTasks = withoutDragged.filter(t => t.status !== targetStatus);
      
      // Insert at target position
      targetTasks.splice(targetPosition, 0, updatedTask);
      
      return [...otherTasks, ...targetTasks];
    });

    try {
      const response = await reorderTask(draggedTask.id, targetStatus, targetPosition);
      if (response.status === 'success' && response.data) {
        // Only update if there are meaningful differences to avoid unnecessary re-renders
        const apiTask = response.data.task;
        setTasks(prev => prev.map(t => {
          if (t.id === draggedTask.id) {
            // Preserve the optimistic update structure and only update sort_order if different
            const currentTask = t;
            const needsUpdate = 
              currentTask.sort_order !== apiTask.sort_order ||
              currentTask.status !== apiTask.status ||
              currentTask.updated_at !== apiTask.updated_at;
            
            if (needsUpdate) {
              return { ...currentTask, ...apiTask };
            }
            return currentTask;
          }
          return t;
        }));
        setError(null);
      } else {
        // Rollback on API error - smooth transition back
        setTasks(prev => {
          const rollbackTasks = prev.filter(t => t.id !== draggedTask.id);
          const targetTasks = rollbackTasks.filter(t => t.status === originalTask.status);
          const otherTasks = rollbackTasks.filter(t => t.status !== originalTask.status);
          
          // Find original position and restore smoothly
          const originalPosition = tasks.filter(t => t.status === originalTask.status)
            .findIndex(t => t.id === originalTask.id);
          targetTasks.splice(originalPosition, 0, originalTask);
          
          return [...otherTasks, ...targetTasks];
        });
        setError(response.error || 'Failed to reorder task');
      }
    } catch (err) {
      // Rollback on network error - smooth transition back  
      setTasks(prev => {
        const rollbackTasks = prev.filter(t => t.id !== draggedTask.id);
        const targetTasks = rollbackTasks.filter(t => t.status === originalTask.status);
        const otherTasks = rollbackTasks.filter(t => t.status !== originalTask.status);
        
        // Find original position and restore smoothly
        const originalPosition = tasks.filter(t => t.status === originalTask.status)
          .findIndex(t => t.id === originalTask.id);
        targetTasks.splice(originalPosition, 0, originalTask);
        
        return [...otherTasks, ...targetTasks];
      });
      setError('Failed to reorder task');
    } finally {
      // Add a small delay to ensure smooth transition completion
      setTimeout(() => setIsProcessingDrop(false), 150);
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
            <div className={`kanban-board ${isProcessingDrop ? 'processing-drop' : ''}`}>
              {TASK_STATUS_ORDER.map((status) => (
                <DroppableColumn
                  key={status}
                  status={status}
                  tasks={groupedTasks[status]}
                  onTaskClick={handleEditTask}
                  onTaskDelete={handleTaskDelete}
                  isDragging={activeTask !== null}
                  activeTask={activeTask}
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
