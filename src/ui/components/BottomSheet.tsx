import React, { useEffect } from 'react';
import './BottomSheet.css';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/**
 * Bottom sheet modal — slides up from the bottom.
 * Closes when clicking overlay or pressing Escape.
 */
export function BottomSheet({ open, onClose, title, children }: BottomSheetProps): JSX.Element {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [open, onClose]);

  if (!open) {
    return <></>;
  }

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
        <div className="bottom-sheet-handle" />
        {title && <h2 className="bottom-sheet-title">{title}</h2>}
        <div className="bottom-sheet-content">{children}</div>
      </div>
    </div>
  );
}
