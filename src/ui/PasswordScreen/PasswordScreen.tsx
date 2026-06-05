import { useState } from 'react'
import { Button, Input } from '@ui/components'
import './PasswordScreen.css'

interface PasswordScreenProps {
  /** Called with the full connection string after the user submits. */
  onAuthenticated: (connectionString: string) => void
}

/**
 * Entry screen — user types the full Neon connection string.
 * No environment variables are read here: the host, user and db
 * are all embedded in the connection string supplied at runtime.
 */
export function PasswordScreen({ onAuthenticated }: PasswordScreenProps): JSX.Element {
  const [connectionString, setConnectionString] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const trimmed = connectionString.trim()

    if (!trimmed) {
      setError('Digite a connection string')
      return
    }

    if (!trimmed.startsWith('postgresql://')) {
      setError('Connection string inválida. Deve começar com postgresql://')
      return
    }

    onAuthenticated(trimmed)
  }

  return (
    <main className="password-screen">
      <div className="password-screen__card">
        <h1 className="password-screen__title">⚽ Pelada App</h1>
        <p className="password-screen__subtitle">
          Cole a connection string do Neon para entrar
        </p>

        <form onSubmit={handleSubmit} className="password-screen__form">
          <Input
            label="Connection string"
            type="password"
            value={connectionString}
            onChange={e => setConnectionString(e.target.value)}
            placeholder="postgresql://usuario:senha@host/banco"
            error={error ?? undefined}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
          />

          <Button type="submit" variant="primary" fullWidth>
            Entrar
          </Button>
        </form>

        <p className="password-screen__hint">
          Formato: <code>postgresql://usuario:senha@host/banco</code>
        </p>
      </div>
    </main>
  )
}
