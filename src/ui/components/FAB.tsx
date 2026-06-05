import './FAB.css';

interface FABProps {
  onClick: () => void;
  label: string;
  icon?: string;
}

/**
 * Floating Action Button — circular button for primary action.
 */
export function FAB({ onClick, label, icon = '+' }: FABProps): JSX.Element {
  return (
    <button className="fab" onClick={onClick} aria-label={label} title={label}>
      {icon}
    </button>
  );
}
