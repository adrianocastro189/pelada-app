import { useEffect, useState } from 'react';
import { Button, BottomSheet, Input, Card, FAB } from '@ui/components';
import { useApp } from '@ui/AppContext';
import type { PeladaRecord } from '@ports/repositories/PeladaRepository';
import './PeladasScreen.css';

interface PeladasScreenProps {
  profileId: string;
}

/**
 * Screen for listing and managing peladas (matches) in a profile.
 * Lists all peladas and allows creation/deletion.
 */
export function PeladasScreen({ profileId }: PeladasScreenProps): JSX.Element {
  const app = useApp();
  const [peladas, setPeladas] = useState<PeladaRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '',
    location: '',
    players_per_team: 5,
    max_goalkeepers: 1,
    cost_per_player: 0,
    goalkeeper_pays: false,
  });

  // Load peladas on mount and when profileId changes
  useEffect(() => {
    const loadPeladas = async () => {
      setLoading(true);
      try {
        const result = await app.listPeladas.execute(profileId);
        setPeladas(result);
      } finally {
        setLoading(false);
      }
    };
    loadPeladas();
  }, [profileId, app.listPeladas]);

  const handleCreatePelada = async () => {
    if (!formData.date) return;
    try {
      await app.createPelada.execute(profileId, {
        date: new Date(formData.date),
        time: formData.time || null,
        location: formData.location || null,
        players_per_team: formData.players_per_team,
        max_goalkeepers: formData.max_goalkeepers,
        cost_per_player: formData.cost_per_player,
        goalkeeper_pays: formData.goalkeeper_pays,
      });
      // Reset form and reload peladas
      setFormData({
        date: new Date().toISOString().split('T')[0],
        time: '',
        location: '',
        players_per_team: 5,
        max_goalkeepers: 1,
        cost_per_player: 0,
        goalkeeper_pays: false,
      });
      setShowCreateSheet(false);
      const result = await app.listPeladas.execute(profileId);
      setPeladas(result);
    } catch (error) {
      console.error('Error creating pelada:', error);
    }
  };

  const handleDeletePelada = async (id: string) => {
    try {
      await app.deletePelada.execute(id);
      setConfirmDeleteId(null);
      // Reload peladas
      const result = await app.listPeladas.execute(profileId);
      setPeladas(result);
    } catch (error) {
      console.error('Error deleting pelada:', error);
    }
  };

  const handleSelectPelada = (peladaId: string) => {
    // TODO: Navigate to pelada details screen
    console.log('Selected pelada:', peladaId);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="peladas-screen">
      <header className="peladas-header">
        <h1>⚽ Peladas</h1>
        <p>Seus eventos de futebol</p>
      </header>

      <main className="peladas-main">
        {loading ? (
          <p className="peladas-loading">Carregando...</p>
        ) : peladas.length === 0 ? (
          <p className="peladas-empty">Nenhuma pelada criada ainda</p>
        ) : (
          <div className="peladas-list">
            {peladas.map(pelada => (
              <Card
                key={pelada.id}
                className="pelada-card"
                onClick={() => handleSelectPelada(pelada.id)}
              >
                <div className="pelada-card-content">
                  <div className="pelada-card-main">
                    <h3 className="pelada-card-date">{formatDate(pelada.date)}</h3>
                    {pelada.time && (
                      <p className="pelada-card-time">🕐 {pelada.time}</p>
                    )}
                    {pelada.location && (
                      <p className="pelada-card-location">📍 {pelada.location}</p>
                    )}
                    <p className="pelada-card-details">
                      {pelada.players_per_team} por time · R$ {(pelada.cost_per_player / 100).toFixed(2)}
                    </p>
                  </div>
                  <button
                    className="pelada-card-delete"
                    onClick={e => {
                      e.stopPropagation();
                      setConfirmDeleteId(pelada.id);
                    }}
                    aria-label={`Delete pelada on ${formatDate(pelada.date)}`}
                  >
                    🗑️
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Button
          variant="secondary"
          fullWidth
          onClick={() => setShowCreateSheet(true)}
          className="peladas-create-button"
        >
          + Criar nova pelada
        </Button>
      </main>

      <FAB
        onClick={() => setShowCreateSheet(true)}
        label="Create new match"
        icon="+"
      />

      {/* Create sheet */}
      <BottomSheet
        open={showCreateSheet}
        onClose={() => {
          setShowCreateSheet(false);
          setFormData({
            date: new Date().toISOString().split('T')[0],
            time: '',
            location: '',
            players_per_team: 5,
            max_goalkeepers: 1,
            cost_per_player: 0,
            goalkeeper_pays: false,
          });
        }}
        title="Nova pelada"
      >
        <form
          className="peladas-create-form"
          onSubmit={e => {
            e.preventDefault();
            handleCreatePelada();
          }}
        >
          <Input
            label="Data"
            type="date"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            required
          />
          <Input
            label="Hora (opcional)"
            type="time"
            value={formData.time}
            onChange={e => setFormData({ ...formData, time: e.target.value })}
          />
          <Input
            label="Local (opcional)"
            type="text"
            placeholder="Ex: Quadra Centro"
            value={formData.location}
            onChange={e => setFormData({ ...formData, location: e.target.value })}
          />
          <div className="peladas-form-row">
            <Input
              label="Jogadores por time"
              type="number"
              min="1"
              max="20"
              value={formData.players_per_team}
              onChange={e => setFormData({ ...formData, players_per_team: parseInt(e.target.value) })}
            />
            <Input
              label="Máx goleiros"
              type="number"
              min="0"
              max="5"
              value={formData.max_goalkeepers}
              onChange={e => setFormData({ ...formData, max_goalkeepers: parseInt(e.target.value) })}
            />
          </div>
          <Input
            label="Custo por jogador (centavos)"
            type="number"
            min="0"
            step="100"
            value={formData.cost_per_player}
            onChange={e => setFormData({ ...formData, cost_per_player: parseInt(e.target.value) })}
          />
          <label className="peladas-checkbox">
            <input
              type="checkbox"
              checked={formData.goalkeeper_pays}
              onChange={e => setFormData({ ...formData, goalkeeper_pays: e.target.checked })}
            />
            <span>Goleiro paga?</span>
          </label>
          <Button variant="primary" fullWidth type="submit">
            Criar
          </Button>
        </form>
      </BottomSheet>

      {/* Delete confirmation sheet */}
      <BottomSheet
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        title="Apagar pelada?"
      >
        <div className="peladas-delete-confirm">
          <p>Tem certeza que deseja apagar esta pelada? Não há volta.</p>
          <div className="peladas-delete-buttons">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setConfirmDeleteId(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              fullWidth
              onClick={() => {
                if (confirmDeleteId) {
                  handleDeletePelada(confirmDeleteId);
                }
              }}
            >
              Apagar
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
