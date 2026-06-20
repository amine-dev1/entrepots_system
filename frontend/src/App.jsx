import { useEffect, useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import { listProducts } from './api/products.api'
import { listWarehouses } from './api/warehouses.api'
import { formatMoney } from './lib/utils'

// NOTE (équipe) : page de démonstration de la connexion API.
// Elle prouve la chaîne login -> token -> /me -> ressources protégées.
// Hiba/Youssef peuvent la remplacer par le vrai routeur (routes/ + features/).
export default function App() {
  const { user, roles, login, logout, loading, isAuthenticated } = useAuth()

  if (loading) return <div style={styles.wrap}>Chargement…</div>

  return isAuthenticated ? (
    <Dashboard user={user} roles={roles} onLogout={logout} />
  ) : (
    <LoginForm onLogin={login} />
  )
}

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('admin@stockflow.ma')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await onLogin({ email, password })
    } catch (err) {
      setError(err.response?.data?.message ?? 'Échec de connexion à l\'API')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={styles.wrap}>
      <h1 style={styles.h1}>StockFlow</h1>
      <p style={styles.muted}>Connexion à l'API</p>
      <form onSubmit={submit} style={styles.card}>
        <label style={styles.label}>
          Email
          <input style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label style={styles.label}>
          Mot de passe
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.btn} disabled={busy}>
          {busy ? '…' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}

function Dashboard({ user, roles, onLogout }) {
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [err, setErr] = useState(null)

  // Charge des ressources protégées => prouve que le token passe bien.
  useEffect(() => {
    Promise.all([listProducts(), listWarehouses()])
      .then(([p, w]) => {
        setProducts(p)
        setWarehouses(w)
      })
      .catch((e) => setErr(e.message))
  }, [])

  return (
    <div style={styles.wrap}>
      <div style={styles.headerRow}>
        <h1 style={styles.h1}>StockFlow</h1>
        <button style={styles.btnGhost} onClick={onLogout}>
          Déconnexion
        </button>
      </div>

      <div style={styles.card}>
        <p>
          ✅ Connecté : <strong>{user.prenom} {user.nom}</strong> ({user.email})
        </p>
        <p style={styles.muted}>Rôles : {roles.join(', ') || '—'}</p>
      </div>

      {err && <p style={styles.error}>Erreur API : {err}</p>}

      <div style={styles.grid}>
        <section style={styles.card}>
          <h3 style={styles.h3}>Produits ({products.length})</h3>
          <ul style={styles.list}>
            {products.map((p) => (
              <li key={p.id}>
                {p.nom} — {formatMoney(p.prix_vente)}
              </li>
            ))}
          </ul>
        </section>

        <section style={styles.card}>
          <h3 style={styles.h3}>Entrepôts ({warehouses.length})</h3>
          <ul style={styles.list}>
            {warehouses.map((w) => (
              <li key={w.id}>
                {w.nom} ({w.code})
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

const styles = {
  wrap: { maxWidth: 780, margin: '40px auto', padding: 16, fontFamily: 'system-ui, sans-serif', color: '#1f2937' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  h1: { margin: 0, fontSize: 28 },
  h3: { marginTop: 0 },
  muted: { color: '#6b7280', marginTop: 4 },
  card: { border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, margin: '12px 0', background: '#fff' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  label: { display: 'block', marginBottom: 12, fontSize: 14 },
  input: { display: 'block', width: '100%', padding: 8, marginTop: 4, border: '1px solid #d1d5db', borderRadius: 8, boxSizing: 'border-box' },
  btn: { padding: '10px 16px', background: '#6d28d9', color: '#fff', border: 0, borderRadius: 8, cursor: 'pointer' },
  btnGhost: { padding: '8px 14px', background: 'transparent', border: '1px solid #d1d5db', borderRadius: 8, cursor: 'pointer' },
  list: { margin: 0, paddingLeft: 18, lineHeight: 1.8 },
  error: { color: '#c0392b' },
}
