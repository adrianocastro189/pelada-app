import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders all variants', () => {
    const variants = ['primary', 'secondary', 'ghost', 'accent', 'destructive'] as const;
    variants.forEach(variant => {
      const { unmount } = render(<Button variant={variant}>{variant}</Button>);
      const button = screen.getByText(variant);
      expect(button).toHaveClass(`button--${variant}`);
      unmount();
    });
  });

  it('applies fullWidth class', () => {
    render(<Button variant="primary" fullWidth>Full</Button>);
    const button = screen.getByText('Full');
    expect(button).toHaveClass('button--full-width');
  });

  it('applies disabled state', () => {
    render(<Button variant="primary" disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button variant="primary" onClick={onClick}>Click</Button>);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('supports custom className', () => {
    render(<Button variant="primary" className="custom">Custom</Button>);
    const button = screen.getByText('Custom');
    expect(button).toHaveClass('button', 'button--primary', 'custom');
  });

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn();
    render(<Button variant="primary" onClick={onClick} disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
