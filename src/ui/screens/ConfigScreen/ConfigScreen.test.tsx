import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ProfileRecord } from '@ports/repositories/ProfileRepository';
import { ConfigScreen } from './ConfigScreen';
import * as AppContextModule from '@ui/AppContext';

vi.mock('@ui/AppContext', async () => {
  const actual = await vi.importActual<typeof AppContextModule>('@ui/AppContext');
  return {
    ...actual,
    useApp: vi.fn(),
  };
});

const mockProfile: ProfileRecord = {
  id: 'prof-1',
  name: 'Pelada Segunda',
  convocation_template: 'Segunda de {{data}}, {{hora}}. Custa {{custo}}.',
  created_at: new Date('2026-06-01'),
};

describe('ConfigScreen', () => {
  let mockGetProfile: ReturnType<typeof vi.fn>;
  let mockUpdateProfile: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGetProfile = vi.fn().mockResolvedValue(mockProfile);
    mockUpdateProfile = vi.fn().mockResolvedValue(mockProfile);

    (AppContextModule.useApp as ReturnType<typeof vi.fn>).mockReturnValue({
      getProfile: { execute: mockGetProfile },
      updateProfile: { execute: mockUpdateProfile },
    });
  });

  it('renders header', async () => {
    render(<ConfigScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.getByText('⚙️ Configurações')).toBeInTheDocument();
      expect(screen.getByText('Gerenciar perfil')).toBeInTheDocument();
    });
  });

  it('loads profile on mount', async () => {
    render(<ConfigScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(mockGetProfile).toHaveBeenCalledWith('prof-1');
    });
  });

  it('displays loading state initially', () => {
    mockGetProfile.mockImplementationOnce(() => new Promise(() => {}));
    render(<ConfigScreen profileId="prof-1" />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('displays profile not found when profile is null', async () => {
    mockGetProfile.mockResolvedValueOnce(null);
    render(<ConfigScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.getByText('Perfil não encontrado')).toBeInTheDocument();
    });
  });

  it('displays profile data in form after loading', async () => {
    render(<ConfigScreen profileId="prof-1" />);
    await waitFor(() => {
      const inputs = screen.getAllByDisplayValue(/Pelada Segunda/);
      expect(inputs.length).toBeGreaterThan(0);
      expect(screen.getByDisplayValue(/Segunda de/)).toBeInTheDocument();
    });
  });

  it('displays template help section', async () => {
    render(<ConfigScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.getByText('📝 Variáveis disponíveis:')).toBeInTheDocument();
      expect(screen.getByText(/Data da pelada/)).toBeInTheDocument();
      expect(screen.getByText(/Hora da pelada/)).toBeInTheDocument();
    });
  });

  it('displays profile info (id and created_at)', async () => {
    render(<ConfigScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.getByText(/prof-1/)).toBeInTheDocument();
      expect(screen.getByText(/2026/)).toBeInTheDocument();
    });
  });

  it('updates form when user types', async () => {
    render(<ConfigScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.getByDisplayValue(/Pelada Segunda/)).toBeInTheDocument();
    });
    const nameInput = screen.getAllByDisplayValue(/Pelada Segunda/)[0] as HTMLInputElement;
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Pelada Quarta');
    expect(nameInput.value).toBe('Pelada Quarta');
  });

  it('disables save button when no changes', async () => {
    render(<ConfigScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.getByDisplayValue(/Pelada Segunda/)).toBeInTheDocument();
    });
    const saveButton = screen.getByRole('button', { name: /Salvar Alterações/ });
    expect(saveButton).toBeDisabled();
  });

  it('enables save button when form changes', async () => {
    render(<ConfigScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.getByDisplayValue(/Pelada Segunda/)).toBeInTheDocument();
    });
    const nameInput = screen.getAllByDisplayValue(/Pelada Segunda/)[0] as HTMLInputElement;
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Pelada Quarta');
    const saveButton = screen.getByRole('button', { name: /Salvar Alterações/ });
    expect(saveButton).not.toBeDisabled();
  });

  it('saves profile when button clicked', async () => {
    render(<ConfigScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.getByDisplayValue(/Pelada Segunda/)).toBeInTheDocument();
    });
    const nameInput = screen.getAllByDisplayValue(/Pelada Segunda/)[0] as HTMLInputElement;
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Pelada Quarta');
    const saveButton = screen.getByRole('button', { name: /Salvar Alterações/ });
    await userEvent.click(saveButton);
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith('prof-1', {
        name: 'Pelada Quarta',
        convocation_template: 'Segunda de {{data}}, {{hora}}. Custa {{custo}}.',
      });
    });
  });

  it('displays success message after save', async () => {
    render(<ConfigScreen profileId="prof-1" />);
    await waitFor(() => {
      expect(screen.getByDisplayValue(/Pelada Segunda/)).toBeInTheDocument();
    });
    const nameInput = screen.getAllByDisplayValue(/Pelada Segunda/)[0] as HTMLInputElement;
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Pelada Quarta');
    const saveButton = screen.getByRole('button', { name: /Salvar Alterações/ });
    await userEvent.click(saveButton);
    await waitFor(() => {
      expect(screen.getByText('✅ Salvo com sucesso!')).toBeInTheDocument();
    });
  });
});
