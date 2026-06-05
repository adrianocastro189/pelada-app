import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@ui/styles/global.css'
import App from './App.tsx'
import { PasswordScreen } from '@ui/PasswordScreen'
import { SessionManager } from '@infrastructure/session'
import { createCompositionRoot } from './composition-root'
import { AppProvider } from '@ui/AppContext'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root not found in document.')
}

const root = createRoot(rootElement)

const savedConn = SessionManager.load()

function handleAuthenticated(connectionString: string): void {
  SessionManager.save(connectionString)
  renderApp(connectionString)
}

function renderApp(connectionString: string): void {
  const compositionRoot = createCompositionRoot(connectionString)
  root.render(
    <StrictMode>
      <AppProvider value={compositionRoot}>
        <App />
      </AppProvider>
    </StrictMode>,
  )
}

function renderPasswordScreen(): void {
  root.render(
    <StrictMode>
      <PasswordScreen onAuthenticated={handleAuthenticated} />
    </StrictMode>,
  )
}

// Initial render
if (savedConn) {
  renderApp(savedConn)
} else {
  renderPasswordScreen()
}
