import './Badge.css';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'critical' | 'success' | 'danger';
}

/**
 * Badge component for status and labels.
 */
export function Badge({ label, variant = 'default' }: BadgeProps): JSX.Element {
  const classes = ['badge', `badge--${variant}`].join(' ');
  return <span className={classes}>{label}</span>;
}
