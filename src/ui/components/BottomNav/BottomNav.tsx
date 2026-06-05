interface BottomNavProps {
  active: 'peladas' | 'players' | 'financial' | 'config';
  onNavigate: (tab: 'peladas' | 'players' | 'financial' | 'config') => void;
}

/**
 * Bottom navigation bar for main tabs.
 * Visible on peladas, players, financial, and config screens only.
 */
export function BottomNav({ active, onNavigate }: BottomNavProps): JSX.Element {
  const tabs = [
    { id: 'peladas', label: '⚽ Peladas' },
    { id: 'players', label: '👥 Jogadores' },
    { id: 'financial', label: '💰 Caixa' },
    { id: 'config', label: '⚙️ Config' },
  ] as const;

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`bottom-nav-item ${active === tab.id ? 'active' : ''}`}
          onClick={() => onNavigate(tab.id)}
          aria-label={tab.label}
          aria-current={active === tab.id ? 'page' : undefined}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
