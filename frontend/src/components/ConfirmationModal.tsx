'use client';

import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../styles/confirmationModal.css';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  taskTitle?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  taskTitle,
  confirmText = 'Delete', 
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel
}: ConfirmationModalProps) {
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const modalContent = (
    <div className="confirmation-modal-overlay" onClick={handleBackdropClick}>
      <div className="confirmation-modal">
        <div className="confirmation-modal-header">
          <div className="confirmation-icon">
            {confirmVariant === 'danger' ? '🗑️' : 'ℹ️'}
          </div>
          <h3 className="confirmation-title">{title}</h3>
        </div>
        
        <div className="confirmation-modal-body">
          {taskTitle ? (
            <p className="confirmation-message">
              Are you sure you want to delete <strong>&ldquo;{taskTitle}&rdquo;</strong>? This cannot be undone.
            </p>
          ) : (
            <p className="confirmation-message">{message}</p>
          )}
        </div>
        
        <div className="confirmation-modal-actions">
          <button 
            className="confirmation-btn confirmation-btn-cancel" 
            onClick={onCancel}
            autoFocus
          >
            {cancelText}
          </button>
          <button 
            className={`confirmation-btn confirmation-btn-${confirmVariant}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}