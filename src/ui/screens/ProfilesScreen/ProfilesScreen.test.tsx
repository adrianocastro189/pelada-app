import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ProfileRecord } from '@ports/repositories/ProfileRepository';
import { ProfilesScreen } from './ProfilesScreen';
import * as AppContextModule from '@ui/AppContext';

vi.mock('@ui/AppContext', async () => {
  const actual = await vi.importActual<typeof AppContextModule>('@ui/AppContext');
  return {
    ...actual,
    useApp: vi.fn(),
  };
});

const mockProfiles: ProfileRecord[] = [
  { id: '1', name: 'Pelada Segunda', convocation_template: '', created_at: new Date() },
  { id: '2', name: 'Pelada Quinta', convocation_template: '', created_at: new Date() },
];

describe('ProfilesScreen', () => {
  let mockListProfiles: ReturnType<typeof vi.fn>;
  let mockCreateProfile: ReturnType<typeof vi.fn>;
  let mockDeleteProfile: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockListProfiles = vi.fn().mockResolvedValue(mockProfiles);
    mockCreateProfile = vi.fn().mockResolvedValue({ id: '3', name: 'New Profile', convocation_template: '', created_at: new Date() });
    mockDeleteProfile = vi.fn().mockResolvedValue(undefined);

    (AppContextModule.useApp as ReturnType<typeof vi.fn>).mockReturnValue({
      listProfiles: { execute: mockListProfiles },
      createProfile: { execute: mockCreateProfile },
      deleteProfile: { execute: mockDeleteProfile },
    });
  });

  it('renders header', () => {
    render(<ProfilesScreen />);
    expect(screen.getByText('⚽ Pelada App')).toBeInTheDocument();
    expect(screen.getByText('Qual pelada você vai gerenciar?')).toBeInTheDocument();
  });

  it('loads and displays profiles', async () => {
    render(<ProfilesScreen />);
    await waitFor(() => {
      expect(screen.getByText('Pelada Segunda')).toBeInTheDocument();
      expect(screen.getByText('Pelada Quinta')).toBeInTheDocument();
    });
  });

  it('displays loading state', () => {
    mockListProfiles.mockImplementationOnce(() => new Promise(() => {})); // Never resolves
    render(<ProfilesScreen />);
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('displays empty state when no profiles', async () => {
    mockListProfiles.mockResolvedValueOnce([]);
    render(<ProfilesScreen />);
    await waitFor(() => {
      expect(screen.getByText('Nenhum perfil criado ainda')).toBeInTheDocument();
    });
  });

  it('opens create sheet when FAB clicked', async () => {
    render(<ProfilesScreen />);
    const fab = screen.getByLabelText('Create new profile');
    await userEvent.click(fab);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Ex: Pelada Segunda')).toBeInTheDocument();
    });
  });

  it('opens create sheet when button clicked', async () => {
    render(<ProfilesScreen />);
    const button = screen.getByText('+ Criar novo perfil');
    await userEvent.click(button);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Ex: Pelada Segunda')).toBeInTheDocument();
    });
  });

  it('creates profile on form submit', async () => {
    render(<ProfilesScreen />);
    const button = screen.getByText('+ Criar novo perfil');
    await userEvent.click(button);

    const input = screen.getByPlaceholderText('Ex: Pelada Segunda');
    await userEvent.type(input, 'New Pelada');

    const submitButton = screen.getByRole('button', { name: 'Criar' });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateProfile).toHaveBeenCalledWith({ name: 'New Pelada' });
    });
  });

  it('displays delete button for each profile', async () => {
    render(<ProfilesScreen />);
    await waitFor(() => {
      expect(screen.getByText('Pelada Segunda')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByLabelText(/Delete/);
    expect(deleteButtons.length).toBeGreaterThan(0);
  });
});
