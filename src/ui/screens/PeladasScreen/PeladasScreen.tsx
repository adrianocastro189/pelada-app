import { useEffect, useState } from 'react';
import { Button, BottomSheet, Input, Textarea, Card, FAB } from '@ui/components';
import { useApp } from '@ui/AppContext';
import type { PeladaRecord } from '@ports/repositories/PeladaRepository';
import './PeladasScreen.css';

/** Parses a 'YYYY-MM-DD' string as a local-timezone Date (avoids UTC midnight → previous-day shift). */
const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/** Fields from a pelada that can be pre-filled when creating a clone. Date is excluded — the user must enter it. */
export interface ClonePeladaFormData {
  time: string;
  location: string;
  team_names: string;
  players_per_team: number;
  max_goalkeepers: number;
  cost_per_player: number;
  goalkeeper_pays: boolean;
}

interface PeladasScreenProps {
  profileId: string;
  onSelectPelada?: (peladaId: string) => void;
  cloneData?: ClonePeladaFormData | null;
}

const emptyForm = {
  date: '',
  time: '',
  location: '',
  team_names: 'Time A\nTime B',
  players_per_team: 5,
  max_goalkeepers: 1,
  /** Display string in R$ (e.g. "14.50"); converted to cents on submit. */
  cost_per_player: '',
  goalkeeper_pays: false,
};

/**
 * Screen for listing and managing peladas (matches) in a profile.
 * Lists all peladas and allows creation/deletion.
 */
export function PeladasScreen({ profileId, onSelectPelada, cloneData }: PeladasScreenProps): JSX.Element {
  const app = useApp();
  const [peladas, setPeladas] = useState<PeladaRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [formData, setFormData] = useState({ ...emptyForm });

  // Pre-fill the create form and open it when clone data is supplied (e.g. "Clone" button in PeladaScreen).
  useEffect(() => {
    if (!cloneData) return;
    setFormData({
      date: '',
      time: cloneData.time,
      location: cloneData.location,
      team_names: cloneData.team_names,
      players_per_team: cloneData.players_per_team,
      max_goalkeepers: cloneData.max_goalkeepers,
      cost_per_player: (cloneData.cost_per_player / 100).toFixed(2),
      goalkeeper_pays: cloneData.goalkeeper_pays,
    });
    setShowCreateSheet(true);
  }, [cloneData]);

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
    const teamNames = formData.team_names
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);
    if (teamNames.length < 2) return;
    try {
      await app.createPelada.execute(
        profileId,
        {
          date: parseLocalDate(formData.date),
          time: formData.time || null,
          location: formData.location || null,
          players_per_team: formData.players_per_team,
          max_goalkeepers: formData.max_goalkeepers,
          cost_per_player: Math.round(parseFloat(formData.cost_per_player || '0') * 100),
          goalkeeper_pays: formData.goalkeeper_pays,
        },
        teamNames,
      );
      // Reset form and reload peladas
      setFormData({ ...emptyForm });
      setShowCreateSheet(false);
      const result = await app.listPeladas.execute(profileId);
      setPeladas(result);
    } catch (error) {
      console.error('Error creating pelada:', error);
    }
  };

  const handleSelectPelada = (peladaId: string) => {
    onSelectPelada?.(peladaId);
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
                </div>
              </Card>
            ))}
          </div>
        )}

        <Button
          variant="secondary"
          fullWidth
          onClick={() => {
            setFormData({ ...emptyForm, date: new Date().toISOString().split('T')[0] });
            setShowCreateSheet(true);
          }}
          className="peladas-create-button"
        >
          + Criar nova pelada
        </Button>
      </main>

      <FAB
        onClick={() => {
          setFormData({ ...emptyForm, date: new Date().toISOString().split('T')[0] });
          setShowCreateSheet(true);
        }}
        label="Criar nova pelada"
        icon="+"
      />

      {/* Create sheet */}
      <BottomSheet
        open={showCreateSheet}
        onClose={() => {
          setShowCreateSheet(false);
          setFormData({ ...emptyForm, date: new Date().toISOString().split('T')[0] });
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
          <Textarea
            label="Nomes dos times (um por linha)"
            placeholder={'Time A\nTime B'}
            rows={3}
            value={formData.team_names}
            onChange={e => setFormData({ ...formData, team_names: e.target.value })}
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
            label="Custo por jogador (R$)"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={formData.cost_per_player}
            onChange={e => setFormData({ ...formData, cost_per_player: e.target.value })}
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

    </div>
  );
}
