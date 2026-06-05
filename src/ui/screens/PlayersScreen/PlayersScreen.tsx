import { useEffect, useState } from 'react';
import { Button, Card, Input, BottomSheet, Badge } from '@ui/components';
import { useApp } from '@ui/AppContext';
import type { PlayerRecord } from '@ports/repositories/PlayerRepository';
import './PlayersScreen.css';

interface PlayersScreenProps {
  profileId: string;
}

/**
 * Screen for managing players in a profile.
 * Lists, creates, edits, and manages player status (active/inactive).
 */
export function PlayersScreen({ profileId }: PlayersScreenProps): JSX.Element {
  const app = useApp();
  const [players, setPlayers] = useState<PlayerRecord[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    phone: '',
    stars: 3,
    position: 'line' as 'goalkeeper' | 'line',
    speed: 'medium' as 'slow' | 'medium' | 'fast',
    default_type: 'line' as 'goalkeeper' | 'line',
  });

  // Load players on mount and when showInactive changes
  useEffect(() => {
    const loadPlayers = async () => {
      setLoading(true);
      try {
        const result = await app.listPlayers.execute(profileId, showInactive);
        setPlayers(result);
      } finally {
        setLoading(false);
      }
    };
    loadPlayers();
  }, [profileId, showInactive, app.listPlayers]);

  const handleCreatePlayer = async () => {
    if (!formData.name.trim()) return;
    try {
      await app.createPlayer.execute(profileId, {
        name: formData.name.trim(),
        nickname: formData.nickname || null,
        phone: formData.phone || null,
        stars: formData.stars,
        position: formData.position,
        speed: formData.speed,
        default_type: formData.default_type,
      });
      // Reset form and reload
      setFormData({
        name: '',
        nickname: '',
        phone: '',
        stars: 3,
        position: 'line',
        speed: 'medium',
        default_type: 'line',
      });
      setShowCreateSheet(false);
      const result = await app.listPlayers.execute(profileId, showInactive);
      setPlayers(result);
    } catch (error) {
      console.error('Error creating player:', error);
    }
  };

  const handleToggleStatus = async (playerId: string, currentStatus: 'active' | 'inactive') => {
    try {
      if (currentStatus === 'active') {
        await app.deactivatePlayer.execute(playerId);
      } else {
        await app.reactivatePlayer.execute(playerId);
      }
      // Reload players
      const result = await app.listPlayers.execute(profileId, showInactive);
      setPlayers(result);
    } catch (error) {
      console.error('Error toggling player status:', error);
    }
  };

  const getPositionLabel = (position: string): string => {
    return position === 'goalkeeper' ? '🧤' : '⚽';
  };

  const getSpeedLabel = (speed: string): string => {
    const speedMap: Record<string, string> = {
      slow: '🐢',
      medium: '🏃',
      fast: '⚡',
    };
    return speedMap[speed] || speed;
  };

  const getStarBadge = (stars: number): React.ReactNode => {
    return stars > 0 ? `⭐ ${stars.toFixed(1)}` : '⚪';
  };

  const activeCount = players.filter(p => p.status === 'active').length;
  const inactiveCount = players.filter(p => p.status === 'inactive').length;

  return (
    <div className="players-screen">
      <header className="players-header">
        <h1>👥 Peladeiros</h1>
        <p>Gerenciar jogadores</p>
      </header>

      <main className="players-main">
        <div className="players-filters">
          <div className="filter-badge">
            <Badge label={`Ativos: ${activeCount}`} variant="success" />
          </div>
          {inactiveCount > 0 && (
            <div className="filter-badge">
              <Badge label={`Inativos: ${inactiveCount}`} variant="default" />
            </div>
          )}
          {inactiveCount > 0 && (
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setShowInactive(!showInactive)}
              className="players-toggle-inactive"
            >
              {showInactive ? '✓ Mostrando inativos' : 'Mostrar inativos'}
            </Button>
          )}
        </div>

        {loading ? (
          <p className="players-loading">Carregando...</p>
        ) : players.length === 0 ? (
          <p className="players-empty">Nenhum jogador adicionado</p>
        ) : (
          <div className="players-list">
            {players.map(player => (
              <Card key={player.id} className="player-card">
                <div className="player-card-header">
                  <div className="player-card-name">
                    <h3>{player.name}</h3>
                    {player.nickname && <p className="player-nickname">{player.nickname}</p>}
                  </div>
                  <div className="player-card-status">
                    <button
                      className={`status-toggle ${player.status}`}
                      onClick={() => handleToggleStatus(player.id, player.status)}
                      aria-label={`Toggle ${player.name} status`}
                      title={player.status === 'active' ? 'Inativar' : 'Reativar'}
                    >
                      {player.status === 'active' ? '✅' : '⭕'}
                    </button>
                  </div>
                </div>

                <div className="player-card-stats">
                  <span className="stat">
                    {getPositionLabel(player.position)} {player.position}
                  </span>
                  <span className="stat">
                    {getSpeedLabel(player.speed)} {player.speed}
                  </span>
                  <span className="stat">{getStarBadge(player.stars)}</span>
                </div>

                {player.phone && <p className="player-phone">📱 {player.phone}</p>}
              </Card>
            ))}
          </div>
        )}

        <Button
          variant="secondary"
          fullWidth
          onClick={() => setShowCreateSheet(true)}
          className="players-create-button"
        >
          + Adicionar jogador
        </Button>
      </main>

      {/* Create sheet */}
      <BottomSheet
        open={showCreateSheet}
        onClose={() => {
          setShowCreateSheet(false);
          setFormData({
            name: '',
            nickname: '',
            phone: '',
            stars: 3,
            position: 'line',
            speed: 'medium',
            default_type: 'line',
          });
        }}
        title="Novo jogador"
      >
        <form
          className="players-create-form"
          onSubmit={e => {
            e.preventDefault();
            handleCreatePlayer();
          }}
        >
          <Input
            label="Nome *"
            placeholder="Ex: João Silva"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Apelido"
            placeholder="Ex: Joãozinho"
            value={formData.nickname}
            onChange={e => setFormData({ ...formData, nickname: e.target.value })}
          />
          <Input
            label="Telefone"
            placeholder="Ex: (11) 99999-9999"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
          />

          <div className="players-form-row">
            <div>
              <label className="form-label">Posição</label>
              <select
                value={formData.position}
                onChange={e => setFormData({ ...formData, position: e.target.value as 'goalkeeper' | 'line' })}
                className="form-select"
              >
                <option value="line">⚽ Linha</option>
                <option value="goalkeeper">🧤 Goleiro</option>
              </select>
            </div>
            <div>
              <label className="form-label">Velocidade</label>
              <select
                value={formData.speed}
                onChange={e => setFormData({ ...formData, speed: e.target.value as 'slow' | 'medium' | 'fast' })}
                className="form-select"
              >
                <option value="slow">🐢 Lento</option>
                <option value="medium">🏃 Médio</option>
                <option value="fast">⚡ Rápido</option>
              </select>
            </div>
          </div>

          <div className="players-form-row">
            <div>
              <label className="form-label">Estrelas (0-5)</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.5"
                value={formData.stars}
                onChange={e => setFormData({ ...formData, stars: parseFloat(e.target.value) })}
                className="form-number"
              />
            </div>
            <div>
              <label className="form-label">Tipo padrão</label>
              <select
                value={formData.default_type}
                onChange={e => setFormData({ ...formData, default_type: e.target.value as 'goalkeeper' | 'line' })}
                className="form-select"
              >
                <option value="line">⚽ Linha</option>
                <option value="goalkeeper">🧤 Goleiro</option>
              </select>
            </div>
          </div>

          <Button variant="primary" fullWidth type="submit">
            Adicionar
          </Button>
        </form>
      </BottomSheet>
    </div>
  );
}
