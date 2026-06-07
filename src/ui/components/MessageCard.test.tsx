import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageCard } from './MessageCard';

describe('MessageCard', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it('renders the title and message', () => {
    render(<MessageCard title="Times Sorteados" message={'*Time A*\n⚽ João'} />);
    expect(screen.getByText('Times Sorteados')).toBeInTheDocument();
    expect(screen.getByText(/⚽ João/)).toBeInTheDocument();
  });

  it('shows the empty hint when message is empty', () => {
    render(<MessageCard title="Times Sorteados" message="" emptyHint="Sorteie primeiro" />);
    expect(screen.getByText('Sorteie primeiro')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('copies the message to the clipboard and confirms', async () => {
    render(<MessageCard title="Times Sorteados" message={'*Time A*\n⚽ João'} />);
    const copyButton = screen.getByRole('button', { name: /Copiar/ });
    await userEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('*Time A*\n⚽ João');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Copiado/ })).toBeInTheDocument();
    });
  });
});
