// This file intentionally mixes a context object, a hook and a provider component.
// Fast-refresh only cares about pure-component files; disable the rule here.
/* eslint-disable react-refresh/only-export-components */
import React, { createContext } from 'react'
import type { AppContextValue } from './AppContext'

export const AppContext = createContext<AppContextValue | null>(null)

/**
 * Returns the AppContext value. Throws if used outside AppProvider.
 */
export function useApp(): AppContextValue {
  const ctx = React.useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

interface AppProviderProps {
  value: AppContextValue
  children: React.ReactNode
}

export function AppProvider({ value, children }: AppProviderProps): JSX.Element {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
