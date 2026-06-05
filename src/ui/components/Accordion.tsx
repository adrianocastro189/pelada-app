import React, { useState } from 'react';
import './Accordion.css';

interface AccordionProps {
  title: string;
  icon?: string;
  badge?: string;
  badgeVariant?: 'default' | 'warning' | 'success';
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/**
 * Accordion component — expandable/collapsible section.
 */
export function Accordion({
  title,
  icon,
  badge,
  badgeVariant = 'default',
  defaultOpen,
  children,
}: AccordionProps): JSX.Element {
  const [open, setOpen] = useState(defaultOpen ?? false);

  return (
    <div className="accordion">
      <button
        className="accordion-header"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="accordion-title">
          {icon && <span className="accordion-icon">{icon}</span>}
          {title}
        </span>
        {badge && (
          <span className={`accordion-badge accordion-badge--${badgeVariant}`}>
            {badge}
          </span>
        )}
        <span className={`accordion-chevron ${open ? 'accordion-chevron--open' : ''}`}>
          ▼
        </span>
      </button>
      {open && <div className="accordion-content">{children}</div>}
    </div>
  );
}
