import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PasswordScreen } from './PasswordScreen'

describe('PasswordScreen', () => {
  it('renders the connection string form', () => {
    const onAuthenticated = vi.fn()
    render(<PasswordScreen onAuthenticated={onAuthenticated} />)

    expect(screen.getByLabelText(/Connection string/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument()
  })

  it('displays error when field is empty on submit', async () => {
    const user = userEvent.setup()
    const onAuthenticated = vi.fn()

    render(<PasswordScreen onAuthenticated={onAuthenticated} />)

    const button = screen.getByRole('button', { name: /Entrar/i })
    await user.click(button)

    expect(screen.getByText(/Digite a connection string/i)).toBeInTheDocument()
    expect(onAuthenticated).not.toHaveBeenCalled()
  })

  it('displays error when connection string has invalid format', async () => {
    const user = userEvent.setup()
    const onAuthenticated = vi.fn()

    render(<PasswordScreen onAuthenticated={onAuthenticated} />)

    const input = screen.getByLabelText(/Connection string/i)
    await user.type(input, 'just-a-password')

    const button = screen.getByRole('button', { name: /Entrar/i })
    await user.click(button)

    expect(screen.getByText(/Connection string inválida/i)).toBeInTheDocument()
    expect(onAuthenticated).not.toHaveBeenCalled()
  })

  it('calls onAuthenticated with the full connection string on valid submit', async () => {
    const user = userEvent.setup()
    const onAuthenticated = vi.fn()
    const validConn = 'postgresql://pelada_app:mysecret@ep-xxx.neon.tech/pelada'

    render(<PasswordScreen onAuthenticated={onAuthenticated} />)

    const input = screen.getByLabelText(/Connection string/i)
    await user.type(input, validConn)

    const button = screen.getByRole('button', { name: /Entrar/i })
    await user.click(button)

    expect(onAuthenticated).toHaveBeenCalledWith(validConn)
    expect(onAuthenticated).toHaveBeenCalledTimes(1)
  })

  it('trims whitespace before passing the connection string', async () => {
    const user = userEvent.setup()
    const onAuthenticated = vi.fn()
    const validConn = 'postgresql://user:pass@host/db'

    render(<PasswordScreen onAuthenticated={onAuthenticated} />)

    const input = screen.getByLabelText(/Connection string/i)
    await user.type(input, `  ${validConn}  `)

    const button = screen.getByRole('button', { name: /Entrar/i })
    await user.click(button)

    expect(onAuthenticated).toHaveBeenCalledWith(validConn)
  })

  it('input is of type password (masks the connection string)', () => {
    const onAuthenticated = vi.fn()
    render(<PasswordScreen onAuthenticated={onAuthenticated} />)

    const input = screen.getByLabelText(/Connection string/i) as HTMLInputElement
    expect(input.type).toBe('password')
  })

  it('does not require env vars — no VITE_DB_* needed', async () => {
    // This test proves the fix: no env vars are needed at all.
    // The previous implementation would throw "Missing environment variables"
    // without VITE_DB_USER / VITE_DB_HOST / VITE_DB_NAME.
    const user = userEvent.setup()
    const onAuthenticated = vi.fn()

    render(<PasswordScreen onAuthenticated={onAuthenticated} />)

    const input = screen.getByLabelText(/Connection string/i)
    await user.type(input, 'postgresql://u:p@host/db')

    const button = screen.getByRole('button', { name: /Entrar/i })
    await user.click(button)

    // Should succeed without any env var setup
    expect(onAuthenticated).toHaveBeenCalledWith('postgresql://u:p@host/db')
  })
})
