import React, { useEffect, useState } from 'react'
import { listStocks } from '../../api/stocks.api'
import { listWarehouses } from '../../api/warehouses.api'
import { listProducts } from '../../api/products.api'
import DataTable from '../../components/shared/DataTable'
import { StockBadge } from '../../components/shared/Badges'
import { BarChart3, AlertTriangle } from 'lucide-react'

const unwrap = (d) => (Array.isArray(d) ? d : d?.data || [])

export default function StocksPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [warehouses, setWarehouses] = useState([])
  const [products, setProducts] = useState([])
  const [filters, setFilters] = useState({ warehouse_id: '', product_id: '', alert: false })

  useEffect(() => {
    listWarehouses().then((d) => setWarehouses(unwrap(d))).catch(() => setWarehouses([]))
    listProducts().then((d) => setProducts(unwrap(d))).catch(() => setProducts([]))
  }, [])

  useEffect(() => { load() }, [filters])

  async function load() {
    setLoading(true)
    try {
      const params = { per_page: 100 }
      if (filters.warehouse_id) params.warehouse_id = filters.warehouse_id
      if (filters.product_id) params.product_id = filters.product_id
      if (filters.alert) params.alert = 1
      const data = await listStocks(params)
      setRows(unwrap(data))
    } catch { setRows([]) } finally { setLoading(false) }
  }

  const nbAlertes = rows.filter((r) => r.en_alerte).length

  const columns = [
    {
      header: 'Produit', accessor: 'product', sortable: true,
      render: (r) => (
        <div>
          <p className="font-medium text-gray-900">{r.product?.nom || '—'}</p>
          <p className="text-xs text-gray-400">{r.product?.sku || '—'}</p>
        </div>
      ),
    },
    {
      header: 'Entrepôt', accessor: 'warehouse',
      render: (r) => (
        <div>
          <p className="text-gray-900">{r.warehouse?.nom || '—'}</p>
          <p className="text-xs text-gray-400">{r.warehouse?.code || ''}</p>
        </div>
      ),
    },
    { header: 'Quantité', accessor: 'quantite', sortable: true, render: (r) => <span className="tabular-nums">{r.quantite}</span> },
    { header: 'Réservé', accessor: 'reserve', render: (r) => <span className="tabular-nums text-gray-500">{r.reserve}</span> },
    {
      header: 'Disponible', accessor: 'disponible', sortable: true,
      render: (r) => <StockBadge disponible={r.disponible} seuil={r.product?.stock_minimum ?? 0} />,
    },
    { header: 'Seuil', accessor: 'stock_minimum', render: (r) => <span className="text-gray-400 tabular-nums">{r.product?.stock_minimum ?? '—'}</span> },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
            <BarChart3 size={18} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Stocks &amp; Alertes</h1>
            <p className="text-xs text-gray-400">{rows.length} ligne{rows.length > 1 ? 's' : ''} de stock</p>
          </div>
        </div>
        {nbAlertes > 0 && (
          <span className="badge bg-orange-100 text-orange-700 border border-orange-200 flex items-center gap-1.5">
            <AlertTriangle size={13} /> {nbAlertes} en alerte
          </span>
        )}
      </div>

      <div className="card p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="label">Entrepôt</label>
            <select className="input" value={filters.warehouse_id}
              onChange={(e) => setFilters({ ...filters, warehouse_id: e.target.value })}>
              <option value="">Tous les entrepôts</option>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Produit</label>
            <select className="input" value={filters.product_id}
              onChange={(e) => setFilters({ ...filters, product_id: e.target.value })}>
              <option value="">Tous les produits</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer h-10">
            <input type="checkbox" checked={filters.alert}
              onChange={(e) => setFilters({ ...filters, alert: e.target.checked })} />
            <span className="text-sm">Alertes seulement (disponible ≤ seuil)</span>
          </label>
        </div>
      </div>

      <div className="card p-5">
        <DataTable columns={columns} data={rows} loading={loading} emptyText="Aucun stock" />
      </div>
    </div>
  )
}
