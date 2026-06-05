import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom">Content</Card>);
    const card = container.querySelector('.card');
    expect(card).toHaveClass('card', 'custom');
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Card onClick={onClick}>Click me</Card>);
    const card = screen.getByRole('button');
    await userEvent.click(card);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is not a button when no onClick', () => {
    const { container } = render(<Card>Not a button</Card>);
    const card = container.querySelector('.card');
    expect(card).not.toHaveAttribute('role', 'button');
  });
});
