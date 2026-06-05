import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders label', () => {
    render(<Textarea label="Message" />);
    expect(screen.getByText('Message')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<Textarea label="Comment" error="Too long" />);
    expect(screen.getByText('Too long')).toBeInTheDocument();
  });

  it('associates label with textarea', () => {
    render(<Textarea label="Description" />);
    const label = screen.getByText('Description');
    const textarea = screen.getByRole('textbox');
    expect(label).toHaveAttribute('for', textarea.id);
  });

  it('propagates HTML attributes', async () => {
    render(<Textarea label="Notes" placeholder="Write here" disabled />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.placeholder).toBe('Write here');
    expect(textarea).toBeDisabled();
  });

  it('handles onChange', async () => {
    const onChange = vi.fn();
    render(<Textarea label="Text" onChange={onChange} />);
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'hello');
    expect(onChange).toHaveBeenCalled();
  });
});
