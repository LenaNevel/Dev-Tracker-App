// src/components/ui/Modal.tsx
'use client';

import React from 'react';
import '../../styles/taskModal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  actions?: React.ReactNode;
}

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface ModalActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className = '' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${className}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ title, onClose, actions }: ModalHeaderProps) {
  return (
    <div className="modal-header">
      <h3 className="modal-title">
        <strong>{title}</strong>
      </h3>
      <div className="modal-header-actions">
        {actions}
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
}

export function ModalBody({ children, className = '' }: ModalBodyProps) {
  return (
    <div className={`modal-body ${className}`}>
      {children}
    </div>
  );
}

export function ModalActions({ children, className = '' }: ModalActionsProps) {
  return (
    <div className={`modal-actions ${className}`}>
      {children}
    </div>
  );
}

// Export compound component
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Actions = ModalActions;