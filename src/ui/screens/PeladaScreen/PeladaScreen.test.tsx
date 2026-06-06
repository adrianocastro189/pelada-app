import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PeladaRecord } from '@ports/repositories/PeladaRepository';
import type { PeladaPlayerRecord } from '@ports/repositories/PeladaPlayerRepository';
import type { DrawResult } from '@application/use-cases/draw/GetDrawUseCase';
import type { PlayerRecord } from '@ports/repositories/PlayerRepository';
import { PeladaScreen } from './PeladaScreen';
import type { ClonePeladaFormData } from '@ui/screens/PeladasScreen';
import * as AppContextModule from '@ui/AppContext';

vi.mock('@ui/AppContext', async () => {
  const actual = await vi.importActual<typeof AppContextModule>('@ui/AppContext');
  return {
    ...actual,
    useApp: vi.fn(),
  };
});

const mockPelada: PeladaRecord = {
  id: 'p1',
  profile_id: 'prof-1',
  date: new Date('2026-06-20'),
  time: '19:00',
  location: 'Quadra Centro',
  players_per_team: 5,
  max_goalkeepers: 1,
  cost_per_player: 5000,
  goalkeeper_pays: false,
  created_at: new Date(),
};

const mockPlayers: PlayerRecord[] = [
  { id: 'pl1', profile_id: 'prof-1', name: 'João', nickname: 'João', phone: '', stars: 2.5, position: 'midfield', speed: 'fast', invited_by_id: null, status: 'active', created_at: new Date() },
  { id: 'pl2', profile_id: 'prof-1', name: 'Maria', nickname: 'Maria', phone: '', stars: 3, position: 'goalkeeper', speed: 'medium', invited_by_id: null, status: 'active', created_at: new Date() },
  { id: 'pl3', profile_id: 'prof-1', name: 'Pedro', nickname: 'Pedro', phone: '', stars: 2, position: 'midfield', speed: 'slow', invited_by_id: null, status: 'active', created_at: new Date() },
];

const mockRoster: PeladaPlayerRecord[] = [
  { id: 'r1', pelada_id: 'p1', player_id: 'pl1', slot_type: 'line', paid: true, created_at: new Date() },
  { id: 'r2', pelada_id: 'p1', player_id: 'pl2', slot_type: 'goalkeeper', paid: false, created_at: new Date() },
  { id: 'r3', pelada_id: 'p1', player_id: 'pl3', slot_type: 'line', paid: true, created_at: new Date() },
];

const mockDraw: DrawResult[] = [
  {
    team: { id: 't1', pelada_id: 'p1', name: 'Time A', sort_order: 1, created_at: new Date() },
    players: [
      { id: 'd1', pelada_id: 'p1', pelada_team_id: 't1', player_id: 'pl1', created_at: new Date() },
      { id: 'd2', pelada_id: 'p1', pelada_team_id: 't1', player_id: 'pl2', created_at: new Date() },
    ],
  },
  {
    team: { id: 't2', pelada_id: 'p1', name: 'Time B', sort_order: 2, created_at: new Date() },
    players: [
      { id: 'd3', pelada_id: 'p1', pelada_team_id: 't2', player_id: 'pl3', created_at: new Date() },
    ],
  },
];

describe('PeladaScreen', () => {
  let mockGetPelada: ReturnType<typeof vi.fn>;
  let mockGetProfile: ReturnType<typeof vi.fn>;
  let mockGetRoster: ReturnType<typeof vi.fn>;
  let mockGetDraw: ReturnType<typeof vi.fn>;
  let mockGetPlayer: ReturnType<typeof vi.fn>;
  let mockDrawTeams: ReturnType<typeof vi.fn>;
  let mockSetPlayerPaid: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGetPelada = vi.fn().mockResolvedValue(mockPelada);
    mockGetProfile = vi.fn().mockResolvedValue({
      id: 'prof-1',
      name: 'Test',
      convocation_template: '',
      created_at: new Date(),
    });
    mockGetRoster = vi.fn().mockResolvedValue(mockRoster);
    mockGetDraw = vi.fn().mockResolvedValue(mockDraw);
    mockGetPlayer = vi.fn().mockImplementation((playerId: string) => {
      const player = mockPlayers.find(p => p.id === playerId);
      return Promise.resolve(player || { id: playerId, name: 'Unknown' });
    });
    mockDrawTeams = vi.fn().mockResolvedValue(undefined);
    mockSetPlayerPaid = vi.fn().mockResolvedValue({ ...mockRoster[0], paid: true });

    (AppContextModule.useApp as ReturnType<typeof vi.fn>).mockReturnValue({
      getPelada: { execute: mockGetPelada },
      getProfile: { execute: mockGetProfile },
      getRoster: { execute: mockGetRoster },
      getDraw: { execute: mockGetDraw },
      getPlayer: { execute: mockGetPlayer },
      drawTeams: { execute: mockDrawTeams },
      setPlayerPaid: { execute: mockSetPlayerPaid },
    });
  });

  it('renders without crashing', () => {
    const { container } = render(<PeladaScreen profileId="prof-1" peladaId="p1" />);
    expect(container).toBeInTheDocument();
  });

  it('calls loadPeladaData use cases on mount', async () => {
    render(<PeladaScreen profileId="prof-1" peladaId="p1" />);
    await waitFor(() => {
      expect(mockGetPelada).toHaveBeenCalledWith('p1');
      expect(mockGetRoster).toHaveBeenCalledWith('p1');
      expect(mockGetDraw).toHaveBeenCalledWith('p1');
    });
  });

  it('loads player names from roster', async () => {
    render(<PeladaScreen profileId="prof-1" peladaId="p1" />);
    await waitFor(() => {
      expect(mockGetPlayer).toHaveBeenCalled();
    });
  });

  it('displays loading state initially', () => {
    mockGetPelada.mockImplementationOnce(() => new Promise(() => {})); // Never resolves
    render(<PeladaScreen profileId="prof-1" peladaId="p1" />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('displays not found when pelada is null', async () => {
    mockGetPelada.mockResolvedValueOnce(null);
    render(<PeladaScreen profileId="prof-1" peladaId="p1" />);
    await waitFor(() => {
      expect(screen.getByText('Pelada não encontrada')).toBeInTheDocument();
    });
  });

  describe('displayName format in roster', () => {
    it('shows "Name - Nickname" when player has a distinct nickname', async () => {
      // Override player data so nickname differs from name
      mockGetPlayer.mockImplementation((playerId: string) => {
        const overrides: Record<string, PlayerRecord> = {
          pl1: { ...mockPlayers[0], nickname: 'Joãozinho' },
          pl2: { ...mockPlayers[1], nickname: null },
          pl3: { ...mockPlayers[2], nickname: null },
        };
        return Promise.resolve(overrides[playerId] ?? { id: playerId, name: 'Unknown', nickname: null });
      });

      render(<PeladaScreen profileId="prof-1" peladaId="p1" />);
      await waitFor(() => {
        expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
      });

      // Open roster accordion
      await userEvent.click(screen.getByRole('button', { name: /Roster/i }));
      // João is a line player — should show combined name without goalkeeper emoji
      expect(screen.queryByText('João - Joãozinho 🧤')).not.toBeInTheDocument();
      expect(await screen.findByText('João - Joãozinho')).toBeInTheDocument();
    });

    it('shows name only when player has no nickname', async () => {
      mockGetPlayer.mockImplementation((playerId: string) => {
        const overrides: Record<string, PlayerRecord> = {
          pl3: { ...mockPlayers[2], nickname: null },
        };
        const base = mockPlayers.find(p => p.id === playerId);
        return Promise.resolve(overrides[playerId] ?? base ?? { id: playerId, name: 'Unknown', nickname: null });
      });

      render(<PeladaScreen profileId="prof-1" peladaId="p1" />);
      await waitFor(() => {
        expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /Roster/i }));
      expect(await screen.findByText('Pedro')).toBeInTheDocument();
      expect(screen.queryByText(/Pedro -/)).not.toBeInTheDocument();
    });
  });

  describe('clone button', () => {
    it('renders clone button when onClone prop is provided', async () => {
      const onClone = vi.fn();
      render(<PeladaScreen profileId="prof-1" peladaId="p1" onClone={onClone} />);
      await waitFor(() => {
        expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: 'Clonar pelada' })).toBeInTheDocument();
    });

    it('does not render clone button when onClone prop is absent', async () => {
      render(<PeladaScreen profileId="prof-1" peladaId="p1" />);
      await waitFor(() => {
        expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
      });
      expect(screen.queryByRole('button', { name: 'Clonar pelada' })).not.toBeInTheDocument();
    });

    it('calls onClone with pelada data and team names when clicked', async () => {
      const onClone = vi.fn();
      render(<PeladaScreen profileId="prof-1" peladaId="p1" onClone={onClone} />);
      await waitFor(() => {
        expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: 'Clonar pelada' }));

      expect(onClone).toHaveBeenCalledOnce();
      const payload: ClonePeladaFormData = onClone.mock.calls[0][0];
      expect(payload.time).toBe(mockPelada.time);
      expect(payload.location).toBe(mockPelada.location);
      expect(payload.players_per_team).toBe(mockPelada.players_per_team);
      expect(payload.max_goalkeepers).toBe(mockPelada.max_goalkeepers);
      expect(payload.cost_per_player).toBe(mockPelada.cost_per_player);
      expect(payload.goalkeeper_pays).toBe(mockPelada.goalkeeper_pays);
      // team names from draw
      expect(payload.team_names).toContain('Time A');
      expect(payload.team_names).toContain('Time B');
    });
  });

  describe('Payments tab goalkeeper_pays filter', () => {
    const openPaymentsAccordion = async () => {
      const paymentsButton = screen.getByRole('button', { name: /Pagamentos/i });
      await userEvent.click(paymentsButton);
    };

    it('hides goalkeeper from payments when goalkeeper_pays is false', async () => {
      // mockPelada already has goalkeeper_pays: false
      render(<PeladaScreen profileId="prof-1" peladaId="p1" />);
      await waitFor(() => {
        expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
      });
      await openPaymentsAccordion();

      // Maria is the goalkeeper (pl2, slot_type: 'goalkeeper'); she should not appear
      const mariaPayLabel = screen.queryByLabelText('Marcar Maria como pago');
      expect(mariaPayLabel).not.toBeInTheDocument();

      // Line players (João, Pedro) should still appear
      expect(screen.getByLabelText('Marcar João como pago')).toBeInTheDocument();
      expect(screen.getByLabelText('Marcar Pedro como pago')).toBeInTheDocument();
    });

    it('shows goalkeeper in payments when goalkeeper_pays is true', async () => {
      mockGetPelada.mockResolvedValue({ ...mockPelada, goalkeeper_pays: true });
      render(<PeladaScreen profileId="prof-1" peladaId="p1" />);
      await waitFor(() => {
        expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
      });
      await openPaymentsAccordion();

      expect(screen.getByLabelText('Marcar Maria como pago')).toBeInTheDocument();
      expect(screen.getByLabelText('Marcar João como pago')).toBeInTheDocument();
      expect(screen.getByLabelText('Marcar Pedro como pago')).toBeInTheDocument();
    });
  });
});
