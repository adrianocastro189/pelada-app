import { useEffect, useState } from 'react';
import { Accordion, Button, BottomSheet } from '@ui/components';
import { useApp } from '@ui/AppContext';
import type { PeladaRecord } from '@ports/repositories/PeladaRepository';
import type { PeladaPlayerRecord } from '@ports/repositories/PeladaPlayerRepository';
import type { DrawResult } from '@application/use-cases/draw/GetDrawUseCase';
import type { PlayerRecord } from '@ports/repositories/PlayerRepository';
import './PeladaScreen.css';

interface PeladaScreenProps {
  profileId: string;
  peladaId: string;
  onBack?: () => void;
}

/**
 * Screen for viewing and managing a single pelada (match).
 * Displays pelada info, roster, draw, and payments in accordions.
 */
export function PeladaScreen({ profileId, peladaId, onBack }: PeladaScreenProps): JSX.Element {
  const app = useApp();
  const [pelada, setPelada] = useState<PeladaRecord | null>(null);
  const [roster, setRoster] = useState<PeladaPlayerRecord[]>([]);
  const [draw, setDraw] = useState<DrawResult[]>([]);
  const [players, setPlayers] = useState<Map<string, PlayerRecord>>(new Map());
  const [loading, setLoading] = useState(true);
  const [drawingTeams, setDrawingTeams] = useState(false);
  const [showAddRoster, setShowAddRoster] = useState(false);
  const [profilePlayers, setProfilePlayers] = useState<PlayerRecord[]>([]);

  // Reload the roster and the player lookup map used by the payment/draw tables.
  const reloadRoster = async () => {
    const rosterData = await app.getRoster.execute(peladaId);
    setRoster(rosterData);
    const playerMap = new Map<string, PlayerRecord>();
    for (const rosterEntry of rosterData) {
      const player = await app.getPlayer.execute(rosterEntry.player_id);
      playerMap.set(rosterEntry.player_id, player);
    }
    setPlayers(playerMap);
  };

  // Load pelada data on mount
  useEffect(() => {
    const loadPeladaData = async () => {
      setLoading(true);
      try {
        const [peladaData, rosterData, drawData] = await Promise.all([
          app.getPelada.execute(peladaId),
          app.getRoster.execute(peladaId),
          app.getDraw.execute(peladaId),
        ]);

        setPelada(peladaData);
        setRoster(rosterData);
        setDraw(drawData);

        // Load player names for roster (for payment table)
        const playerMap = new Map<string, PlayerRecord>();
        for (const rosterEntry of rosterData) {
          const player = await app.getPlayer.execute(rosterEntry.player_id);
          playerMap.set(rosterEntry.player_id, player);
        }
        setPlayers(playerMap);
      } finally {
        setLoading(false);
      }
    };

    loadPeladaData();
  }, [peladaId, app]);

  const openAddRoster = async () => {
    setShowAddRoster(true);
    try {
      const active = await app.listPlayers.execute(profileId, false);
      setProfilePlayers(active);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const handleAddToRoster = async (player: PlayerRecord) => {
    try {
      await app.addToRoster.execute(peladaId, player.id, player.default_type);
      await reloadRoster();
    } catch (error) {
      console.error('Error adding player to roster:', error);
    }
  };

  const handleRemoveFromRoster = async (playerId: string) => {
    try {
      await app.removeFromRoster.execute(peladaId, playerId);
      await reloadRoster();
    } catch (error) {
      console.error('Error removing player from roster:', error);
    }
  };

  const handleDrawTeams = async () => {
    setDrawingTeams(true);
    try {
      await app.drawTeams.execute(peladaId);
      // Reload draw
      const drawData = await app.getDraw.execute(peladaId);
      setDraw(drawData);
    } catch (error) {
      console.error('Error drawing teams:', error);
    } finally {
      setDrawingTeams(false);
    }
  };

  const handleSetPlayerPaid = async (rosterEntryId: string, playerId: string, paid: boolean) => {
    try {
      await app.setPlayerPaid.execute(peladaId, playerId, paid);
      // Update local state
      setRoster(
        roster.map(entry => (entry.id === rosterEntryId ? { ...entry, paid } : entry)),
      );
    } catch (error) {
      console.error('Error updating payment:', error);
    }
  };

  if (loading) {
    return (
      <div className="pelada-screen">
        <p className="pelada-loading">Carregando...</p>
      </div>
    );
  }

  if (!pelada) {
    return (
      <div className="pelada-screen">
        <p className="pelada-not-found">Pelada não encontrada</p>
      </div>
    );
  }

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  const formatCurrency = (cents: number): string => {
    return `R$ ${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="pelada-screen">
      <header className="pelada-header">
        {onBack && (
          <button
            className="pelada-back-button"
            onClick={onBack}
            aria-label="Voltar"
          >
            ← Voltar
          </button>
        )}
        <h1>⚽ {formatDate(pelada.date)}</h1>
        {pelada.time && <p className="pelada-time">🕐 {pelada.time}</p>}
        {pelada.location && <p className="pelada-location">📍 {pelada.location}</p>}
      </header>

      <main className="pelada-main">
        {/* Info Accordion */}
        <Accordion title="Informações" icon="ℹ️" defaultOpen>
          <div className="accordion-content">
            <div className="info-row">
              <span className="info-label">Data:</span>
              <span className="info-value">{formatDate(pelada.date)}</span>
            </div>
            {pelada.time && (
              <div className="info-row">
                <span className="info-label">Hora:</span>
                <span className="info-value">{pelada.time}</span>
              </div>
            )}
            {pelada.location && (
              <div className="info-row">
                <span className="info-label">Local:</span>
                <span className="info-value">{pelada.location}</span>
              </div>
            )}
            <div className="info-row">
              <span className="info-label">Jogadores por time:</span>
              <span className="info-value">{pelada.players_per_team}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Máx goleiros:</span>
              <span className="info-value">{pelada.max_goalkeepers}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Custo por jogador:</span>
              <span className="info-value">{formatCurrency(pelada.cost_per_player)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Goleiro paga?:</span>
              <span className="info-value">{pelada.goalkeeper_pays ? 'Sim' : 'Não'}</span>
            </div>
          </div>
        </Accordion>

        {/* Roster Accordion */}
        <Accordion title={`Roster (${roster.length})`} icon="👥">
          <div className="accordion-content">
            {roster.length === 0 ? (
              <p className="accordion-empty">Nenhum jogador adicionado</p>
            ) : (
              <div className="roster-list">
                {roster.map(entry => (
                  <div key={entry.id} className="roster-item">
                    <span className="roster-player">
                      {players.get(entry.player_id)?.name || entry.player_id}
                      {entry.slot_type === 'goalkeeper' && ' 🧤'}
                    </span>
                    <button
                      className="roster-remove"
                      onClick={() => handleRemoveFromRoster(entry.player_id)}
                      aria-label={`Remover ${players.get(entry.player_id)?.name || entry.player_id} do roster`}
                      title="Remover"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="secondary"
              fullWidth
              onClick={openAddRoster}
              style={{ marginTop: 'var(--space-3)' }}
            >
              + Adicionar jogador
            </Button>
          </div>
        </Accordion>

        {/* Draw Accordion */}
        <Accordion title="Times (Sorteio)" icon="⚔️">
          <div className="accordion-content">
            {draw.length === 0 ? (
              <div className="draw-empty">
                <p>Nenhum sorteio realizado ainda</p>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleDrawTeams}
                  disabled={roster.length === 0 || drawingTeams}
                >
                  {drawingTeams ? 'Sorteando...' : 'Sortear Times'}
                </Button>
              </div>
            ) : (
              <div className="draw-teams">
                {draw.map(result => (
                  <div key={result.team.id} className="draw-team">
                    <h4 className="draw-team-name">{result.team.name}</h4>
                    <ul className="draw-team-players">
                      {result.players.map(assignment => (
                        <li key={assignment.id}>
                          {players.get(assignment.player_id)?.name || assignment.player_id}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={handleDrawTeams}
                  disabled={drawingTeams}
                  style={{ marginTop: 'var(--space-3)' }}
                >
                  {drawingTeams ? 'Sorteando...' : 'Novo Sorteio'}
                </Button>
              </div>
            )}
          </div>
        </Accordion>

        {/* Payments Accordion */}
        <Accordion title="Pagamentos" icon="💰">
          {roster.length === 0 ? (
            <p className="accordion-empty">Nenhum jogador adicionado</p>
          ) : (
            <div className="accordion-content">
              <div className="payment-table">
                {roster.map(entry => (
                  <div key={entry.id} className="payment-row">
                    <span className="payment-name">
                      {players.get(entry.player_id)?.name || entry.player_id}
                    </span>
                    <label className="payment-checkbox">
                      <input
                        type="checkbox"
                        checked={entry.paid}
                        onChange={e =>
                          handleSetPlayerPaid(entry.id, entry.player_id, e.target.checked)
                        }
                        aria-label={`Marcar ${players.get(entry.player_id)?.name} como pago`}
                      />
                      <span className="payment-status">{entry.paid ? '✅' : '❌'}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Accordion>
      </main>

      {/* Add-to-roster sheet */}
      <BottomSheet
        open={showAddRoster}
        onClose={() => setShowAddRoster(false)}
        title="Adicionar ao roster"
      >
        {(() => {
          const rosterIds = new Set(roster.map(e => e.player_id));
          const available = profilePlayers.filter(p => !rosterIds.has(p.id));
          if (available.length === 0) {
            return <p className="accordion-empty">Nenhum jogador disponível</p>;
          }
          return (
            <div className="roster-picker">
              {available.map(player => (
                <button
                  key={player.id}
                  className="roster-picker-item"
                  onClick={() => handleAddToRoster(player)}
                >
                  <span>
                    {player.name}
                    {player.default_type === 'goalkeeper' && ' 🧤'}
                  </span>
                  <span className="roster-picker-add">+</span>
                </button>
              ))}
            </div>
          );
        })()}
      </BottomSheet>
    </div>
  );
}
