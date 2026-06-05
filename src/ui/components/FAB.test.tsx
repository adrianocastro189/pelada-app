import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FAB } from './FAB';

describe('FAB', () => {
  it('renders with default icon', () => {
    render(<FAB onClick={() => {}} label="Add" />);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('+');
  });

  it('renders custom icon', () => {
    render(<FAB onClick={() => {}} label="Search" icon="🔍" />);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('🔍');
  });

  it('has aria-label', () => {
    render(<FAB onClick={() => {}} label="Create new" />);
    const button = screen.getByLabelText('Create new');
    expect(button).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<FAB onClick={onClick} label="Action" />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });
});
