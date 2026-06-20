import { useEffect, useMemo, useState } from 'react'
import { listStocks } from '../api/stocks.api'
import { listMovements, createMovement, MOVEMENT_TYPES, isSortie } from '../api/movements.api'
import { apiError } from '../lib/format'

export default function MovementsPage() {
  const [stocks, setStocks] = useState([])
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [warehouseId, setWarehouseId] = useState('')
  const [productId, setProductId] = useState('')
  const [type, setType] = useState('achat')
  const [quantite, setQuantite] = useState(1)
  const [motif, setMotif] = useState('')

  function loadAll() {
    return Promise.all([listStocks({ per_page: 100 }), listMovements({ per_page: 20 })])
      .then(([s, m]) => {
        setStocks(s.data ?? [])
        setMovements(m.data ?? [])
      })
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadAll() }, [])

  const warehouses = useMemo(() => {
    const map = new Map()
    stocks.forEach((s) => s.warehouse && map.set(s.warehouse.id, s.warehouse))
    return [...map.values()]
  }, [stocks])

  // Products available in the chosen warehouse (with their stock rows).
  const productsInWarehouse = useMemo(
    () => stocks.filter((s) => s.warehouse_id === warehouseId),
    [stocks, warehouseId],
  )

  // The stock row matching the current warehouse + product selection.
  const selectedStock = useMemo(
    () => stocks.find((s) => s.warehouse_id === warehouseId && s.product_id === productId),
    [stocks, warehouseId, productId],
  )

  const disponible = selectedStock?.disponible ?? null
  const sortie = isSortie(type)
  // Real-time control: a sortie cannot exceed the available quantity.
  const insufficient = sortie && disponible !== null && Number(quantite) > Number(disponible)
  const canSubmit = warehouseId && productId && Number(quantite) >= 1 && !insufficient && !submitting

  async function submit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      const res = await createMovement({
        type,
        quantite: Number(quantite),
        product_id: productId,
        warehouse_id: warehouseId,
        motif: motif || undefined,
      })
      setSuccess(`Mouvement ${res.data.reference} enregistré.`)
      setQuantite(1)
      setMotif('')
      loadAll()
    } catch (err) {
      setError(apiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-gray-900">Mouvements de stock</h2>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* Création de mouvement */}
        <form onSubmit={submit} className="h-fit space-y-4 rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="font-semibold text-gray-900">Nouveau mouvement</h3>

          <Field label="Entrepôt">
            <select value={warehouseId} onChange={(e) => { setWarehouseId(e.target.value); setProductId('') }} className={inputCls} required>
              <option value="">— choisir —</option>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.nom}</option>)}
            </select>
          </Field>

          <Field label="Produit">
            <select value={productId} onChange={(e) => setProductId(e.target.value)} className={inputCls} required disabled={!warehouseId}>
              <option value="">— choisir —</option>
              {productsInWarehouse.map((s) => (
                <option key={s.product_id} value={s.product_id}>
                  {s.product?.nom} (dispo {s.disponible})
                </option>
              ))}
            </select>
          </Field>

          {selectedStock && (
            <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
              Disponible actuel : <strong>{disponible}</strong>
            </div>
          )}

          <Field label="Type">
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
              <optgroup label="Entrées">
                {MOVEMENT_TYPES.filter((t) => t.sens === 'entree').map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </optgroup>
              <optgroup label="Sorties">
                {MOVEMENT_TYPES.filter((t) => t.sens === 'sortie').map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </optgroup>
            </select>
          </Field>

          <Field label="Quantité">
            <input type="number" min={1} value={quantite} onChange={(e) => setQuantite(e.target.value)} className={inputCls} required />
          </Field>

          {insufficient && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Quantité supérieure au disponible ({disponible}). Sortie impossible.
            </p>
          )}

          <Field label="Motif (optionnel)">
            <input value={motif} onChange={(e) => setMotif(e.target.value)} className={inputCls} placeholder="ex. Réception fournisseur" />
          </Field>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {success && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>}

          <button type="submit" disabled={!canSubmit} className="w-full rounded-lg bg-violet-600 py-2 font-medium text-white hover:bg-violet-700 disabled:opacity-50">
            {submitting ? 'Enregistrement…' : 'Enregistrer le mouvement'}
          </button>
        </form>

        {/* Historique */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3 font-semibold text-gray-900">Derniers mouvements</div>
          {loading ? (
            <p className="px-4 py-6 text-gray-500">Chargement…</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Référence</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Produit</th>
                  <th className="px-4 py-3 text-right font-medium">Quantité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{m.reference}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs ${isSortie(m.type) ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {m.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{m.product?.nom ?? '—'}</td>
                    <td className="px-4 py-3 text-right">{isSortie(m.type) ? '−' : '+'}{m.quantite}</td>
                  </tr>
                ))}
                {movements.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">Aucun mouvement.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500'

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  )
}
