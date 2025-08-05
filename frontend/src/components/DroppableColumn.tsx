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
}

export default function DroppableColumn({ status, tasks, onTaskClick, onTaskDelete }: DroppableColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
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
      className={`kanban-column ${isOver ? 'drop-target' : ''}`}
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
        {tasks.map((task) => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            onTaskClick={onTaskClick}
            onTaskDelete={onTaskDelete}
          />
        ))}
        {isOver && tasks.length > 0 && (
          <div className="drop-placeholder">
            <div className="drop-placeholder-line"></div>
          </div>
        )}
        {tasks.length === 0 && (
          <div className="empty-column-placeholder">
            {isOver ? '✨ Drop here' : 'Drop tasks here'}
          </div>
        )}
      </div>
    </div>
  );
}