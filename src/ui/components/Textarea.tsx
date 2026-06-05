import React from 'react';
import './Textarea.css';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

/**
 * Textarea component with label and optional error message.
 */
export function Textarea({ label, error, id, ...rest }: TextareaProps): JSX.Element {
  const textareaId = id || `textarea-${Math.random().toString(36).slice(2)}`;

  return (
    <div className="textarea-wrapper">
      <label htmlFor={textareaId} className="textarea-label">
        {label}
      </label>
      <textarea id={textareaId} className="textarea-field" {...rest} />
      {error && (
        <span className="textarea-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
