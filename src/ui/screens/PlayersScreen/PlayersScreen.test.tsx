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
    position: 'midfield',
    speed: 'fast',
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
    position: 'midfield',
    speed: 'slow',
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

  it('displays players as "Name - Nickname" when nickname exists', async () => {
    render(<PlayersScreen profileId="prof-1" />);
    await waitFor(() => {
      // João has nickname → combined format
      expect(screen.getByText('João Silva - Joãozinho')).toBeInTheDocument();
      // Maria's nickname equals surname portion — still combined
      expect(screen.getByText('Maria Santos - Maria')).toBeInTheDocument();
    });
  });

  it('displays player without nickname using name only', async () => {
    mockListPlayers.mockResolvedValueOnce([mockPlayers[2]]); // Pedro — no nickname
    render(<PlayersScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.getByText('Pedro Costa')).toBeInTheDocument();
    });
  });

  it('displays player stats (position, speed, stars)', async () => {
    render(<PlayersScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.getByText(/🎯 Meio/)).toBeInTheDocument();
      expect(screen.getByText(/🧤 Goleiro/)).toBeInTheDocument();
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

  it('opens edit sheet pre-filled when edit button clicked', async () => {
    render(<PlayersScreen profileId="prof-1" />);
    const editButton = await screen.findByRole('button', { name: 'Editar João Silva - Joãozinho' });
    await userEvent.click(editButton);
    await waitFor(() => {
      expect(screen.getByText('Editar jogador')).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
  });

  it('updates player on edit form submit', async () => {
    const mockUpdatePlayer = vi.fn().mockResolvedValue(mockPlayers[0]);
    (AppContextModule.useApp as ReturnType<typeof vi.fn>).mockReturnValue({
      listPlayers: { execute: mockListPlayers },
      createPlayer: { execute: mockCreatePlayer },
      updatePlayer: { execute: mockUpdatePlayer },
      deactivatePlayer: { execute: mockDeactivatePlayer },
      reactivatePlayer: { execute: mockReactivatePlayer },
    });
    render(<PlayersScreen profileId="prof-1" />);
    const editButton = await screen.findByRole('button', { name: 'Editar João Silva - Joãozinho' });
    await userEvent.click(editButton);

    const submitButton = screen.getByRole('button', { name: 'Salvar' });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdatePlayer).toHaveBeenCalledWith('pl1', expect.objectContaining({ name: 'João Silva' }));
    });
  });

  it('inactivates player from inside the edit sheet after confirmation', async () => {
    render(<PlayersScreen profileId="prof-1" />);
    const editButton = await screen.findByRole('button', { name: 'Editar João Silva - Joãozinho' });
    await userEvent.click(editButton);

    const inactivateButton = await screen.findByRole('button', { name: 'Inativar jogador' });
    await userEvent.click(inactivateButton);

    // First click only reveals the confirmation step — no call yet.
    expect(mockDeactivatePlayer).not.toHaveBeenCalled();

    const confirmButton = await screen.findByRole('button', { name: 'Confirmar' });
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeactivatePlayer).toHaveBeenCalledWith('pl1');
    });
  });
});
