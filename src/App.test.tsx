import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import * as AppContextModule from '@ui/AppContext';

vi.mock('@ui/AppContext', async () => {
  const actual = await vi.importActual<typeof AppContextModule>('@ui/AppContext');
  return {
    ...actual,
    useApp: vi.fn(),
  };
});

vi.mock('@ui/screens/ProfilesScreen', () => ({
  ProfilesScreen: ({
    onSelectProfile,
  }: {
    onSelectProfile?: (id: string) => void;
  }) => (
    <div data-testid="profiles-screen">
      <button onClick={() => onSelectProfile?.('prof-1')}>Select Profile</button>
    </div>
  ),
}));

vi.mock('@ui/screens/PeladasScreen', () => ({
  PeladasScreen: ({
    onSelectPelada,
  }: {
    profileId: string;
    onSelectPelada?: (id: string) => void;
  }) => (
    <div data-testid="peladas-screen">
      <button onClick={() => onSelectPelada?.('pel-1')}>Select Pelada</button>
    </div>
  ),
}));

vi.mock('@ui/screens/PeladaScreen', () => ({
  PeladaScreen: ({ onBack }: { profileId: string; peladaId: string; onBack?: () => void }) => (
    <div data-testid="pelada-screen">
      <button onClick={() => onBack?.()}>Back</button>
    </div>
  ),
}));

vi.mock('@ui/screens/PlayersScreen', () => ({
  PlayersScreen: ({ profileId }: { profileId: string }) => (
    <div data-testid="players-screen">Players: {profileId}</div>
  ),
}));

vi.mock('@ui/screens/FinancialScreen', () => ({
  FinancialScreen: ({ profileId }: { profileId: string }) => (
    <div data-testid="financial-screen">Financial: {profileId}</div>
  ),
}));

vi.mock('@ui/screens/ConfigScreen', () => ({
  ConfigScreen: ({
    profileId,
    onSwitchProfile,
  }: {
    profileId: string;
    onSwitchProfile?: () => void;
  }) => (
    <div data-testid="config-screen">
      <p>Config: {profileId}</p>
      <button onClick={() => onSwitchProfile?.()}>Switch Profile</button>
    </div>
  ),
}));

vi.mock('@ui/components', () => ({
  BottomNav: ({
    active,
    onNavigate,
  }: {
    active: string;
    onNavigate: (tab: string) => void;
  }) => (
    <nav data-testid="bottom-nav">
      <button onClick={() => onNavigate('peladas')}>Peladas</button>
      <button onClick={() => onNavigate('players')}>Players</button>
      <button onClick={() => onNavigate('financial')}>Financial</button>
      <button onClick={() => onNavigate('config')}>Config</button>
      <span data-testid="active-tab">{active}</span>
    </nav>
  ),
}));

describe('App', () => {
  beforeEach(() => {
    (AppContextModule.useApp as ReturnType<typeof vi.fn>).mockReturnValue(undefined);
  });

  it('renders ProfilesScreen on initial load', () => {
    render(<App />);
    expect(screen.getByTestId('profiles-screen')).toBeInTheDocument();
  });

  it('navigates to PeladasScreen when profile is selected', async () => {
    render(<App />);
    const selectButton = screen.getByText('Select Profile');
    await userEvent.click(selectButton);
    await waitFor(() => {
      expect(screen.getByTestId('peladas-screen')).toBeInTheDocument();
    });
  });

  it('navigates to PeladaScreen when pelada is selected', async () => {
    render(<App />);
    const selectProfileButton = screen.getByText('Select Profile');
    await userEvent.click(selectProfileButton);
    const selectPeladaButton = screen.getByText('Select Pelada');
    await userEvent.click(selectPeladaButton);
    await waitFor(() => {
      expect(screen.getByTestId('pelada-screen')).toBeInTheDocument();
    });
  });

  it('returns to PeladasScreen when back is clicked', async () => {
    render(<App />);
    const selectProfileButton = screen.getByText('Select Profile');
    await userEvent.click(selectProfileButton);
    const selectPeladaButton = screen.getByText('Select Pelada');
    await userEvent.click(selectPeladaButton);
    const backButton = screen.getByText('Back');
    await userEvent.click(backButton);
    await waitFor(() => {
      expect(screen.getByTestId('peladas-screen')).toBeInTheDocument();
    });
  });

  it('does not show BottomNav on ProfilesScreen', () => {
    render(<App />);
    expect(screen.queryByTestId('bottom-nav')).not.toBeInTheDocument();
  });

  it('shows BottomNav on PeladasScreen', async () => {
    render(<App />);
    const selectButton = screen.getByText('Select Profile');
    await userEvent.click(selectButton);
    await waitFor(() => {
      expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
    });
  });

  it('does not show BottomNav on PeladaScreen', async () => {
    render(<App />);
    const selectProfileButton = screen.getByText('Select Profile');
    await userEvent.click(selectProfileButton);
    const selectPeladaButton = screen.getByText('Select Pelada');
    await userEvent.click(selectPeladaButton);
    await waitFor(() => {
      expect(screen.queryByTestId('bottom-nav')).not.toBeInTheDocument();
    });
  });

  it('navigates to different tabs via BottomNav', async () => {
    render(<App />);
    const selectButton = screen.getByText('Select Profile');
    await userEvent.click(selectButton);
    await waitFor(() => {
      expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
    });

    const playersTabButton = screen.getAllByText('Players')[0];
    await userEvent.click(playersTabButton);
    await waitFor(() => {
      expect(screen.getByTestId('players-screen')).toBeInTheDocument();
    });
  });

  it('navigates back to ProfilesScreen when switching profile', async () => {
    render(<App />);
    const selectButton = screen.getByText('Select Profile');
    await userEvent.click(selectButton);
    const configButton = screen.getAllByText('Config')[0];
    await userEvent.click(configButton);
    await waitFor(() => {
      expect(screen.getByTestId('config-screen')).toBeInTheDocument();
    });
    const switchProfileButton = screen.getByText('Switch Profile');
    await userEvent.click(switchProfileButton);
    await waitFor(() => {
      expect(screen.getByTestId('profiles-screen')).toBeInTheDocument();
    });
  });
})
