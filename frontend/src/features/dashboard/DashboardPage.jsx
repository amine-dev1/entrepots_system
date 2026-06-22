import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  Warehouse, Package, AlertTriangle, TrendingUp,
  ArrowUpRight, ArrowDownRight, RefreshCw
} from 'lucide-react'
import { getDashboard } from '../../api/dashboard.api'
import { listCategories } from '../../api/categories.api'

function KpiCard({ label, value, icon: Icon, color, sub, trend }) {
  const colors = {
    blue: { bg: 'bg-primary-50', icon: 'text-primary-600', val: 'text-primary-700' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', val: 'text-green-700' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', val: 'text-orange-700' },
    red: { bg: 'bg-red-50', icon: 'text-red-600', val: 'text-red-700' },
  }
  const c = colors[color] || colors.blue

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${c.val}`}>{value ?? '—'}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg}`}>
          <Icon size={20} className={c.icon} />
        </div>
      </div>
      {trend != null && (
        <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(trend)}% vs mois dernier
        </div>
      )}
    </div>
  )
}

const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe']

export default function DashboardPage() {
  const { user } = useAuth()
  const [kpis, setKpis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [series, setSeries] = useState([])
  const [categories, setCategories] = useState([])
  const [stockByWarehouse, setStockByWarehouse] = useState([])

  useEffect(() => { fetchDashboard() }, [])

  async function fetchDashboard() {
    setLoading(true)
    try {
      const [dash, cats] = await Promise.allSettled([getDashboard(), listCategories()])

      if (dash.status === 'fulfilled') {
        const d = dash.value
        setKpis(d.kpis ?? null)

        // Série quotidienne (entrées vs sorties) — backend: mouvements_par_jour
        const rows = d.mouvements_par_jour ?? []
        setSeries(rows.map(r => ({
          date: new Date(r.jour).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
          entrées: Number(r.entrees ?? 0),
          sorties: Number(r.sorties ?? 0),
        })))

        // Stock par entrepôt — backend: stock_par_entrepot
        const stock = d.stock_par_entrepot ?? []
        setStockByWarehouse(stock.map(s => ({
          name: s.nom ?? 'Entrepôt',
          total_stock: Number(s.quantite_totale ?? 0),
        })))
      }

      if (cats.status === 'fulfilled') {
        const raw = Array.isArray(cats.value) ? cats.value : cats.value?.data || []
        setCategories(raw.map(c => ({ name: c.nom || 'Inconnu', value: c.products_count ?? 0 })))
      }
    } catch (error) {
      console.error('Erreur lors du chargement du tableau de bord', error)
    } finally {
      setLoading(false)
    }
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bonjour'
    if (h < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {greeting()}, {user?.prenom || 'Utilisateur'} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button onClick={fetchDashboard} className="btn-secondary">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* Cartes KPI (clés alignées sur le backend /dashboard) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Entrepôts actifs" value={kpis?.nb_entrepots} icon={Warehouse} color="blue" />
        <KpiCard label="Produits catalogue" value={kpis?.nb_produits} icon={Package} color="green" />
        <KpiCard label="Alertes stock" value={kpis?.nb_alertes} icon={AlertTriangle} color="orange" />
        <KpiCard label="Mouvements (30j)" value={kpis?.mouvements_30j} icon={TrendingUp} color="blue" />
      </div>

      {/* Historique & répartition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart - Mouvements */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm">Mouvements — 30 derniers jours</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={series} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="entrées" stroke="#3b82f6" fill="url(#gIn)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="sorties" stroke="#f97316" fill="url(#gOut)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Catégories */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm">Répartition par catégorie</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categories} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {categories.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v} produits`} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar — Stock par entrepôt */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 text-sm mb-4">Stock par entrepôt</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={stockByWarehouse} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="total_stock" name="Quantité totale" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
