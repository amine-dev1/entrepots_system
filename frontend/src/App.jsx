import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import ProductsPage from './pages/ProductsPage'
import StocksPage from './pages/StocksPage'
import MovementsPage from './pages/MovementsPage'
import { logout } from './api/auth.api'

const TABS = [
  { key: 'produits', label: 'Produits', component: ProductsPage },
  { key: 'stocks', label: 'Stocks', component: StocksPage },
  { key: 'mouvements', label: 'Mouvements', component: MovementsPage },
]

export default function App() {
  const [authed, setAuthed] = useState(() => !!localStorage.getItem('token'))
  const [tab, setTab] = useState('stocks')

  if (!authed) {
    return <LoginPage onLoggedIn={() => setAuthed(true)} />
  }

  const Active = TABS.find((t) => t.key === tab)?.component ?? StocksPage

  async function handleLogout() {
    await logout()
    setAuthed(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <span className="text-lg font-bold text-violet-700">StockFlow</span>
            <nav className="flex gap-1">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    tab === t.key ? 'bg-violet-100 text-violet-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-900">
            Déconnexion
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Active />
      </main>
    </div>
  )
}
