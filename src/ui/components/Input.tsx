import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/**
 * Input component with label and optional error message.
 */
export function Input({ label, error, id, ...rest }: InputProps): JSX.Element {
  const inputId = id || `input-${Math.random().toString(36).slice(2)}`;

  return (
    <div className="input-wrapper">
      <label htmlFor={inputId} className="input-label">
        {label}
      </label>
      <input id={inputId} className="input-field" {...rest} />
      {error && (
        <span className="input-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
