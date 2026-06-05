import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders label', () => {
    render(<Badge label="Active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders all variants', () => {
    const variants = ['default', 'critical', 'success', 'danger'] as const;
    variants.forEach(variant => {
      const { unmount } = render(<Badge label={variant} variant={variant} />);
      const badge = screen.getByText(variant);
      expect(badge).toHaveClass(`badge--${variant}`);
      unmount();
    });
  });

  it('defaults to default variant', () => {
    const { container } = render(<Badge label="Test" />);
    const badge = container.querySelector('.badge');
    expect(badge).toHaveClass('badge--default');
  });
});
