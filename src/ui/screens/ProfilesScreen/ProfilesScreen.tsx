import { useEffect, useState } from 'react';
import { Button, BottomSheet, Input, Card, FAB } from '@ui/components';
import { useApp } from '@ui/AppContext';
import type { ProfileRecord } from '@ports/repositories/ProfileRepository';
import './ProfilesScreen.css';

/**
 * Screen for selecting or creating a profile (pelada).
 * Lists all profiles and allows creation/deletion.
 */
export function ProfilesScreen(): JSX.Element {
  const app = useApp();
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  // Load profiles on mount
  useEffect(() => {
    const loadProfiles = async () => {
      setLoading(true);
      try {
        const result = await app.listProfiles.execute();
        setProfiles(result);
      } finally {
        setLoading(false);
      }
    };
    loadProfiles();
  }, [app.listProfiles]);

  const handleCreateProfile = async () => {
    if (!newName.trim()) return;
    try {
      await app.createProfile.execute({ name: newName.trim() });
      setNewName('');
      setShowCreateSheet(false);
      // Reload profiles
      const result = await app.listProfiles.execute();
      setProfiles(result);
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    try {
      await app.deleteProfile.execute(id);
      setConfirmDeleteId(null);
      // Reload profiles
      const result = await app.listProfiles.execute();
      setProfiles(result);
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };

  const handleSelectProfile = (profileId: string) => {
    // TODO: Navigate to home/peladas screen for this profile
    console.log('Selected profile:', profileId);
  };

  return (
    <div className="profiles-screen">
      <header className="profiles-header">
        <h1>⚽ Pelada App</h1>
        <p>Qual pelada você vai gerenciar?</p>
      </header>

      <main className="profiles-main">
        {loading ? (
          <p className="profiles-loading">Carregando...</p>
        ) : profiles.length === 0 ? (
          <p className="profiles-empty">Nenhum perfil criado ainda</p>
        ) : (
          <div className="profiles-list">
            {profiles.map(profile => (
              <Card
                key={profile.id}
                className="profile-card"
                onClick={() => handleSelectProfile(profile.id)}
              >
                <div className="profile-card-content">
                  <h3 className="profile-card-name">{profile.name}</h3>
                  <button
                    className="profile-card-delete"
                    onClick={e => {
                      e.stopPropagation();
                      setConfirmDeleteId(profile.id);
                    }}
                    aria-label={`Delete ${profile.name}`}
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
          className="profiles-create-button"
        >
          + Criar novo perfil
        </Button>
      </main>

      <FAB
        onClick={() => setShowCreateSheet(true)}
        label="Create new profile"
        icon="+"
      />

      {/* Create sheet */}
      <BottomSheet
        open={showCreateSheet}
        onClose={() => {
          setShowCreateSheet(false);
          setNewName('');
        }}
        title="Novo perfil"
      >
        <form
          className="profiles-create-form"
          onSubmit={e => {
            e.preventDefault();
            handleCreateProfile();
          }}
        >
          <Input
            label="Nome do perfil"
            placeholder="Ex: Pelada Segunda"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            autoFocus
          />
          <Button variant="primary" fullWidth type="submit">
            Criar
          </Button>
        </form>
      </BottomSheet>

      {/* Delete confirmation sheet */}
      <BottomSheet
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        title="Apagar perfil?"
      >
        <div className="profiles-delete-confirm">
          <p>Tem certeza que deseja apagar este perfil? Não há volta.</p>
          <div className="profiles-delete-buttons">
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
                  handleDeleteProfile(confirmDeleteId);
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
