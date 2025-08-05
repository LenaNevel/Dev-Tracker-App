'use client';

import { useState, useEffect } from 'react';
import { Task, TaskStatus, updateTask, updateTaskStatus } from '../api/task';
import { useForm } from '../hooks/useForm';
import { Modal } from './ui/Modal';
import { FormField } from './ui/FormField';
import { Button } from './ui/Button';
import StatusDropdown from './StatusDropdown';
import DeleteTaskButton from './DeleteTaskButton';
import { TASK_STATUS_OPTIONS, getStatusLabel } from '../constants/taskStatus';
import '../styles/statusDropdown.css';
import '../styles/deleteButton.css';

interface TaskEditModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onUpdate: (taskId: number, updatedTask: Task) => void;
  onDelete: (taskId: number) => void;
}

interface TaskFormData {
  title: string;
  why: string;
  what: string;
  how: string;
  acceptance_criteria: string;
  status: TaskStatus;
}

export default function TaskEditModal({ isOpen, task, onClose, onUpdate, onDelete }: TaskEditModalProps) {
  const [isEditing, setIsEditing] = useState(false);

  const getTaskFormData = (task: Task | null): TaskFormData => {
    if (!task) {
      return {
        title: '',
        why: '',
        what: '',
        how: '',
        acceptance_criteria: '',
        status: 'backlog' as TaskStatus,
      };
    }
    return {
      title: task.title || '',
      why: task.why || '',
      what: task.what || '',
      how: task.how || '',
      acceptance_criteria: task.acceptance_criteria || '',
      status: task.status,
    };
  };

  const validateForm = (values: TaskFormData): string | null => {
    if (!values.title.trim()) {
      return 'Title is required';
    }
    return null;
  };

  const handleSubmit = async (values: TaskFormData) => {
    if (!task) return;

    const response = await updateTask(task.id, {
      title: values.title.trim(),
      why: values.why.trim() || undefined,
      what: values.what.trim() || undefined,
      how: values.how.trim() || undefined,
      acceptance_criteria: values.acceptance_criteria.trim() || undefined,
      status: values.status,
    });

    if (response.status === 'success' && response.data) {
      onUpdate(task.id, response.data.task);
      setIsEditing(false);
    } else {
      throw new Error(response.error || 'Failed to update task');
    }
  };

  const {
    values,
    error,
    isSubmitting,
    handleChange,
    handleSubmit: onSubmit,
    resetForm,
    setError,
    setValues,
    setIsSubmitting
  } = useForm({
    initialValues: getTaskFormData(task),
    onSubmit: handleSubmit,
    validate: validateForm
  });

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      setValues(getTaskFormData(task));
      setError(null);
      setIsSubmitting(false);
    }
  }, [task?.id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };

  const handleClose = () => {
    setIsEditing(false);
    resetForm();
    onClose();
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task || task.status === newStatus) return;

    try {
      const response = await updateTaskStatus(task.id, newStatus);
      if (response.status === 'success' && response.data) {
        onUpdate(task.id, response.data.task);
      } else {
        setError(response.error || 'Failed to update task status');
      }
    } catch (err) {
      setError('Failed to update task status');
    }
  };

  if (!isOpen || !task) return null;

  const modalTitle = isEditing ? '✏️ Edit Task' : task.title;
  const statusLabel = getStatusLabel(task.status);
  const createdDate = new Date(task.created_at).toLocaleDateString();
  const updatedDate = task.updated_at ? new Date(task.updated_at).toLocaleDateString() : 'Never';

  const editButton = (
    <Button variant="primary" onClick={handleEdit}>
      ✏️ Edit Task
    </Button>
  );

  const deleteButton = (
    <DeleteTaskButton
      taskId={task.id}
      taskTitle={task.title}
      onDelete={onDelete}
      variant="icon"
    />
  );

  const readOnlyActions = (
    <div className="modal-header-actions">
      {editButton}
      {deleteButton}
    </div>
  );

  const metadataPanel = (
    <div className="metadata-panel">
      <div className="metadata-spacer"></div>
      <div className="metadata-card">
        <label>Status</label>
        {!isEditing ? (
          <StatusDropdown
            currentStatus={task.status}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <div className="metadata-value">{statusLabel}</div>
        )}
      </div>
      <div className="metadata-card">
        <label>Created</label>
        <div className="metadata-value">{createdDate}</div>
      </div>
      <div className="metadata-card">
        <label>Updated</label>
        <div className="metadata-value">{updatedDate}</div>
      </div>
    </div>
  );

  const readOnlyContent = (
    <div className="content-panel">
      <FormField label="Why (motivation/goal)">
        <div className="read-only-field">{task.why || 'Not specified'}</div>
      </FormField>
      <FormField label="What (task details)">
        <div className="read-only-field">{task.what || 'Not specified'}</div>
      </FormField>
      <FormField label="How (implementation ideas)">
        <div className="read-only-field">{task.how || 'Not specified'}</div>
      </FormField>
      <FormField label="Acceptance Criteria (success checklist)">
        <div className="read-only-field">{task.acceptance_criteria || 'Not specified'}</div>
      </FormField>
    </div>
  );

  const editForm = (
    <form className="task-form" onSubmit={onSubmit}>
      <FormField.Input
        label="Title"
        required
        value={values.title}
        onChange={(e) => handleChange('title', e.target.value)}
      />
      <FormField.Select
        label="Status"
        options={TASK_STATUS_OPTIONS}
        value={values.status}
        onChange={(e) => handleChange('status', e.target.value as TaskStatus)}
      />
      <FormField.Textarea
        label="Why (motivation/goal)"
        rows={3}
        value={values.why}
        onChange={(e) => handleChange('why', e.target.value)}
      />
      <FormField.Textarea
        label="What (task details)"
        rows={3}
        value={values.what}
        onChange={(e) => handleChange('what', e.target.value)}
      />
      <FormField.Textarea
        label="How (implementation ideas)"
        rows={3}
        value={values.how}
        onChange={(e) => handleChange('how', e.target.value)}
      />
      <FormField.Textarea
        label="Acceptance Criteria (success checklist)"
        rows={3}
        value={values.acceptance_criteria}
        onChange={(e) => handleChange('acceptance_criteria', e.target.value)}
      />
      
      <div className="modal-actions">
        <DeleteTaskButton
          taskId={task.id}
          taskTitle={task.title}
          onDelete={onDelete}
          variant="button"
        />
        <div className="action-buttons-right">
          <Button 
            type="submit" 
            variant="primary"
            loading={isSubmitting}
          >
            Save Changes
          </Button>
          <Button 
            type="button" 
            variant="secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={modalTitle} className={isEditing ? 'edit-mode' : ''}>
      <Modal.Header 
        title={modalTitle} 
        onClose={handleClose}
        actions={!isEditing ? readOnlyActions : undefined}
      />

      {error && <div className="error-message">{error}</div>}

      <Modal.Body>
        {isEditing ? editForm : (
          <div className="modal-body">
            {readOnlyContent}
            {metadataPanel}
          </div>
        )}
      </Modal.Body>

    </Modal>
  );
}