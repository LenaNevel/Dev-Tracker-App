'use client';

import { useState } from 'react';
import { useTaskModal } from '../context/TaskModalContext';
import { useAuth } from '../context/AuthContext';
import { createTask } from '../api/task';
import '../styles/taskModal.css'; 

export default function TaskModal() {
  const { isModalOpen, closeModal } = useTaskModal();
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    why: '',
    what: '',
    how: '',
    acceptance_criteria: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!isAuthenticated) {
      setError('You must be logged in to create tasks');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await createTask({
        title: formData.title.trim(),
        why: formData.why.trim() || undefined,
        what: formData.what.trim() || undefined,
        how: formData.how.trim() || undefined,
        acceptance_criteria: formData.acceptance_criteria.trim() || undefined,
      });

      if (response.status === 'success') {
        // Reset form
        setFormData({
          title: '',
          why: '',
          what: '',
          how: '',
          acceptance_criteria: '',
        });
        closeModal();
        
        // Trigger page refresh to show new task
        window.location.reload();
      } else {
        setError(response.error || 'Failed to create task');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null); // Clear error when user starts typing
  };

  if (!isModalOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">🔧 Spin Up a New Task</h3>
        {error && <div className="error-message">{error}</div>}
        <form className="task-form" onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Title *" 
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            required
          />
          <textarea 
            placeholder="Why (motivation/goal)" 
            rows={3}
            value={formData.why}
            onChange={(e) => handleInputChange('why', e.target.value)}
          />
          <textarea 
            placeholder="What (task details)" 
            rows={3}
            value={formData.what}
            onChange={(e) => handleInputChange('what', e.target.value)}
          />
          <textarea 
            placeholder="How (implementation ideas)" 
            rows={3}
            value={formData.how}
            onChange={(e) => handleInputChange('how', e.target.value)}
          />
          <textarea 
            placeholder="Acceptance Criteria (success checklist)" 
            rows={3}
            value={formData.acceptance_criteria}
            onChange={(e) => handleInputChange('acceptance_criteria', e.target.value)}
          />
          <div className="modal-actions">
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={closeModal}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
