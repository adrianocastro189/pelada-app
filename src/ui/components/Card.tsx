import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Card component — basic container with shadow and rounded corners.
 */
export function Card({ children, className, onClick }: CardProps): JSX.Element {
  const classes = ['card', className || ''].filter(Boolean).join(' ');
  const attrs = onClick ? { role: 'button' as const, tabIndex: 0 } : {};

  return (
    <div className={classes} onClick={onClick} {...attrs}>
      {children}
    </div>
  );
}
