'use client';

import { useDroppable } from '@dnd-kit/core';
import { TaskStatus, Task } from '../api/task';
import { TASK_STATUS_CONFIG } from '../constants/taskStatus';
import DraggableTaskCard from './DraggableTaskCard';

interface DroppableColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (taskId: number) => void;
  onTaskDelete: (taskId: number) => void;
  isDragging?: boolean;
  activeTask?: Task;
}

// Drop zone component for insertion between tasks
function DropZone({ status, position, activeTask }: { status: TaskStatus; position: number; activeTask?: Task }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `${status}-position-${position}`,
    data: {
      type: 'position',
      status,
      position,
    },
  });

  return (
    <div 
      ref={setNodeRef}
      className={`drop-zone ${isOver ? 'drop-zone-active' : ''}`}
    >
      {isOver && (
        <div className="drop-indicator">
          <div className="drop-indicator-line"></div>
          {activeTask && (
            <div className="drop-preview">
              <div className="drop-preview-card">
                <div className="drop-preview-title">{activeTask.title}</div>
                <div className="drop-preview-hint">↓ Drop here ↓</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DroppableColumn({ status, tasks, onTaskClick, onTaskDelete, isDragging = false, activeTask }: DroppableColumnProps) {
  const { isOver: isColumnOver, setNodeRef } = useDroppable({
    id: `column-${status}`,
    data: {
      type: 'column',
      status,
    },
  });

  const config = TASK_STATUS_CONFIG[status];

  return (
    <div 
      ref={setNodeRef}
      className={`kanban-column ${isColumnOver ? 'drop-target' : ''} ${isDragging ? 'dragging' : ''}`}
    >
      <div className="column-header">
        <h3 className="column-title">
          {config.fullLabel}
        </h3>
        <span className="task-count">
          {tasks.length}
        </span>
      </div>
      <div className="column-tasks">
        {tasks.length === 0 ? (
          <div className="empty-column-placeholder">
            {isColumnOver ? '✨ Drop here' : 'Drop tasks here'}
          </div>
        ) : (
          <>
            {/* Drop zone before first task */}
            <DropZone status={status} position={0} activeTask={activeTask} />
            
            {/* Render tasks with drop zones between them */}
            {tasks.map((task, index) => (
              <div key={task.id}>
                <DraggableTaskCard
                  task={task}
                  onTaskClick={onTaskClick}
                  onTaskDelete={onTaskDelete}
                />
                {/* Drop zone after each task (except the last one) */}
                {index < tasks.length - 1 && (
                  <DropZone status={status} position={index + 1} activeTask={activeTask} />
                )}
              </div>
            ))}
            
            {/* Drop zone after last task */}
            <DropZone status={status} position={tasks.length} activeTask={activeTask} />
          </>
        )}
      </div>
    </div>
  );
}