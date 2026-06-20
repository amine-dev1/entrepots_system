import { useEffect, useMemo, useState } from 'react'
import { listStocks } from '../api/stocks.api'
import { apiError } from '../lib/format'
import StockBadge from '../components/StockBadge'

export default function StocksPage() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [warehouseId, setWarehouseId] = useState('')
  const [onlyAlerts, setOnlyAlerts] = useState(false)

  useEffect(() => {
    let active = true
    const params = { per_page: 100 }
    if (warehouseId) params.warehouse_id = warehouseId
    if (onlyAlerts) params.alert = 1
    listStocks(params)
      .then((res) => {
        if (!active) return
        setStocks(res.data ?? [])
        setError(null)
      })
      .catch((err) => active && setError(apiError(err)))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [warehouseId, onlyAlerts])

  // Warehouse options derived from the loaded stock rows.
  const warehouses = useMemo(() => {
    const map = new Map()
    stocks.forEach((s) => s.warehouse && map.set(s.warehouse.id, s.warehouse))
    return [...map.values()]
  }, [stocks])

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-gray-900">Stocks</h2>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={warehouseId}
          onChange={(e) => setWarehouseId(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-violet-500"
        >
          <option value="">Tous les entrepôts</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.nom}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={onlyAlerts} onChange={(e) => setOnlyAlerts(e.target.checked)} />
          En alerte seulement
        </label>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p className="text-gray-500">Chargement…</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Produit</th>
                <th className="px-4 py-3 font-medium">Entrepôt</th>
                <th className="px-4 py-3 text-right font-medium">Quantité</th>
                <th className="px-4 py-3 text-right font-medium">Réservé</th>
                <th className="px-4 py-3 text-right font-medium">Disponible</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stocks.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{s.product?.nom ?? '—'}</div>
                    <div className="font-mono text-xs text-gray-400">{s.product?.sku}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.warehouse?.nom ?? '—'}</td>
                  <td className="px-4 py-3 text-right">{s.quantite}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{s.reserve}</td>
                  <td className="px-4 py-3 text-right">
                    <StockBadge disponible={s.disponible} minimum={s.product?.stock_minimum} />
                  </td>
                </tr>
              ))}
              {stocks.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">Aucun stock.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
