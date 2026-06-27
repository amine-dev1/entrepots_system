import { useEffect, useState } from 'react'
import { 
  listTransfers, updateTransfer, createTransfer, deleteTransfer 
} from '../../api/transfers.api'
import { listWarehouses } from '../../api/warehouses.api'
import { listProducts } from '../../api/products.api' 
import { listStocks } from '../../api/stocks.api' 
import DataTable from '../../components/shared/DataTable'
import Modal from '../../components/shared/Modal'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { 
  ArrowLeftRight, Plus, Trash2, Eye, 
  ChevronRight, ChevronLeft, Search
} from 'lucide-react'
import { formatDate } from '../../lib/utils'
import { TransfersBadge } from '../../components/shared/Badges'
import { useNavigate } from 'react-router-dom'

const EMPTY = {
  note:                '',
  source_warehouse_id: null,
  dest_warehouse_id:   null,
  items:               [], 
}

// Map alignée sur votre TRANSFERS_STATUS_MAP pour le filtre Select
const TRANSFER_STATUSES = [
  { value: 'brouillon',  label: 'Brouillon' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'valide',     label: 'Validé' },
  { value: 'recu',       label: 'Reçu' },
  { value: 'annule',     label: 'Annulé' },
]

export default function TransfersPage() {
  const [rows,       setRows]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [warehouses, setWarehouses] = useState([])
  const [products,   setProducts]   = useState([])
  const [stocks,     setStocks]     = useState([])

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    source_warehouse: '',
    dest_warehouse: ''
  })

  const [modal,        setModal]        = useState({ open: false, data: null })
  const [confirm,      setConfirm]      = useState({ open: false, id: null })
  
  const [step,          setStep]          = useState(1)
  const [form,          setForm]          = useState(EMPTY)
  const [errors,        setErrors]        = useState({})
  const [saving,        setSaving]        = useState(false)
  const [deleting,      setDeleting]      = useState(false)
  const [stocksLoading, setStocksLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { 
    load()
    loadWarehouses()
    loadProducts() 
  }, [])

  // Reload stocks whenever source warehouse changes
  useEffect(() => {
    loadStocksByWarehouse(form.source_warehouse_id)
  }, [form.source_warehouse_id])

  // ── Data loaders ─────────────────────────────────────────────────────────────

  async function load() {
    setLoading(true)
    try {
      const data = await listTransfers()
      setRows(Array.isArray(data) ? data : data.data ?? [])
    } catch { setRows([]) } 
    finally { setLoading(false) }
  }

  async function loadWarehouses() {
    try {
      const data = await listWarehouses()
      setWarehouses(Array.isArray(data) ? data : data.data ?? [])
    } catch { setWarehouses([]) }
  }

  async function loadProducts() {
    try {
      const data = await listProducts()
      setProducts(Array.isArray(data) ? data : data.data ?? [])
    } catch { setProducts([]) }
  }

  async function loadStocksByWarehouse(warehouseId) {
    if (!warehouseId) { setStocks([]); return }
    setStocksLoading(true)
    try {
      const data = await listStocks({ warehouse_id: warehouseId })
      setStocks(Array.isArray(data) ? data : data.data ?? [])
    } catch { setStocks([]) }
    finally { setStocksLoading(false) }
  }

  // ── Modal helpers ─────────────────────────────────────────────────────────────

  function openCreate() {
    setStep(1)
    setForm(EMPTY)
    setErrors({})
    setStocks([])
    setModal({ open: true, data: null })
  }

  function closeModal() {
    setModal({ open: false, data: null })
  }

  // ── Wizard Logic ──────────────────────────────────────────────────────────────

  function handleNext() {
    setErrors({})
    const errs = {}

    if (step === 1) {
      if (!form.source_warehouse_id) errs.source_warehouse_id = ['Entrepôt source requis.']
      if (!form.dest_warehouse_id)   errs.dest_warehouse_id   = ['Entrepôt destination requis.']
      if (form.source_warehouse_id && form.dest_warehouse_id &&
          String(form.source_warehouse_id) === String(form.dest_warehouse_id)) {
        errs.dest_warehouse_id = ['La destination doit être différente de la source.']
      }
    }

    if (step === 2) {
      if (form.items.length === 0) {
        errs.items = ['Ajoutez au moins un produit.']
      } else {
        form.items.forEach((item, idx) => {
          if (!item.product_id) {
            errs[`item_${idx}_product`] = 'Produit requis'
          }
          if (!item.quantite || item.quantite <= 0) {
            errs[`item_${idx}_qty`] = 'Quantité invalide'
          } else {
            const stock = stocks.find(s => String(s.product_id) === String(item.product_id))
            const available = stock?.disponible ?? 0
            if (Number(item.quantite) > available) {
              errs[`item_${idx}_qty`] = `Dépasse le stock disponible (${available})`
            }
          }
        })
      }
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setStep(s => s + 1)
  }

  function handlePrev() {
    setStep(s => s - 1)
  }

  // ── Items Management ──────────────────────────────────────────────────────────

  function addItem() {
    setForm({ ...form, items: [...form.items, { product_id: '', quantite: 1 }] })
  }

  function updateItem(index, field, value) {
    const newItems = [...form.items]
    newItems[index][field] = value
    setForm({ ...form, items: newItems })
  }

  function removeItem(index) {
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) })
  }

  // ── Save ──────────────────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true)
    setErrors({})
    try {
      const payload = {
        source_warehouse_id: form.source_warehouse_id,
        dest_warehouse_id:   form.dest_warehouse_id,
        note:                form.note || undefined,
        items:               form.items.map(i => ({ product_id: i.product_id, quantite: Number(i.quantite) }))
      }
      await createTransfer(payload)
      closeModal()
      load()
    } catch (err) {
      setErrors(err.response?.data?.errors ?? { global: ['Erreur lors de la sauvegarde.'] })
      setStep(1)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteTransfer(confirm.id)
      setConfirm({ open: false, id: null })
      load()
    } catch (err) {
      alert(err.response?.data?.message ?? 'Erreur lors de la suppression.')
    } finally {
      setDeleting(false)
    }
  }

  // ── Filtrage Amélioré ───────────────────────────────────────────────────────
  
  const filteredRows = rows.filter(r => {
    const q = filters.search.toLowerCase()
    
    // Recherche multi-critères : référence, note, entrepôt source et destination
    const searchMatch = !q || (
      (r.reference?.toLowerCase().includes(q)) ||
      (r.note?.toLowerCase().includes(q)) ||
      (r.source_warehouse?.nom?.toLowerCase().includes(q)) ||
      (r.dest_warehouse?.nom?.toLowerCase().includes(q))
    )
    
    const statusMatch = !filters.status || r.statut === filters.status
    
    const srcId = String(r.source_warehouse_id || r.source_warehouse?.id || '')
    const destId = String(r.dest_warehouse_id || r.dest_warehouse?.id || '')
    
    const sourceMatch = !filters.source_warehouse || srcId === String(filters.source_warehouse)
    const destMatch = !filters.dest_warehouse || destId === String(filters.dest_warehouse)

    return searchMatch && statusMatch && sourceMatch && destMatch
  })

  // ── Table columns ─────────────────────────────────────────────────────────────

  const columns = [
    { header: 'Référence', accessor: 'reference', sortable: true,
      render: r => <span className="font-medium text-gray-900">{r.reference ?? '—'}</span>
    },
    { header: 'Source',      accessor: 'source_warehouse', render: r => r.source_warehouse?.nom ?? '—' },
    { header: 'Destination', accessor: 'dest_warehouse',   render: r => r.dest_warehouse?.nom ?? '—' },
    { header: 'Date',   accessor: 'created_at', sortable: true, render: r => formatDate(r.created_at) },
    { header: 'Statut', accessor: 'statut', render: r => <TransfersBadge status={r.statut} /> },
    {
      header: 'Actions',
      render: r => (
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(`/transfers/${r.id}`)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
            <Eye size={14} />
          </button>
          {r.statut === 'brouillon' && (
            <button onClick={() => setConfirm({ open: true, id: r.id })} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ),
    },
  ]

  // ── Helpers ───────────────────────────────────────────────────────────────────

  const getWarehouseName = (id) => warehouses.find(w => String(w.id) === String(id))?.nom || 'Inconnu'
  const getProductName   = (id) => products.find(p => String(p.id) === String(id))?.nom || 'Inconnu'

  const availableProducts = products.filter(p =>
    stocks.some(s => String(s.product_id) === String(p.id))
  )

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
            <ArrowLeftRight size={18} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Transferts</h1>
            <p className="text-xs text-gray-400">{filteredRows.length} transfert(s) affiché(s)</p>
          </div>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={15} /> Nouveau transfert
        </button>
      </div>

      <div className="card p-5">
        
        {/* ── Barre de filtres Améliorée ────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher par référence, entrepôt..." 
              className="input pl-9 w-full"
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          
          <select 
            className="input md:w-40"
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Tous statuts</option>
            {TRANSFER_STATUSES.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <select 
            className="input md:w-48"
            value={filters.source_warehouse}
            onChange={e => setFilters({ ...filters, source_warehouse: e.target.value })}
          >
            <option value="">Toutes sources</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.nom}</option>)}
          </select>

          <select 
            className="input md:w-48"
            value={filters.dest_warehouse}
            onChange={e => setFilters({ ...filters, dest_warehouse: e.target.value })}
          >
            <option value="">Toutes destinations</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.nom}</option>)}
          </select>
        </div>

        <DataTable columns={columns} searchable={false} data={filteredRows} loading={loading} emptyText="Aucun transfert trouvé" />
      </div>

      {/* ── Create Wizard Modal ────────────────────────────────────────────────── */}
      <Modal open={modal.open} onClose={closeModal} title="Nouveau transfert" size={step === 3 ? 'md' : 'lg'}>
        
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-4 text-sm font-medium">
            {[['1', 'Infos'], ['2', 'Produits'], ['3', 'Résumé']].map(([n, label], i) => (
              <div key={`step-wrapper-${n}`} className="flex items-center">
                {i > 0 && <div className="w-8 h-px bg-gray-200 mr-4"></div>}
                <div className={`flex items-center ${step >= Number(n) ? 'text-primary-600' : 'text-gray-400'}`}>
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full mr-2 ${step >= Number(n) ? 'bg-primary-100' : 'bg-gray-100'}`}>{n}</span>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {errors.global && (
          <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">{errors.global[0]}</div>
        )}

        {/* Step 1 : General Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Entrepôt source <span className="text-red-500">*</span></label>
                <select className="input" value={form.source_warehouse_id ?? ''}
                  onChange={e => setForm({ ...form, source_warehouse_id: e.target.value || null, items: [] })}>
                  <option value="">— Choisir —</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.nom}</option>)}
                </select>
                {errors.source_warehouse_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.source_warehouse_id[0]}</p>
                )}
              </div>
              <div>
                <label className="label">Entrepôt destination <span className="text-red-500">*</span></label>
                <select className="input" value={form.dest_warehouse_id ?? ''}
                  onChange={e => setForm({ ...form, dest_warehouse_id: e.target.value || null })}>
                  <option value="">— Choisir —</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.nom}</option>)}
                </select>
                {errors.dest_warehouse_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.dest_warehouse_id[0]}</p>
                )}
              </div>
            </div>
            <div>
              <label className="label">Note (Optionnel)</label>
              <textarea className="input resize-none" rows={2} placeholder="Justification..."
                value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
            </div>
          </div>
        )}

        {/* Step 2 : Products */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Articles à transférer</h3>
              <button onClick={addItem} disabled={stocksLoading || availableProducts.length === 0}
                className="text-xs btn-secondary py-1 px-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <Plus size={14} className="mr-1"/> Ajouter une ligne
              </button>
            </div>

            {stocksLoading ? (
              <p className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded p-2">
                Chargement du stock de l'entrepôt source…
              </p>
            ) : availableProducts.length === 0 ? (
              <p className="text-amber-600 text-xs bg-amber-50 border border-amber-200 rounded p-2">
                ⚠️ Aucun produit en stock dans l'entrepôt source sélectionné.
              </p>
            ) : (
              <p className="text-green-700 text-xs bg-green-50 border border-green-200 rounded p-2">
                ✓ {availableProducts.length} produit(s) disponible(s) dans cet entrepôt.
              </p>
            )}

            {errors.items && <p className="text-red-500 text-xs">{errors.items[0]}</p>}

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-gray-600 font-medium">Produit</th>
                    <th className="px-3 py-2 text-gray-600 font-medium w-32">Quantité</th>
                    <th className="px-3 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {form.items.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-4 text-center text-gray-400 italic">
                        Aucun produit ajouté.
                      </td>
                    </tr>
                  ) : (
                    form.items.map((item, idx) => {
                      const stockEntry = stocks.find(s => String(s.product_id) === String(item.product_id))
                      const available  = stockEntry?.disponible ?? null

                      return (
                        <tr key={idx} className="bg-white">
                          <td className="p-2">
                            <select className="input text-sm" value={item.product_id}
                              onChange={e => updateItem(idx, 'product_id', e.target.value)}>
                              <option value="">— Sélectionner un produit —</option>
                              {availableProducts.map(p => {
                                const s = stocks.find(st => String(st.product_id) === String(p.id))
                                return (
                                  <option key={p.id} value={p.id}>
                                    {p.nom} — {s?.disponible ?? 0} dispo
                                  </option>
                                )
                              })}
                            </select>
                            {errors[`item_${idx}_product`] && (
                              <p className="text-red-500 text-xs mt-1">{errors[`item_${idx}_product`]}</p>
                            )}
                          </td>
                          <td className="p-2">
                            <input type="number" min="1"
                              max={available ?? undefined}
                              className="input text-sm"
                              value={item.quantite}
                              onChange={e => updateItem(idx, 'quantite', e.target.value)} />
                            {available !== null && (
                              <p className="text-gray-400 text-xs mt-0.5">Max : {available}</p>
                            )}
                            {errors[`item_${idx}_qty`] && (
                              <p className="text-red-500 text-xs mt-1">{errors[`item_${idx}_qty`]}</p>
                            )}
                          </td>
                          <td className="p-2 text-center">
                            <button onClick={() => removeItem(idx)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 3 : Summary */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4 text-sm border border-gray-100">
              <div>
                <p className="text-gray-500 text-xs uppercase font-semibold">Source</p>
                <p className="font-medium mt-1">{getWarehouseName(form.source_warehouse_id)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase font-semibold">Destination</p>
                <p className="font-medium mt-1">{getWarehouseName(form.dest_warehouse_id)}</p>
              </div>
              {form.note && (
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs uppercase font-semibold">Note</p>
                  <p className="text-gray-700 mt-1">{form.note}</p>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2 text-gray-700">
                Produits sélectionnés ({form.items.length})
              </h4>
              <ul className="space-y-2">
                {form.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm p-2 border border-gray-100 rounded">
                    <span className="font-medium text-gray-800">{getProductName(item.product_id)}</span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-bold">
                      x {item.quantite}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6 mt-4 border-t border-gray-100">
          {step > 1 ? (
            <button type="button" onClick={handlePrev} className="btn-secondary">
              <ChevronLeft size={16} className="mr-1"/> Précédent
            </button>
          ) : <div />}

          {step < 3 ? (
            <button type="button" onClick={handleNext} className="btn-primary">
              Suivant <ChevronRight size={16} className="ml-1"/>
            </button>
          ) : (
            <button type="button" onClick={handleSave} disabled={saving}
              className="btn-primary bg-green-600 hover:bg-green-700">
              {saving ? 'Enregistrement...' : 'Confirmer le transfert'}
            </button>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        title="Supprimer le transfert brouillon"
        message="Voulez-vous vraiment supprimer ce transfert ?"
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
        loading={deleting}
      />
    </div>
  )
}