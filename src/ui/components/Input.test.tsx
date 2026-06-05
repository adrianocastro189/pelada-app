import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('renders label', () => {
    render(<Input label="Name" />);
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('does not display error when not provided', () => {
    const { container } = render(<Input label="Field" />);
    const error = container.querySelector('.input-error');
    expect(error).not.toBeInTheDocument();
  });

  it('associates label with input', () => {
    render(<Input label="Username" />);
    const label = screen.getByText('Username');
    const input = screen.getByRole('textbox');
    expect(label).toHaveAttribute('for', input.id);
  });

  it('propagates HTML attributes', async () => {
    const { container } = render(
      <Input
        label="Age"
        type="number"
        placeholder="Enter age"
        value="25"
        disabled
      />
    );
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('number');
    expect(input.placeholder).toBe('Enter age');
    expect(input.value).toBe('25');
    expect(input).toBeDisabled();
  });

  it('handles onChange', async () => {
    const onChange = vi.fn();
    render(<Input label="Test" onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'hello');
    expect(onChange).toHaveBeenCalled();
  });

  it('error has role alert for accessibility', () => {
    render(<Input label="Test" error="Error message" />);
    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('Error message');
  });
});
