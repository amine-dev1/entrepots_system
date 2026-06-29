import React, { useEffect, useState } from 'react'
import { listMovements, createMovement } from '../../api/movements.api'
import { listStocks } from '../../api/stocks.api'
import { listWarehouses } from '../../api/warehouses.api'
import { listProducts } from '../../api/products.api'
import DataTable from '../../components/shared/DataTable'
import Modal from '../../components/shared/Modal'
import { TrendingUp, TrendingDown, Plus, AlertTriangle } from 'lucide-react'
import { formatDateTime, cn } from '../../lib/utils'

const unwrap = (d) => (Array.isArray(d) ? d : d?.data || [])

// Types proposés à la saisie manuelle (les transfert_* sont générés par le système).
const ENTREES = [
  { value: 'achat', label: 'Achat' },
  { value: 'retour_fournisseur', label: 'Retour fournisseur' },
  { value: 'ajustement_entree', label: 'Ajustement (entrée)' },
]
const SORTIES = [
  { value: 'vente', label: 'Vente' },
  { value: 'consommation', label: 'Consommation' },
  { value: 'perte', label: 'Perte' },
  { value: 'ajustement_sortie', label: 'Ajustement (sortie)' },
]
const SORTIE_VALUES = SORTIES.map((s) => s.value)
const TYPE_LABEL = Object.fromEntries([...ENTREES, ...SORTIES].map((t) => [t.value, t.label]))

const EMPTY = { type: 'achat', product_id: '', warehouse_id: '', quantite: '', motif: '' }

export default function MovementsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [warehouses, setWarehouses] = useState([])
  const [products, setProducts] = useState([])
  const [filters, setFilters] = useState({ type: '', product_id: '', warehouse_id: '' })

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [dispo, setDispo] = useState(null) // disponible courant pour product+warehouse choisis

  useEffect(() => {
    listWarehouses().then((d) => setWarehouses(unwrap(d))).catch(() => setWarehouses([]))
    listProducts().then((d) => setProducts(unwrap(d))).catch(() => setProducts([]))
  }, [])

  useEffect(() => { load() }, [filters])

  // Contrôle disponible temps réel : à chaque changement de produit/entrepôt dans le formulaire.
  useEffect(() => {
    if (!modalOpen || !form.product_id || !form.warehouse_id) { setDispo(null); return }
    let cancelled = false
    listStocks({ product_id: form.product_id, warehouse_id: form.warehouse_id })
      .then((d) => { if (!cancelled) { const s = unwrap(d)[0]; setDispo(s ? Number(s.disponible) : 0) } })
      .catch(() => { if (!cancelled) setDispo(null) })
    return () => { cancelled = true }
  }, [modalOpen, form.product_id, form.warehouse_id])

  async function load() {
    setLoading(true)
    try {
      const params = { per_page: 100 }
      if (filters.type) params.type = filters.type
      if (filters.product_id) params.product_id = filters.product_id
      if (filters.warehouse_id) params.warehouse_id = filters.warehouse_id
      setRows(unwrap(await listMovements(params)))
    } catch { setRows([]) } finally { setLoading(false) }
  }

  const isSortie = SORTIE_VALUES.includes(form.type)
  const qte = Number(form.quantite || 0)
  const insufficient = isSortie && dispo != null && qte > dispo

  function openCreate() { setForm(EMPTY); setErrors({}); setDispo(null); setModalOpen(true) }

  async function handleSave(e) {
    e.preventDefault()
    if (insufficient) return
    setSaving(true); setErrors({})
    try {
      await createMovement({
        type: form.type,
        product_id: form.product_id,
        warehouse_id: form.warehouse_id,
        quantite: qte,
        motif: form.motif || null,
      })
      setModalOpen(false); load()
    } catch (err) {
      if (err.response?.status === 422 && err.response.data?.errors) setErrors(err.response.data.errors)
      else setErrors({ _: [err.response?.data?.message || 'Erreur lors de la création.'] })
    } finally { setSaving(false) }
  }

  const columns = [
    { header: 'Référence', accessor: 'reference', sortable: true, render: (r) => <span className="font-mono text-xs text-gray-600">{r.reference}</span> },
    {
      header: 'Type', accessor: 'type', sortable: true,
      render: (r) => {
        const sortie = SORTIE_VALUES.includes(r.type) || r.type === 'transfert_sortie'
        return (
          <span className={cn('badge inline-flex items-center gap-1', sortie ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700')}>
            {sortie ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
            {TYPE_LABEL[r.type] || r.type}
          </span>
        )
      },
    },
    { header: 'Produit', accessor: 'product', render: (r) => r.product?.nom || '—' },
    { header: 'Entrepôt', accessor: 'warehouse', render: (r) => r.warehouse?.nom || '—' },
    { header: 'Quantité', accessor: 'quantite', sortable: true, render: (r) => <span className="tabular-nums font-medium">{r.quantite}</span> },
    { header: 'Motif', accessor: 'motif', render: (r) => <span className="text-gray-500 text-sm">{r.motif || '—'}</span> },
    { header: 'Date', accessor: 'created_at', sortable: true, render: (r) => formatDateTime(r.created_at) },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
            <TrendingUp size={18} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Mouvements de stock</h1>
            <p className="text-xs text-gray-400">{rows.length} mouvement{rows.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={15} /> Nouveau mouvement</button>
      </div>

      <div className="card p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select className="input" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="">Tous les types</option>
            <optgroup label="Entrées">{ENTREES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</optgroup>
            <optgroup label="Sorties">{SORTIES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</optgroup>
          </select>
          <select className="input" value={filters.warehouse_id} onChange={(e) => setFilters({ ...filters, warehouse_id: e.target.value })}>
            <option value="">Tous les entrepôts</option>
            {warehouses.map((w) => <option key={w.id} value={w.id}>{w.nom}</option>)}
          </select>
          <select className="input" value={filters.product_id} onChange={(e) => setFilters({ ...filters, product_id: e.target.value })}>
            <option value="">Tous les produits</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
          </select>
        </div>
      </div>

      <div className="card p-5">
        <DataTable columns={columns} data={rows} loading={loading} emptyText="Aucun mouvement" />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouveau mouvement" size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          {errors._ && <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{errors._[0]}</div>}

          <div>
            <label className="label">Type <span className="text-red-500">*</span></label>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required>
              <optgroup label="Entrées">{ENTREES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</optgroup>
              <optgroup label="Sorties">{SORTIES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</optgroup>
            </select>
            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type[0]}</p>}
          </div>

          <div>
            <label className="label">Produit <span className="text-red-500">*</span></label>
            <select className="input" value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} required>
              <option value="">— Sélectionner —</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
            {errors.product_id && <p className="text-red-500 text-xs mt-1">{errors.product_id[0]}</p>}
          </div>

          <div>
            <label className="label">Entrepôt <span className="text-red-500">*</span></label>
            <select className="input" value={form.warehouse_id} onChange={(e) => setForm({ ...form, warehouse_id: e.target.value })} required>
              <option value="">— Sélectionner —</option>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.nom}</option>)}
            </select>
            {errors.warehouse_id && <p className="text-red-500 text-xs mt-1">{errors.warehouse_id[0]}</p>}
          </div>

          {/* Contrôle disponible temps réel */}
          {form.product_id && form.warehouse_id && (
            <div className={cn('rounded-xl px-3 py-2 text-sm flex items-center justify-between',
              dispo == null ? 'bg-gray-50 text-gray-500' : insufficient ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700')}>
              <span>Disponible actuel</span>
              <span className="font-semibold tabular-nums">{dispo == null ? '…' : dispo}</span>
            </div>
          )}

          <div>
            <label className="label">Quantité <span className="text-red-500">*</span></label>
            <input type="number" min="1" className="input" value={form.quantite}
              onChange={(e) => setForm({ ...form, quantite: e.target.value })} required />
            {errors.quantite && <p className="text-red-500 text-xs mt-1">{errors.quantite[0]}</p>}
            {insufficient && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <AlertTriangle size={12} /> Quantité supérieure au disponible ({dispo}). Sortie impossible.
              </p>
            )}
          </div>

          <div>
            <label className="label">Motif</label>
            <textarea className="input resize-none" rows={2} value={form.motif}
              onChange={(e) => setForm({ ...form, motif: e.target.value })} />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary" disabled={saving || insufficient}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
