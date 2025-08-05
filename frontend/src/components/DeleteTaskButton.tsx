'use client';

import { useState } from 'react';
import { deleteTask } from '../api/task';
import ConfirmationModal from './ConfirmationModal';

interface DeleteTaskButtonProps {
  taskId: number;
  taskTitle: string;
  onDelete: (taskId: number) => void;
  variant?: 'icon' | 'button';
  className?: string;
}

export default function DeleteTaskButton({ 
  taskId, 
  taskTitle, 
  onDelete, 
  variant = 'icon',
  className = '' 
}: DeleteTaskButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowModal(true);
  };

  const confirmDelete = async () => {
    setShowModal(false);
    setIsDeleting(true);

    try {
      const response = await deleteTask(taskId);
      if (response.status === 'success') {
        onDelete(taskId);
      } else {
        alert(`Failed to delete: ${response.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert('Could not delete task. Try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`delete-task-icon ${className}`}
        disabled={isDeleting}
        title="Delete task"
      >
        {isDeleting ? '⏳' : '🗑️'}
      </button>

      {showModal && (
        <ConfirmationModal
          isOpen={true}
          title="Delete Task"
          message={`Are you sure you want to delete "${taskTitle}"? This cannot be undone.`}
          taskTitle={taskTitle}
          confirmText="Delete"
          cancelText="Cancel"
          confirmVariant="danger"
          onConfirm={confirmDelete}
          onCancel={() => setShowModal(false)}
        />
      )}
    </>
  );
}