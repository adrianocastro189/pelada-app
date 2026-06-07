import { useEffect, useState } from 'react';
import { Button, Card, Input, BottomSheet, Badge } from '@ui/components';
import { useApp } from '@ui/AppContext';
import type { PlayerRecord, PlayerPosition } from '@ports/repositories/PlayerRepository';
import './PlayersScreen.css';

/** Returns "Name - Nickname" when a nickname exists, otherwise just "Name". */
function displayName(player: { name: string; nickname?: string | null }): string {
  return player.nickname ? `${player.name} - ${player.nickname}` : player.name;
}

interface PlayersScreenProps {
  profileId: string;
}

const emptyForm = {
  name: '',
  nickname: '',
  phone: '',
  stars: 3,
  position: 'midfield' as PlayerPosition,
  speed: 'medium' as 'slow' | 'medium' | 'fast',
};

/** Portuguese label + emoji for each position. */
const POSITION_META: Record<PlayerPosition, { emoji: string; name: string }> = {
  goalkeeper: { emoji: '🧤', name: 'Goleiro' },
  defense: { emoji: '🛡️', name: 'Defesa' },
  midfield: { emoji: '🎯', name: 'Meio' },
  attack: { emoji: '⚔️', name: 'Ataque' },
};

/**
 * Screen for managing players in a profile.
 * Lists, creates, edits, and manages player status (active/inactive).
 */
export function PlayersScreen({ profileId }: PlayersScreenProps): JSX.Element {
  const app = useApp();
  const [players, setPlayers] = useState<PlayerRecord[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  // The player currently being edited, or null when creating a new one.
  const [editing, setEditing] = useState<PlayerRecord | null>(null);
  const [confirmInactivate, setConfirmInactivate] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const reloadPlayers = async () => {
    const result = await app.listPlayers.execute(profileId, showInactive);
    setPlayers(result);
  };

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

  const closeSheet = () => {
    setShowSheet(false);
    setEditing(null);
    setConfirmInactivate(false);
    setFormData(emptyForm);
  };

  const openCreateSheet = () => {
    setEditing(null);
    setConfirmInactivate(false);
    setFormData(emptyForm);
    setShowSheet(true);
  };

  const openEditSheet = (player: PlayerRecord) => {
    setEditing(player);
    setConfirmInactivate(false);
    setFormData({
      name: player.name,
      nickname: player.nickname ?? '',
      phone: player.phone ?? '',
      stars: player.stars,
      position: player.position,
      speed: player.speed,
    });
    setShowSheet(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    const payload = {
      name: formData.name.trim(),
      nickname: formData.nickname || null,
      phone: formData.phone || null,
      stars: formData.stars,
      position: formData.position,
      speed: formData.speed,
    };
    try {
      if (editing) {
        await app.updatePlayer.execute(editing.id, payload);
      } else {
        await app.createPlayer.execute(profileId, payload);
      }
      closeSheet();
      await reloadPlayers();
    } catch (error) {
      console.error('Error saving player:', error);
    }
  };

  const handleToggleStatus = async (player: PlayerRecord) => {
    try {
      if (player.status === 'active') {
        await app.deactivatePlayer.execute(player.id);
      } else {
        await app.reactivatePlayer.execute(player.id);
      }
      closeSheet();
      await reloadPlayers();
    } catch (error) {
      console.error('Error toggling player status:', error);
    }
  };

  const getPositionLabel = (position: PlayerPosition): string => {
    const meta = POSITION_META[position];
    return `${meta.emoji} ${meta.name}`;
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
                    <h3>{displayName(player)}</h3>
                  </div>
                  <div className="player-card-actions">
                    {player.status === 'inactive' && (
                      <Badge label="Inativo" variant="default" />
                    )}
                    <button
                      className="player-edit-button"
                      onClick={() => openEditSheet(player)}
                      aria-label={`Editar ${displayName(player)}`}
                      title="Editar"
                    >
                      ✏️
                    </button>
                  </div>
                </div>

                <div className="player-card-stats">
                  <span className="stat">
                    {getPositionLabel(player.position)}
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
          onClick={openCreateSheet}
          className="players-create-button"
        >
          + Adicionar jogador
        </Button>
      </main>

      {/* Create / edit sheet */}
      <BottomSheet
        open={showSheet}
        onClose={closeSheet}
        title={editing ? 'Editar jogador' : 'Novo jogador'}
      >
        <form
          className="players-create-form"
          onSubmit={e => {
            e.preventDefault();
            handleSubmit();
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
                onChange={e => setFormData({ ...formData, position: e.target.value as PlayerPosition })}
                className="form-select"
              >
                <option value="goalkeeper">🧤 Goleiro</option>
                <option value="defense">🛡️ Defesa</option>
                <option value="midfield">🎯 Meio</option>
                <option value="attack">⚔️ Ataque</option>
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
          </div>

          {!confirmInactivate && (
            <>
              <Button variant="primary" fullWidth type="submit">
                {editing ? 'Salvar' : 'Adicionar'}
              </Button>

              {editing && editing.status === 'active' && (
                <Button
                  variant="destructive"
                  fullWidth
                  type="button"
                  onClick={() => setConfirmInactivate(true)}
                >
                  Inativar jogador
                </Button>
              )}
              {editing && editing.status === 'inactive' && (
                <Button
                  variant="secondary"
                  fullWidth
                  type="button"
                  onClick={() => handleToggleStatus(editing)}
                >
                  Reativar jogador
                </Button>
              )}
            </>
          )}

          {editing && confirmInactivate && (
            <div className="players-inactivate-confirm">
              <p>Inativar <strong>{displayName(editing)}</strong>? O histórico é preservado e você pode reativá-lo depois.</p>
              <div className="players-inactivate-buttons">
                <Button
                  variant="ghost"
                  fullWidth
                  type="button"
                  onClick={() => setConfirmInactivate(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  fullWidth
                  type="button"
                  onClick={() => handleToggleStatus(editing)}
                >
                  Confirmar
                </Button>
              </div>
            </div>
          )}
        </form>
      </BottomSheet>
    </div>
  );
}
