'use client';

import { useState, useEffect } from 'react';
import { useTaskModal } from '../context/TaskModalContext';
import { useAuth } from '../context/AuthContext';
import { createTask, CreateTaskData, Task } from '../api/task';
import { useForm } from '../hooks/useForm';
import StatusDropdown from './StatusDropdown';
import { Button } from './ui/Button';
import '../styles/taskViewModal.css';
import '../styles/taskCreateModal.css';

interface TaskFormData extends CreateTaskData {
  // All fields are already defined in CreateTaskData
}

interface TaskCreateModalProps {
  onTaskCreate?: (task: Task) => void;
}

const initialFormData: TaskFormData = {
  title: '',
  why: '',
  what: '',
  how: '',
  acceptance_criteria: '',
  due_date: '',
  status: 'backlog',
};

export default function TaskCreateModal({ onTaskCreate }: TaskCreateModalProps = {}) {
  const { isModalOpen, closeModal } = useTaskModal();
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      setError(null);
      setHasAttemptedSubmit(false);
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
  }, [isModalOpen]);

  const validateForm = (values: TaskFormData): string | null => {
    if (!values.title.trim()) {
      return 'Title is required';
    }
    if (!isAuthenticated) {
      return 'You must be logged in to create tasks';
    }
    return null;
  };

  const handleSubmit = async (values: TaskFormData) => {
    const response = await createTask({
      title: values.title.trim(),
      why: values.why?.trim() || undefined,
      what: values.what?.trim() || undefined,
      how: values.how?.trim() || undefined,
      acceptance_criteria: values.acceptance_criteria?.trim() || undefined,
      due_date: values.due_date || undefined,
      status: values.status || 'backlog',
    });

    if (response.status === 'success') {
      resetForm();
      closeModal();
      // Optimistically update the UI with the new task
      if (onTaskCreate && response.data) {
        onTaskCreate(response.data.task);
      }
    } else {
      throw new Error(response.error || 'Failed to create task');
    }
  };

  const {
    values,
    isSubmitting,
    handleChange,
    handleSubmit: onSubmit,
    resetForm
  } = useForm({
    initialValues: initialFormData,
    onSubmit: handleSubmit,
    validate: validateForm
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    setHasAttemptedSubmit(true);
    onSubmit(e);
  };

  const handleStatusChange = (newStatus: any) => {
    handleChange('status', newStatus);
  };

  if (!isModalOpen) return null;

  return (
    <div 
      className="task-modal-overlay" 
      onClick={closeModal}
      onWheel={(e) => e.stopPropagation()}
    >
      <div 
        className="task-modal-container" 
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Status Indicator Bar - Default to backlog color */}
        <div className="status-indicator" style={{ backgroundColor: '#6B7280' }}></div>
        
        {/* Header */}
        <header className="task-modal-header">
          <div className="task-title-section">
            <div className="task-title-wrapper">
              <h2 className="create-task-title">🔧 Spin Up a New Task</h2>
            </div>
          </div>
          <div className="header-actions">
            <button className="modal-close-btn" onClick={closeModal}>
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
        <form onSubmit={handleFormSubmit} className={hasAttemptedSubmit ? 'form-submitted' : ''}>
          <div className="task-modal-body">
            {/* Content Column */}
            <div className="content-column">
              
              <section className="content-section">
                <div className="section-header">
                  <h3 className="section-title">TITLE</h3>
                  <p className="section-subtitle">What&apos;s this task about?</p>
                </div>
                <div className="section-content">
                  <input
                    type="text"
                    className="title-input"
                    placeholder="Enter a clear, descriptive title for your task..."
                    value={values.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </section>

              <section className="content-section">
                <div className="section-header">
                  <h3 className="section-title">WHY</h3>
                  <p className="section-subtitle">Motivation & Goals</p>
                </div>
                <div className="section-content">
                  <textarea
                    className="section-textarea"
                    placeholder="What's the motivation behind this task? What problem does it solve?"
                    rows={3}
                    value={values.why}
                    onChange={(e) => handleChange('why', e.target.value)}
                  />
                </div>
              </section>

              <section className="content-section">
                <div className="section-header">
                  <h3 className="section-title">WHAT</h3>
                  <p className="section-subtitle">Task Details</p>
                </div>
                <div className="section-content">
                  <textarea
                    className="section-textarea"
                    placeholder="Describe what needs to be done. Be specific about deliverables and scope."
                    rows={4}
                    value={values.what}
                    onChange={(e) => handleChange('what', e.target.value)}
                  />
                </div>
              </section>

              <section className="content-section">
                <div className="section-header">
                  <h3 className="section-title">HOW</h3>
                  <p className="section-subtitle">Implementation Ideas</p>
                </div>
                <div className="section-content">
                  <textarea
                    className="section-textarea"
                    placeholder="How will this be implemented? List approaches, technologies, or steps."
                    rows={4}
                    value={values.how}
                    onChange={(e) => handleChange('how', e.target.value)}
                  />
                </div>
              </section>

              <section className="content-section">
                <div className="section-header">
                  <h3 className="section-title">ACCEPTANCE CRITERIA</h3>
                  <p className="section-subtitle">Definition of Done</p>
                </div>
                <div className="section-content">
                  <textarea
                    className="section-textarea"
                    placeholder="• List specific criteria that must be met&#10;• Use checkboxes or bullet points&#10;• Be clear about success metrics"
                    rows={4}
                    value={values.acceptance_criteria}
                    onChange={(e) => handleChange('acceptance_criteria', e.target.value)}
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
                    currentStatus={values.status || 'backlog'}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              </div>

              <div className="metadata-card">
                <label className="metadata-label">DUE DATE</label>
                <div className="due-date-wrapper">
                  <input
                    type="date"
                    className="date-input"
                    value={values.due_date}
                    onChange={(e) => handleChange('due_date', e.target.value)}
                  />
                </div>
              </div>

              <div className="create-actions-card">
                <Button 
                  type="submit" 
                  variant="primary"
                  loading={isSubmitting}
                  className="create-task-btn"
                >
                  🚀 Create Task
                </Button>
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="cancel-btn"
                >
                  Cancel
                </Button>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
}