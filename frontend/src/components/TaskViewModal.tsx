'use client';

import { useState, useEffect } from 'react';
import { Task, TaskStatus, updateTask, updateTaskStatus } from '../api/task';
import StatusDropdown from './StatusDropdown';
import DeleteTaskButton from './DeleteTaskButton';
import EditableField from './ui/EditableField';
import '../styles/taskViewModal.css';
import '../styles/statusDropdown.css';

interface TaskViewModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onUpdate: (taskId: number, updatedTask: Task) => void;
  onDelete: (taskId: number) => void;
}

export default function TaskViewModal({ isOpen, task, onClose, onUpdate, onDelete }: TaskViewModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      // Prevent background scrolling when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore background scrolling when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling if component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !task) return null;

  const handleFieldUpdate = async (field: keyof Task, value: string) => {
    try {
      const updateData: any = {};
      updateData[field] = value.trim() || null;
      
      const response = await updateTask(task.id, updateData);
      if (response.status === 'success' && response.data) {
        onUpdate(task.id, response.data.task);
        setError(null);
      } else {
        throw new Error(response.error || 'Failed to update task');
      }
    } catch (err) {
      setError('Failed to update field');
      throw err;
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (task.status === newStatus) return;

    try {
      const response = await updateTaskStatus(task.id, newStatus);
      if (response.status === 'success' && response.data) {
        onUpdate(task.id, response.data.task);
        setError(null);
      } else {
        setError(response.error || 'Failed to update task status');
      }
    } catch (err) {
      setError('Failed to update task status');
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    const colors = {
      backlog: '#6B7280',
      in_progress: '#3B82F6', 
      in_review: '#F59E0B',
      done: '#10B981',
      wont_do: '#EF4444'
    };
    return colors[status] || colors.backlog;
  };

  const statusColor = getStatusColor(task.status);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };

  const createdDate = formatDate(task.created_at);
  const updatedDate = task.updated_at ? formatDate(task.updated_at) : null;
  const dueDate = task.due_date ? formatDate(task.due_date) : null;


  return (
    <div 
      className="task-modal-overlay" 
      onClick={onClose}
      onWheel={(e) => e.stopPropagation()}
    >
      <div 
        className="task-modal-container" 
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Status Indicator Bar */}
        <div className="status-indicator" style={{ backgroundColor: statusColor }}></div>
        
        {/* Header */}
        <header className="task-modal-header">
          <div className="task-title-section">
            <div className="task-title-wrapper">
              <EditableField
                value={task.title}
                onSave={(value) => handleFieldUpdate('title', value)}
                placeholder="Task title"
                className="task-title-editable"
              />
            </div>
          </div>
          <div className="header-actions">
            <DeleteTaskButton
              taskId={task.id}
              taskTitle={task.title}
              onDelete={onDelete}
              variant="icon"
              className="delete-btn-header"
            />
            <button className="modal-close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </header>

        {/* Error Display */}
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Main Content */}
        <div className="task-modal-body">
          {/* Content Column */}
          <div className="content-column">
            <section className="content-section">
              <div className="section-header">
                <h3 className="section-title">WHY</h3>
                <p className="section-subtitle">Motivation & Goals</p>
              </div>
              <div className="section-content">
                <EditableField
                  value={task.why || ''}
                  onSave={(value) => handleFieldUpdate('why', value)}
                  placeholder="What's the motivation behind this task? What problem does it solve?"
                  multiline
                  rows={3}
                />
              </div>
            </section>

            <section className="content-section">
              <div className="section-header">
                <h3 className="section-title">WHAT</h3>
                <p className="section-subtitle">Task Details</p>
              </div>
              <div className="section-content">
                <EditableField
                  value={task.what || ''}
                  onSave={(value) => handleFieldUpdate('what', value)}
                  placeholder="Describe what needs to be done. Be specific about deliverables and scope."
                  multiline
                  rows={4}
                />
              </div>
            </section>

            <section className="content-section">
              <div className="section-header">
                <h3 className="section-title">HOW</h3>
                <p className="section-subtitle">Implementation Ideas</p>
              </div>
              <div className="section-content">
                <EditableField
                  value={task.how || ''}
                  onSave={(value) => handleFieldUpdate('how', value)}
                  placeholder="How will this be implemented? List approaches, technologies, or steps."
                  multiline
                  rows={4}
                />
              </div>
            </section>

            <section className="content-section">
              <div className="section-header">
                <h3 className="section-title">ACCEPTANCE CRITERIA</h3>
                <p className="section-subtitle">Definition of Done</p>
              </div>
              <div className="section-content">
                <EditableField
                  value={task.acceptance_criteria || ''}
                  onSave={(value) => handleFieldUpdate('acceptance_criteria', value)}
                  placeholder="• List specific criteria that must be met
• Use checkboxes or bullet points
• Be clear about success metrics"
                  multiline
                  rows={4}
                />
              </div>
            </section>
          </div>

          {/* Metadata Sidebar */}
          <aside className="metadata-sidebar">
            <div className="metadata-card primary-card">
              <label className="metadata-label">STATUS</label>
              <div className="status-dropdown-wrapper">
                <StatusDropdown
                  currentStatus={task.status}
                  onStatusChange={handleStatusChange}
                />
              </div>
            </div>

            <div className="metadata-card">
              <label className="metadata-label">DUE DATE</label>
              <div className="due-date-wrapper">
                {dueDate && !isEditingDueDate ? (
                  <div 
                    className="metadata-value clickable-date"
                    onClick={() => setIsEditingDueDate(true)}
                    title="Click to edit due date"
                  >
                    <span className="date-icon">📅</span>
                    {dueDate}
                  </div>
                ) : (
                  <EditableField
                    value={task.due_date || ''}
                    onSave={async (value) => {
                      await handleFieldUpdate('due_date', value);
                      setIsEditingDueDate(false);
                    }}
                    placeholder="No due date set"
                    type="date"
                  />
                )}
              </div>
            </div>

            <div className="metadata-divider"></div>

            <div className="metadata-card">
              <label className="metadata-label">CREATED</label>
              <div className="metadata-value">
                <span className="date-icon">🗓️</span>
                {createdDate}
              </div>
            </div>

            {updatedDate && (
              <div className="metadata-card">
                <label className="metadata-label">LAST UPDATED</label>
                <div className="metadata-value">
                  <span className="date-icon">⏰</span>
                  {updatedDate}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}