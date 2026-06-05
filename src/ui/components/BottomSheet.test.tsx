import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BottomSheet } from './BottomSheet';

describe('BottomSheet', () => {
  it('does not render when open={false}', () => {
    const { container } = render(<BottomSheet open={false} onClose={() => {}}>Content</BottomSheet>);
    expect(container.querySelector('.bottom-sheet')).not.toBeInTheDocument();
  });

  it('renders when open={true}', () => {
    const { container } = render(<BottomSheet open onClose={() => {}}>Content</BottomSheet>);
    expect(container.querySelector('.bottom-sheet')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<BottomSheet open onClose={() => {}} title="Sheet Title">Content</BottomSheet>);
    expect(screen.getByText('Sheet Title')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<BottomSheet open onClose={() => {}}>Child content</BottomSheet>);
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('calls onClose when overlay clicked', async () => {
    const onClose = vi.fn();
    const { container } = render(<BottomSheet open onClose={onClose}>Content</BottomSheet>);
    const overlay = container.querySelector('.bottom-sheet-overlay') as HTMLElement;
    await userEvent.click(overlay);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not close when sheet content clicked', async () => {
    const onClose = vi.fn();
    render(<BottomSheet open onClose={onClose}>Clickable content</BottomSheet>);
    const content = screen.getByText('Clickable content');
    await userEvent.click(content);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape pressed', async () => {
    const onClose = vi.fn();
    render(<BottomSheet open onClose={onClose}>Content</BottomSheet>);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });
});
