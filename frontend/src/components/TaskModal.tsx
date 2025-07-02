'use client';

import { useTaskModal } from '../context/TaskModalContext';
import '../styles/taskModal.css'; 

export default function TaskModal() {
  const { isModalOpen, closeModal } = useTaskModal();

  if (!isModalOpen) return null;

  return (
    <div className="modal-overlay">
    <div className="modal-content">
        <h3 className="modal-title">Create a New Task</h3>
        <form className="task-form">
        <input type="text" placeholder="Title" />
        <textarea placeholder="Description" rows={4} />
        <div className="modal-actions">
            <button type="submit" className="btn-primary">Create</button>
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
        </div>
        </form>
    </div>
    </div>
  );
}
