'use client';

import { useState, useRef, useEffect } from 'react';
import { TaskStatus } from '../api/task';
import { TASK_STATUS_CONFIG, TASK_STATUS_ORDER } from '../constants/taskStatus';

interface StatusDropdownProps {
  currentStatus: TaskStatus;
  onStatusChange: (newStatus: TaskStatus) => void;
  disabled?: boolean;
}

export default function StatusDropdown({ currentStatus, onStatusChange, disabled = false }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusSelect = (status: TaskStatus) => {
    if (status !== currentStatus && !disabled) {
      onStatusChange(status);
    }
    setIsOpen(false);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent task card click
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const currentConfig = TASK_STATUS_CONFIG[currentStatus];

  return (
    <div className="status-dropdown" ref={dropdownRef}>
      <button
        className={`status-trigger ${disabled ? 'disabled' : ''}`}
        onClick={handleToggle}
        disabled={disabled}
        title="Change status"
      >
        <span className="status-emoji">{currentConfig.emoji}</span>
        <span className="status-label">{currentConfig.label}</span>
        <span className="dropdown-arrow">▼</span>
      </button>

      {isOpen && (
        <div className="status-dropdown-menu">
          {TASK_STATUS_ORDER.map((status) => {
            const config = TASK_STATUS_CONFIG[status];
            const isSelected = status === currentStatus;
            
            return (
              <button
                key={status}
                className={`status-option ${isSelected ? 'selected' : ''}`}
                onClick={() => handleStatusSelect(status)}
              >
                <span className="status-emoji">{config.emoji}</span>
                <span className="status-label">{config.label}</span>
                {isSelected && <span className="check-mark">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}