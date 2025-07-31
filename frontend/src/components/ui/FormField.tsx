// src/components/ui/FormField.tsx
import React from 'react';

interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: string;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  error?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  error?: string;
  options: { value: string; label: string }[];
}

export function FormField({ label, required, error, children, className = '' }: FormFieldProps) {
  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label>
          {label}
          {required && ' *'}
        </label>
      )}
      {children}
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}

export function Input({ label, required, error, className = '', ...props }: InputProps) {
  return (
    <FormField label={label} required={required} error={error}>
      <input 
        {...props} 
        className={`form-input ${className} ${error ? 'error' : ''}`}
      />
    </FormField>
  );
}

export function Textarea({ label, required, error, className = '', ...props }: TextareaProps) {
  return (
    <FormField label={label} required={required} error={error}>
      <textarea 
        {...props} 
        className={`form-textarea ${className} ${error ? 'error' : ''}`}
      />
    </FormField>
  );
}

export function Select({ label, required, error, options, className = '', ...props }: SelectProps) {
  return (
    <FormField label={label} required={required} error={error}>
      <select 
        {...props} 
        className={`form-select ${className} ${error ? 'error' : ''}`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

// Export compound component
FormField.Input = Input;
FormField.Textarea = Textarea;
FormField.Select = Select;