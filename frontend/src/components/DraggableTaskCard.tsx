'use client';

import { useDraggable } from '@dnd-kit/core';
import { Task } from '../api/task';
import DeleteTaskButton from './DeleteTaskButton';
import '../styles/deleteButton.css';

interface DraggableTaskCardProps {
  task: Task;
  onTaskClick: (taskId: number) => void;
  onTaskDelete: (taskId: number) => void;
}

export default function DraggableTaskCard({ task, onTaskClick, onTaskDelete }: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `task-${task.id}`,
    data: {
      type: 'task',
      task,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;


  const handleDragStart = (e: React.DragEvent) => {
    // Prevent default browser drag behavior
    e.preventDefault();
    e.stopPropagation();
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      onTaskClick(task.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      onDragStart={handleDragStart}
      draggable={false}
    >
      <div
        {...listeners}
        {...attributes}
        className="task-card-drag-area"
        onClick={handleTitleClick}
      >
        <h4 className="task-title">{task.title}</h4>
      </div>
      <div className="delete-button-container">
        <DeleteTaskButton
          taskId={task.id}
          taskTitle={task.title}
          onDelete={onTaskDelete}
          variant="icon"
        />
      </div>
    </div>
  );
}