'use client';

import { useTaskModal } from '../context/TaskModalContext';
import { useAuth } from '../context/AuthContext';
import { createTask, CreateTaskData } from '../api/task';
import { useForm } from '../hooks/useForm';
import { Modal } from './ui/Modal';
import { FormField } from './ui/FormField';
import { Button } from './ui/Button';

interface TaskFormData extends CreateTaskData {
  // All fields are already defined in CreateTaskData
}

const initialFormData: TaskFormData = {
  title: '',
  why: '',
  what: '',
  how: '',
  acceptance_criteria: '',
};

export default function TaskModal() {
  const { isModalOpen, closeModal } = useTaskModal();
  const { isAuthenticated } = useAuth();

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
      why: values.why.trim() || undefined,
      what: values.what.trim() || undefined,
      how: values.how.trim() || undefined,
      acceptance_criteria: values.acceptance_criteria.trim() || undefined,
    });

    if (response.status === 'success') {
      resetForm();
      closeModal();
      // Trigger page refresh to show new task
      window.location.reload();
    } else {
      throw new Error(response.error || 'Failed to create task');
    }
  };

  const {
    values,
    error,
    isSubmitting,
    handleChange,
    handleSubmit: onSubmit,
    resetForm
  } = useForm({
    initialValues: initialFormData,
    onSubmit: handleSubmit,
    validate: validateForm
  });

  return (
    <Modal isOpen={isModalOpen} onClose={closeModal} title="🔧 Spin Up a New Task">
      <Modal.Header title="🔧 Spin Up a New Task" onClose={closeModal} />
      
      {error && <div className="error-message">{error}</div>}
      
      <form className="task-form" onSubmit={onSubmit}>
        <FormField.Input
          placeholder="Title *"
          value={values.title}
          onChange={(e) => handleChange('title', e.target.value)}
          required
        />
        <FormField.Textarea
          placeholder="Why (motivation/goal)"
          rows={3}
          value={values.why}
          onChange={(e) => handleChange('why', e.target.value)}
        />
        <FormField.Textarea
          placeholder="What (task details)"
          rows={3}
          value={values.what}
          onChange={(e) => handleChange('what', e.target.value)}
        />
        <FormField.Textarea
          placeholder="How (implementation ideas)"
          rows={3}
          value={values.how}
          onChange={(e) => handleChange('how', e.target.value)}
        />
        <FormField.Textarea
          placeholder="Acceptance Criteria (success checklist)"
          rows={3}
          value={values.acceptance_criteria}
          onChange={(e) => handleChange('acceptance_criteria', e.target.value)}
        />
        
        <Modal.Actions>
          <Button 
            type="submit" 
            variant="primary"
            loading={isSubmitting}
          >
            Create Task
          </Button>
          <Button 
            type="button" 
            variant="secondary"
            onClick={closeModal}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </Modal.Actions>
      </form>
    </Modal>
  );
}
