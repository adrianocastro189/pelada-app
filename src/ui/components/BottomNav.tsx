import './BottomNav.css';

type NavTab = 'peladas' | 'players' | 'financial' | 'config';

interface BottomNavProps {
  active: NavTab;
  onNavigate: (tab: NavTab) => void;
}

const TABS: { id: NavTab; label: string; icon: string }[] = [
  { id: 'peladas', label: 'Peladas', icon: '⚽' },
  { id: 'players', label: 'Peladeiros', icon: '👥' },
  { id: 'financial', label: 'Caixinha', icon: '💰' },
  { id: 'config', label: 'Config', icon: '⚙️' },
];

/**
 * Bottom navigation bar with 4 main tabs.
 */
export function BottomNav({ active, onNavigate }: BottomNavProps): JSX.Element {
  return (
    <nav className="bottom-nav">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`bottom-nav-tab ${active === tab.id ? 'bottom-nav-tab--active' : ''}`}
          onClick={() => onNavigate(tab.id)}
          aria-label={tab.label}
          aria-current={active === tab.id ? 'page' : undefined}
        >
          <span className="bottom-nav-icon">{tab.icon}</span>
          <span className="bottom-nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
