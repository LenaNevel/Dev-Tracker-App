'use client';

import { DragOverlay } from '@dnd-kit/core';
import { Task } from '../api/task';

interface TaskDragOverlayProps {
  activeTask: Task | null;
}

export default function TaskDragOverlay({ activeTask }: TaskDragOverlayProps) {
  return (
    <DragOverlay>
      {activeTask ? (
        <div className="task-card drag-overlay">
          <h4 className="task-title">{activeTask.title}</h4>
        </div>
      ) : null}
    </DragOverlay>
  );
}