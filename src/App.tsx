import { useState } from 'react';
import { useApp } from '@ui/AppContext';
import { ProfilesScreen } from '@ui/screens/ProfilesScreen';
import { PeladasScreen } from '@ui/screens/PeladasScreen';
import type { ClonePeladaFormData } from '@ui/screens/PeladasScreen';
import { PeladaScreen } from '@ui/screens/PeladaScreen';
import { PlayersScreen } from '@ui/screens/PlayersScreen';
import { FinancialScreen } from '@ui/screens/FinancialScreen';
import { ConfigScreen } from '@ui/screens/ConfigScreen';
import { BottomNav } from '@ui/components';
import './App.css';

type Screen =
  | { name: 'profiles' }
  | { name: 'peladas'; profileId: string; cloneData?: ClonePeladaFormData }
  | { name: 'pelada'; profileId: string; peladaId: string }
  | { name: 'players'; profileId: string }
  | { name: 'financial'; profileId: string }
  | { name: 'config'; profileId: string };

/**
 * Root App component.
 * Manages navigation state and renders the active screen.
 */
export default function App(): JSX.Element {
  useApp(); // Validates Context availability

  const [screen, setScreen] = useState<Screen>({ name: 'profiles' });

  // Helper: navigate to a main tab (peladas/players/financial/config)
  // Requires an active profileId
  const navigateToTab = (tab: 'peladas' | 'players' | 'financial' | 'config') => {
    if (screen.name === 'profiles') return; // No profile selected yet
    const profileId = (screen as { profileId: string }).profileId;
    setScreen({ name: tab, profileId } as Screen);
  };

  const activeTab = (): 'peladas' | 'players' | 'financial' | 'config' | null => {
    if (screen.name === 'profiles' || screen.name === 'pelada') return null;
    if (screen.name === 'peladas') return 'peladas';
    if (screen.name === 'players') return 'players';
    if (screen.name === 'financial') return 'financial';
    if (screen.name === 'config') return 'config';
    return null;
  };

  const showBottomNav = screen.name !== 'profiles' && screen.name !== 'pelada';

  return (
    <div className="app">
      {screen.name === 'profiles' && (
        <ProfilesScreen
          onSelectProfile={profileId => setScreen({ name: 'peladas', profileId })}
        />
      )}

      {screen.name === 'peladas' && (
        <PeladasScreen
          profileId={screen.profileId}
          cloneData={screen.cloneData}
          onSelectPelada={peladaId =>
            setScreen({
              name: 'pelada',
              profileId: screen.profileId,
              peladaId,
            })
          }
        />
      )}

      {screen.name === 'pelada' && (
        <PeladaScreen
          profileId={screen.profileId}
          peladaId={screen.peladaId}
          onBack={() => setScreen({ name: 'peladas', profileId: screen.profileId })}
          onClone={data =>
            setScreen({ name: 'peladas', profileId: screen.profileId, cloneData: data })
          }
          onDelete={() => setScreen({ name: 'peladas', profileId: screen.profileId })}
        />
      )}

      {screen.name === 'players' && <PlayersScreen profileId={screen.profileId} />}

      {screen.name === 'financial' && (
        <FinancialScreen profileId={screen.profileId} />
      )}

      {screen.name === 'config' && (
        <ConfigScreen
          profileId={screen.profileId}
          onSwitchProfile={() => setScreen({ name: 'profiles' })}
        />
      )}

      {showBottomNav && (
        <BottomNav active={activeTab() ?? 'peladas'} onNavigate={navigateToTab} />
      )}
    </div>
  );
}
