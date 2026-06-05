import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PasswordScreen } from './PasswordScreen'

describe('PasswordScreen', () => {
  it('renders the password form', () => {
    const onAuthenticated = vi.fn()
    render(<PasswordScreen onAuthenticated={onAuthenticated} />)

    expect(screen.getByLabelText(/Senha do banco de dados/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument()
  })

  it('displays error when password is empty on submit', async () => {
    const user = userEvent.setup()
    const onAuthenticated = vi.fn()

    render(<PasswordScreen onAuthenticated={onAuthenticated} />)

    const button = screen.getByRole('button', { name: /Entrar/i })
    await user.click(button)

    expect(screen.getByText(/Digite a senha/i)).toBeInTheDocument()
    expect(onAuthenticated).not.toHaveBeenCalled()
  })

  it('calls onAuthenticated with connection string on valid submit', async () => {
    const user = userEvent.setup()
    const onAuthenticated = vi.fn()

    // Mock env vars
    vi.stubEnv('VITE_DB_USER', 'test_user')
    vi.stubEnv('VITE_DB_HOST', 'test.host')
    vi.stubEnv('VITE_DB_NAME', 'test_db')

    render(<PasswordScreen onAuthenticated={onAuthenticated} />)

    const passwordInput = screen.getByLabelText(/Senha do banco de dados/i)
    await user.type(passwordInput, 'mypassword')

    const button = screen.getByRole('button', { name: /Entrar/i })
    await user.click(button)

    expect(onAuthenticated).toHaveBeenCalledWith(
      'postgresql://test_user:mypassword@test.host/test_db',
    )
  })

  it('password input is of type password', () => {
    const onAuthenticated = vi.fn()
    render(<PasswordScreen onAuthenticated={onAuthenticated} />)

    const input = screen.getByLabelText(/Senha do banco de dados/i) as HTMLInputElement
    expect(input.type).toBe('password')
  })

  it('displays error message when environment variables are missing', async () => {
    const user = userEvent.setup()
    const onAuthenticated = vi.fn()

    // Stub env vars as empty
    vi.stubEnv('VITE_DB_USER', '')
    vi.stubEnv('VITE_DB_HOST', '')
    vi.stubEnv('VITE_DB_NAME', '')

    render(<PasswordScreen onAuthenticated={onAuthenticated} />)

    const passwordInput = screen.getByLabelText(/Senha do banco de dados/i)
    await user.type(passwordInput, 'password')

    const button = screen.getByRole('button', { name: /Entrar/i })
    await user.click(button)

    expect(screen.getByText(/Missing environment variables/i)).toBeInTheDocument()
    expect(onAuthenticated).not.toHaveBeenCalled()
  })
})
