import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Chip } from './Chip';

describe('Chip', () => {
  it('renders label', () => {
    render(<Chip label="Tag" />);
    expect(screen.getByText('Tag')).toBeInTheDocument();
  });

  it('applies active class', () => {
    const { container } = render(<Chip label="Active" active />);
    const chip = container.querySelector('.chip');
    expect(chip).toHaveClass('chip--active');
  });

  it('does not apply active class by default', () => {
    const { container } = render(<Chip label="Inactive" />);
    const chip = container.querySelector('.chip');
    expect(chip).not.toHaveClass('chip--active');
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Chip label="Click" onClick={onClick} />);
    const chip = screen.getByRole('button');
    await userEvent.click(chip);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is not a button when no onClick', () => {
    const { container } = render(<Chip label="Static" />);
    const chip = container.querySelector('.chip');
    expect(chip).not.toHaveAttribute('role', 'button');
  });
});
