import { useEffect, useState } from 'react'
import { listProducts } from '../api/products.api'
import { apiError, money } from '../lib/format'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let active = true
    listProducts()
      .then((res) => active && setProducts(res.data ?? []))
      .catch((err) => active && setError(apiError(err)))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const filtered = products.filter((p) =>
    `${p.nom} ${p.sku}`.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Produits</h2>
        <input
          placeholder="Rechercher (nom, SKU)…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-violet-500"
        />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p className="text-gray-500">Chargement…</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">Catégorie</th>
                <th className="px-4 py-3 text-right font-medium">Prix achat</th>
                <th className="px-4 py-3 text-right font-medium">Prix vente</th>
                <th className="px-4 py-3 text-right font-medium">Seuil min.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.sku}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{p.nom}</td>
                  <td className="px-4 py-3 text-gray-600">{p.category?.nom ?? '—'}</td>
                  <td className="px-4 py-3 text-right">{money(p.prix_achat)}</td>
                  <td className="px-4 py-3 text-right">{money(p.prix_vente)}</td>
                  <td className="px-4 py-3 text-right">{p.stock_minimum}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Aucun produit.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
