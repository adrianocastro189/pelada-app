import { useEffect, useState } from 'react';
import { Button, Input, Textarea } from '@ui/components';
import { useApp } from '@ui/AppContext';
import type { ProfileRecord } from '@ports/repositories/ProfileRepository';
import './ConfigScreen.css';

interface ConfigScreenProps {
  profileId: string;
}

/**
 * Screen for managing profile configuration.
 * Edit profile name and convocation template.
 */
export function ConfigScreen({ profileId }: ConfigScreenProps): JSX.Element {
  const app = useApp();
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    convocation_template: '',
  });
  const [savedMessage, setSavedMessage] = useState(false);

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const profileData = await app.getProfile.execute(profileId);
        setProfile(profileData);
        if (profileData) {
          setFormData({
            name: profileData.name,
            convocation_template: profileData.convocation_template,
          });
        }
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [profileId, app.getProfile]);

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      const updated = await app.updateProfile.execute(profileId, {
        name: formData.name.trim(),
        convocation_template: formData.convocation_template,
      });
      setProfile(updated);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    profile &&
    (formData.name !== profile.name ||
      formData.convocation_template !== profile.convocation_template);

  if (loading) {
    return (
      <div className="config-screen">
        <p className="config-loading">Carregando...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="config-screen">
        <p className="config-not-found">Perfil não encontrado</p>
      </div>
    );
  }

  return (
    <div className="config-screen">
      <header className="config-header">
        <h1>⚙️ Configurações</h1>
        <p>Gerenciar perfil</p>
      </header>

      <main className="config-main">
        <section className="config-section">
          <h2 className="section-title">Perfil</h2>
          <div className="config-form">
            <Input
              label="Nome do Perfil *"
              placeholder="Ex: Pelada Segunda"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Textarea
              label="Modelo de Convocação"
              placeholder="Escreva o template aqui. Use {{data}}, {{hora}}, {{local}}, {{custo}} para substituições."
              value={formData.convocation_template}
              onChange={e =>
                setFormData({ ...formData, convocation_template: e.target.value })
              }
            />

            <div className="config-template-help">
              <p className="help-title">📝 Variáveis disponíveis:</p>
              <ul className="help-list">
                <li>
                  <code>{'{{data}}'}</code> — Data da pelada
                </li>
                <li>
                  <code>{'{{hora}}'}</code> — Hora da pelada
                </li>
                <li>
                  <code>{'{{local}}'}</code> — Local da pelada
                </li>
                <li>
                  <code>{'{{custo}}'}</code> — Custo por jogador
                </li>
              </ul>
            </div>

            {savedMessage && <p className="config-saved">✅ Salvo com sucesso!</p>}

            <Button
              variant="primary"
              fullWidth
              onClick={handleSave}
              disabled={!hasChanges || saving}
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </section>

        <section className="config-section info">
          <h3>ℹ️ Informações do Perfil</h3>
          <div className="config-info">
            <div className="info-row">
              <span className="info-label">ID:</span>
              <span className="info-value">{profile.id}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Criado em:</span>
              <span className="info-value">
                {new Intl.DateTimeFormat('pt-BR', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                }).format(new Date(profile.created_at))}
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
