import './Chip.css';

interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

/**
 * Chip component — small selectable button or tag.
 */
export function Chip({ label, active, onClick }: ChipProps): JSX.Element {
  const classes = ['chip', active ? 'chip--active' : ''].filter(Boolean).join(' ');
  const attrs = onClick ? { role: 'button' as const, tabIndex: 0 } : {};

  return (
    <div className={classes} onClick={onClick} {...attrs}>
      {label}
    </div>
  );
}
