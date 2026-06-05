import { useState } from 'react'
import { SessionManager } from '@infrastructure/session/SessionManager'

interface PasswordScreenProps {
  /** Called with the connection string after the user submits a valid password. */
  onAuthenticated: (connectionString: string) => void
}

export function PasswordScreen({ onAuthenticated }: PasswordScreenProps): JSX.Element {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!password.trim()) {
      setError('Digite a senha')
      return
    }

    try {
      const connectionString = SessionManager.buildConnectionString(password)
      onAuthenticated(connectionString)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erro ao processar a senha')
      }
    }
  }

  return (
    <main style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}>
      <h1>Pelada App</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Senha do banco de dados:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {error && (
          <div style={{ color: 'red', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '0.5rem',
            backgroundColor: '#1B6B3A',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Entrar
        </button>
      </form>
    </main>
  )
}
