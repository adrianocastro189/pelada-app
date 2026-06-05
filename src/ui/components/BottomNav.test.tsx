import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BottomNav } from './BottomNav';

describe('BottomNav', () => {
  it('renders 4 tabs', () => {
    render(<BottomNav active="peladas" onNavigate={() => {}} />);
    expect(screen.getByLabelText('Peladas')).toBeInTheDocument();
    expect(screen.getByLabelText('Peladeiros')).toBeInTheDocument();
    expect(screen.getByLabelText('Caixinha')).toBeInTheDocument();
    expect(screen.getByLabelText('Config')).toBeInTheDocument();
  });

  it('marks active tab', () => {
    const { container } = render(<BottomNav active="peladas" onNavigate={() => {}} />);
    const peladas = container.querySelector('[aria-label="Peladas"]');
    expect(peladas).toHaveClass('bottom-nav-tab--active');
    expect(peladas).toHaveAttribute('aria-current', 'page');
  });

  it('does not mark inactive tabs as active', () => {
    const { container } = render(<BottomNav active="peladas" onNavigate={() => {}} />);
    const players = container.querySelector('[aria-label="Peladeiros"]');
    expect(players).not.toHaveClass('bottom-nav-tab--active');
    expect(players).not.toHaveAttribute('aria-current');
  });

  it('calls onNavigate when tab clicked', async () => {
    const onNavigate = vi.fn();
    render(<BottomNav active="peladas" onNavigate={onNavigate} />);
    const financial = screen.getByLabelText('Caixinha');
    await userEvent.click(financial);
    expect(onNavigate).toHaveBeenCalledWith('financial');
  });

  it('renders tab icons and labels', () => {
    render(<BottomNav active="peladas" onNavigate={() => {}} />);
    expect(screen.getByText('⚽')).toBeInTheDocument();
    expect(screen.getByText('👥')).toBeInTheDocument();
    expect(screen.getByText('💰')).toBeInTheDocument();
    expect(screen.getByText('⚙️')).toBeInTheDocument();
  });
});
