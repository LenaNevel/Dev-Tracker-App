'use client';

import { useState, useRef, useEffect } from 'react';
import { TaskStatus } from '../api/task';
import { TASK_STATUS_CONFIG, TASK_STATUS_ORDER } from '../constants/taskStatus';
import '../styles/statusDropdown.css';

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

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('StatusDropdown toggle clicked', { isOpen, disabled }); // Debug log
    if (!disabled) {
      setIsOpen(prev => !prev);
    }
  };

  const handleStatusSelect = (status: TaskStatus, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Status selected:', status); // Debug log
    if (status !== currentStatus && !disabled) {
      onStatusChange(status);
    }
    setIsOpen(false);
  };

  const currentConfig = TASK_STATUS_CONFIG[currentStatus];

  return (
    <div className="status-dropdown" ref={dropdownRef}>
      <button
        className={`dropdown-toggle ${disabled ? 'disabled' : ''}`}
        onClick={handleToggle}
        disabled={disabled}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="toggle-content">
          <span className="status-emoji">{currentConfig.emoji}</span>
          <span className="status-label">{currentConfig.label}</span>
        </div>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>⌄</span>
      </button>

      {isOpen && (
        <ul className="dropdown-menu" role="listbox">
          {TASK_STATUS_ORDER.map((status) => {
            const config = TASK_STATUS_CONFIG[status];
            const isSelected = status === currentStatus;
            
            return (
              <li
                key={status}
                className={`dropdown-option ${isSelected ? 'active' : ''}`}
                onClick={(e) => handleStatusSelect(status, e)}
                role="option"
                aria-selected={isSelected}
              >
                <span className="status-emoji">{config.emoji}</span>
                <span className="option-label">{config.label}</span>
                {isSelected && <span className="check-mark">✓</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}