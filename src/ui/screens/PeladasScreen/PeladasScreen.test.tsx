import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PeladaRecord } from '@ports/repositories/PeladaRepository';
import { PeladasScreen } from './PeladasScreen';
import type { ClonePeladaFormData } from './PeladasScreen';
import * as AppContextModule from '@ui/AppContext';

vi.mock('@ui/AppContext', async () => {
  const actual = await vi.importActual<typeof AppContextModule>('@ui/AppContext');
  return {
    ...actual,
    useApp: vi.fn(),
  };
});

const mockPeladas: PeladaRecord[] = [
  {
    id: '1',
    profile_id: 'prof-1',
    date: new Date('2026-06-20'),
    time: '19:00',
    location: 'Quadra Centro',
    players_per_team: 5,
    max_goalkeepers: 1,
    cost_per_player: 5000,
    goalkeeper_pays: false,
    created_at: new Date(),
  },
  {
    id: '2',
    profile_id: 'prof-1',
    date: new Date('2026-06-27'),
    time: '20:00',
    location: 'Quadra Norte',
    players_per_team: 6,
    max_goalkeepers: 1,
    cost_per_player: 6000,
    goalkeeper_pays: true,
    created_at: new Date(),
  },
];

describe('PeladasScreen', () => {
  let mockListPeladas: ReturnType<typeof vi.fn>;
  let mockCreatePelada: ReturnType<typeof vi.fn>;
  let mockDeletePelada: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockListPeladas = vi.fn().mockResolvedValue(mockPeladas);
    mockCreatePelada = vi.fn().mockResolvedValue({ ...mockPeladas[0], id: '3' });
    mockDeletePelada = vi.fn().mockResolvedValue(undefined);

    (AppContextModule.useApp as ReturnType<typeof vi.fn>).mockReturnValue({
      listPeladas: { execute: mockListPeladas },
      createPelada: { execute: mockCreatePelada },
      deletePelada: { execute: mockDeletePelada },
    });
  });

  it('renders header', () => {
    render(<PeladasScreen profileId="prof-1" />);
    expect(screen.getByText('⚽ Peladas')).toBeInTheDocument();
    expect(screen.getByText('Seus eventos de futebol')).toBeInTheDocument();
  });

  it('loads and displays peladas', async () => {
    render(<PeladasScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.getByText(/Quadra Centro/)).toBeInTheDocument();
      expect(screen.getByText(/Quadra Norte/)).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    mockListPeladas.mockImplementationOnce(() => new Promise(() => {})); // Never resolves
    render(<PeladasScreen profileId="prof-1" />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('displays empty state when no peladas', async () => {
    mockListPeladas.mockResolvedValueOnce([]);
    render(<PeladasScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.getByText('Nenhuma pelada criada ainda')).toBeInTheDocument();
    });
  });

  it('opens create sheet when FAB clicked', async () => {
    render(<PeladasScreen profileId="prof-1" />);
    const fab = screen.getByLabelText('Criar nova pelada');
    await userEvent.click(fab);
    await waitFor(() => {
      expect(screen.getByText('Nova pelada')).toBeInTheDocument();
    });
  });

  it('opens create sheet when button clicked', async () => {
    render(<PeladasScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    });
    const button = screen.getByText('+ Criar nova pelada');
    await userEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText('Nova pelada')).toBeInTheDocument();
    });
  });

  it('creates pelada on form submit', async () => {
    render(<PeladasScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    });

    const fab = screen.getByLabelText('Criar nova pelada');
    await userEvent.click(fab);

    const timeInput = screen.getByLabelText('Hora (opcional)');
    await userEvent.type(timeInput, '14:30');

    const submitButton = screen.getByRole('button', { name: 'Criar' });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreatePelada).toHaveBeenCalledWith(
        'prof-1',
        expect.objectContaining({ time: '14:30' }),
        ['Time A', 'Time B'],
      );
    });
  });

  it('displays delete button for each pelada', async () => {
    render(<PeladasScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    });
    const deleteButtons = screen.getAllByLabelText(/Excluir pelada/);
    expect(deleteButtons.length).toBe(2);
  });

  it('opens delete confirmation when delete button clicked', async () => {
    render(<PeladasScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    });
    const deleteButtons = screen.getAllByLabelText(/Excluir pelada/);
    await userEvent.click(deleteButtons[0]);
    await waitFor(() => {
      expect(screen.getByText('Apagar pelada?')).toBeInTheDocument();
    });
  });

  it('deletes pelada on confirmation', async () => {
    render(<PeladasScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByLabelText(/Excluir pelada/);
    await userEvent.click(deleteButtons[0]);

    const confirmButton = screen.getByRole('button', { name: 'Apagar' });
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeletePelada).toHaveBeenCalledWith(mockPeladas[0].id);
    });
  });

  describe('clone pre-fill', () => {
    const cloneData: ClonePeladaFormData = {
      time: '09:00',
      location: 'Campo do Zé',
      team_names: 'Azul\nVermelho\nVerde',
      players_per_team: 6,
      max_goalkeepers: 2,
      cost_per_player: 1400,
      goalkeeper_pays: true,
    };

    it('opens the create sheet when cloneData is provided', async () => {
      render(<PeladasScreen profileId="prof-1" cloneData={cloneData} />);
      await waitFor(() => {
        expect(screen.getByText('Nova pelada')).toBeInTheDocument();
      });
    });

    it('pre-fills the form with clone data and leaves date empty', async () => {
      render(<PeladasScreen profileId="prof-1" cloneData={cloneData} />);
      await waitFor(() => {
        expect(screen.getByText('Nova pelada')).toBeInTheDocument();
      });

      const timeInput = screen.getByLabelText('Hora (opcional)') as HTMLInputElement;
      expect(timeInput.value).toBe('09:00');

      const locationInput = screen.getByLabelText('Local (opcional)') as HTMLInputElement;
      expect(locationInput.value).toBe('Campo do Zé');

      const dateInput = screen.getByLabelText('Data') as HTMLInputElement;
      expect(dateInput.value).toBe('');
    });
  });
});
