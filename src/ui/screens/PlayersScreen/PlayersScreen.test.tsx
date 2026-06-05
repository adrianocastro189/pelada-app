import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PlayerRecord } from '@ports/repositories/PlayerRepository';
import { PlayersScreen } from './PlayersScreen';
import * as AppContextModule from '@ui/AppContext';

vi.mock('@ui/AppContext', async () => {
  const actual = await vi.importActual<typeof AppContextModule>('@ui/AppContext');
  return {
    ...actual,
    useApp: vi.fn(),
  };
});

const mockPlayers: PlayerRecord[] = [
  {
    id: 'pl1',
    profile_id: 'prof-1',
    name: 'João Silva',
    nickname: 'Joãozinho',
    phone: '11999999999',
    stars: 3.5,
    position: 'line',
    speed: 'fast',
    default_type: 'line',
    status: 'active',
    invited_by_id: null,
    created_at: new Date(),
  },
  {
    id: 'pl2',
    profile_id: 'prof-1',
    name: 'Maria Santos',
    nickname: 'Maria',
    phone: null,
    stars: 4,
    position: 'goalkeeper',
    speed: 'medium',
    default_type: 'goalkeeper',
    status: 'active',
    invited_by_id: null,
    created_at: new Date(),
  },
  {
    id: 'pl3',
    profile_id: 'prof-1',
    name: 'Pedro Costa',
    nickname: null,
    phone: '11988888888',
    stars: 2.5,
    position: 'line',
    speed: 'slow',
    default_type: 'line',
    status: 'inactive',
    invited_by_id: null,
    created_at: new Date(),
  },
];

describe('PlayersScreen', () => {
  let mockListPlayers: ReturnType<typeof vi.fn>;
  let mockCreatePlayer: ReturnType<typeof vi.fn>;
  let mockDeactivatePlayer: ReturnType<typeof vi.fn>;
  let mockReactivatePlayer: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockListPlayers = vi.fn().mockResolvedValue(mockPlayers.filter(p => p.status === 'active'));
    mockCreatePlayer = vi.fn().mockResolvedValue({ ...mockPlayers[0], id: 'pl4' });
    mockDeactivatePlayer = vi.fn().mockResolvedValue(undefined);
    mockReactivatePlayer = vi.fn().mockResolvedValue(undefined);

    (AppContextModule.useApp as ReturnType<typeof vi.fn>).mockReturnValue({
      listPlayers: { execute: mockListPlayers },
      createPlayer: { execute: mockCreatePlayer },
      deactivatePlayer: { execute: mockDeactivatePlayer },
      reactivatePlayer: { execute: mockReactivatePlayer },
    });
  });

  it('renders header', () => {
    render(<PlayersScreen profileId="prof-1" />);
    expect(screen.getByText('👥 Peladeiros')).toBeInTheDocument();
    expect(screen.getByText('Gerenciar jogadores')).toBeInTheDocument();
  });

  it('loads and displays players on mount', async () => {
    render(<PlayersScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(mockListPlayers).toHaveBeenCalledWith('prof-1', false);
    });
  });

  it('displays loading state initially', () => {
    mockListPlayers.mockImplementationOnce(() => new Promise(() => {})); // Never resolves
    render(<PlayersScreen profileId="prof-1" />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('displays empty state when no players', async () => {
    mockListPlayers.mockResolvedValueOnce([]);
    render(<PlayersScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.getByText('Nenhum jogador adicionado')).toBeInTheDocument();
    });
  });

  it('displays player names and nicknames', async () => {
    render(<PlayersScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('Joãozinho')).toBeInTheDocument();
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    });
  });

  it('displays player stats (position, speed, stars)', async () => {
    render(<PlayersScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.getByText(/⚽ line/)).toBeInTheDocument();
      expect(screen.getByText(/🧤 goalkeeper/)).toBeInTheDocument();
      expect(screen.getByText(/⚡ fast/)).toBeInTheDocument();
      expect(screen.getByText(/3.5/)).toBeInTheDocument();
    });
  });

  it('opens create sheet when button clicked', async () => {
    render(<PlayersScreen profileId="prof-1" />);
    const button = await screen.findByText('+ Adicionar jogador');
    await userEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText('Novo jogador')).toBeInTheDocument();
    });
  });

  it('creates player on form submit', async () => {
    render(<PlayersScreen profileId="prof-1" />);
    const button = await screen.findByText('+ Adicionar jogador');
    await userEvent.click(button);

    const nameInput = screen.getByPlaceholderText('Ex: João Silva');
    await userEvent.type(nameInput, 'New Player');

    const submitButton = screen.getByRole('button', { name: 'Adicionar' });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreatePlayer).toHaveBeenCalled();
    });
  });

  it('displays player phone when available', async () => {
    render(<PlayersScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.getByText('📱 11999999999')).toBeInTheDocument();
    });
  });

  it('displays active player count', async () => {
    render(<PlayersScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.getByText(/Ativos: 2/)).toBeInTheDocument();
    });
  });

  it('toggles player status when button clicked', async () => {
    mockListPlayers.mockResolvedValueOnce([mockPlayers[0]]);
    render(<PlayersScreen profileId="prof-1" />);
    const statusButtons = await screen.findAllByRole('button', { name: /Toggle.*status/ });
    await userEvent.click(statusButtons[0]);
    await waitFor(() => {
      expect(mockDeactivatePlayer).toHaveBeenCalledWith(mockPlayers[0].id);
    });
  });
});
