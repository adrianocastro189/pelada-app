import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button style variant */
  variant: 'primary' | 'secondary' | 'ghost' | 'accent' | 'destructive';
  /** Full width button */
  fullWidth?: boolean;
}

/**
 * Button component with multiple variants.
 * All styling comes from CSS variables — no hardcoded values.
 */
export function Button({
  variant,
  fullWidth,
  children,
  className,
  ...rest
}: ButtonProps): JSX.Element {
  const classes = [
    'button',
    `button--${variant}`,
    fullWidth ? 'button--full-width' : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
