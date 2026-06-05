import { useApp } from '@ui/AppContext'

function App() {
  useApp() // validates that Context is available

  return (
    <main>
      <h1>Pelada App</h1>
    </main>
  )
}

export default App
