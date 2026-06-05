import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppProvider, useApp } from './AppContext'
import type { AppContextValue } from './AppContext'

function createMockAppContext(): AppContextValue {
  const mockUseCase = {
    execute: vi.fn(),
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typedMock = mockUseCase as any

  return {
    createProfile: typedMock,
    deleteProfile: typedMock,
    getProfile: typedMock,
    listProfiles: typedMock,
    updateProfile: typedMock,
    createPlayer: typedMock,
    deactivatePlayer: typedMock,
    getPlayer: typedMock,
    listPlayers: typedMock,
    reactivatePlayer: typedMock,
    searchPlayers: typedMock,
    updatePlayer: typedMock,
    clonePelada: typedMock,
    createPelada: typedMock,
    deletePelada: typedMock,
    getPelada: typedMock,
    listPeladas: typedMock,
    updatePelada: typedMock,
    addToRoster: typedMock,
    getRoster: typedMock,
    removeFromRoster: typedMock,
    setPlayerPaid: typedMock,
    drawTeams: typedMock,
    getDraw: typedMock,
    createFinancialRecord: typedMock,
    deleteFinancialRecord: typedMock,
    getBalances: typedMock,
    getDescriptionSuggestions: typedMock,
    listFinancialRecords: typedMock,
    updateFinancialRecord: typedMock,
    allocateDelta: typedMock,
    createSubcaixinha: typedMock,
    deleteSubcaixinha: typedMock,
    listSubcaixinhas: typedMock,
    updateSubcaixinha: typedMock,
    logout: () => {},
  }
}

describe('AppContext', () => {
  it('throws error when useApp is used outside AppProvider', () => {
    // Create a test component that uses useApp outside of AppProvider
    function TestComponent() {
      useApp()
      return <div>Test</div>
    }

    // Suppress console.error for this test since we expect an error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useApp must be used within AppProvider')

    consoleSpy.mockRestore()
  })

  it('provides context value to children', () => {
    function TestComponent() {
      const app = useApp()
      return <div data-testid="test">{typeof app.logout}</div>
    }

    render(
      <AppProvider value={createMockAppContext()}>
        <TestComponent />
      </AppProvider>,
    )

    expect(screen.getByTestId('test')).toHaveTextContent('function')
  })

  it('renders children', () => {
    render(
      <AppProvider value={createMockAppContext()}>
        <div data-testid="child">Hello</div>
      </AppProvider>,
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
})
