'use client';

import { useState, useEffect, useRef } from 'react';

interface EditableFieldProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  type?: 'text' | 'date';
  className?: string;
}

export default function EditableField({
  value,
  onSave,
  placeholder = 'Click to edit',
  multiline = false,
  rows = 3,
  type = 'text',
  className = '',
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (inputValue !== value) {
      setIsSaving(true);
      try {
        await onSave(inputValue);
      } catch {
        setInputValue(value); // revert on error
      } finally {
        setIsSaving(false);
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setInputValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    const inputElement = multiline ? (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={rows}
        className="inline-edit-input"
        disabled={isSaving}
      />
    ) : (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={type}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="inline-edit-input"
        disabled={isSaving}
      />
    );

    return (
      <div className="inline-edit-wrapper">
        {inputElement}
        <div className="inline-edit-actions">
          <button onClick={handleSave} disabled={isSaving} className="inline-edit-save">
            {isSaving ? '...' : '✓'}
          </button>
          <button onClick={handleCancel} disabled={isSaving} className="inline-edit-cancel">
            ✕
          </button>
        </div>
      </div>
    );
  }

  const display = value?.trim() || placeholder;
  const isEmpty = !value || value.trim() === '';

  return (
    <div
      className={`inline-edit-display ${isEmpty ? 'empty' : ''} ${className}`}
      onDoubleClick={() => setIsEditing(true)}
      title="Double-click to edit"
    >
      {type === 'date' && value ? new Date(value).toLocaleDateString() : display}
    </div>
  );
}