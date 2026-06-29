import { useEffect, useState ,useRef  } from 'react'
import { listInventories, openInventory } from '../../api/inventories.api'
import { listWarehouses } from '../../api/warehouses.api'
import DataTable from '../../components/shared/DataTable'
import Modal from '../../components/shared/Modal'
import { ClipboardList, Plus, Eye, Search, Play } from 'lucide-react'
import { formatDate } from '../../lib/utils'
import { InventoryBadge } from '../../components/shared/Badges'
import { useNavigate } from 'react-router-dom'

const INVENTORY_STATUSES = [
  { value: 'en_cours', label: 'En cours' },
  { value: 'cloture',  label: 'Clôturé' },
  { value: 'ajuste',   label: 'Ajusté' },
]

export default function InventoryListPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [warehouses, setWarehouses] = useState([])

  const [filters, setFilters] = useState({ warehouse_id: '', statut: '', search: '' })
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ warehouse_id: '', type: 'global' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // const searchDebounceRef = useRef(null)

  // function handleSearchChange(value) {
  //   setFilters(f => ({ ...f, search: value }))
  //   clearTimeout(searchDebounceRef.current)
  //   searchDebounceRef.current = setTimeout(() => {
  //     loadInventories()
  //   }, 400)
  // }
  
  const navigate = useNavigate()

  useEffect(() => { 
    loadInventories()
    loadWarehouses()
  }, [filters.warehouse_id, filters.statut, filters.search])

  async function loadInventories() {
    setLoading(true)
    try {
      const data = await listInventories(filters)
      setRows(Array.isArray(data) ? data : data.data ?? [])
    } catch { 
      setRows([]) 
    } finally { 
      setLoading(false) 
    }
  }

  async function loadWarehouses() {
    try {
      const data = await listWarehouses()
      setWarehouses(Array.isArray(data) ? data : data.data ?? [])
    } catch { 
      setWarehouses([]) 
    }
  }

  async function handleCreate() {
    setErrors({})
    if (!form.warehouse_id) {
      setErrors({ warehouse_id: ['Veuillez sélectionner un entrepôt.'] })
      return
    }

    setSaving(true)
    try {
      const res = await openInventory(form)
      setModalOpen(false)
      // Redirection vers la page de session d'inventaire
      navigate(`/inventories/${res.data?.id || res.id}/session`)
    } catch (err) {
      setErrors(err.response?.data?.errors ?? { global: ['Erreur lors de la création de l\'inventaire.'] })
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { header: 'Entrepôt', accessor: 'warehouse', render: r => <span className="font-medium text-gray-900">{r.warehouse?.nom ?? '—'}</span> },
    { header: 'Type', accessor: 'type', render: r => <span className="capitalize">{r.type}</span> },
    { header: 'Date de début', accessor: 'started_at', render: r => formatDate(r.started_at) },
    { header: 'Statut', accessor: 'statut', render: r => <InventoryBadge status={r.statut} /> },
    {
      header: 'Actions',
      render: r => (
        <div className="flex items-center gap-2">
          {r.statut === 'en_cours' ? (
            <button onClick={() => navigate(`/inventories/${r.id}/session`)} className="btn-secondary py-1 px-2 text-xs text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">
              <Play size={14} className="mr-1" /> Continuer
            </button>
          ) : (
            <button onClick={() => navigate(`/inventories/${r.id}/adjust`)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
              <Eye size={16} />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
            <ClipboardList size={18} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Inventaires</h1>
            <p className="text-xs text-gray-400">Gérez vos sessions de comptage</p>
          </div>
        </div>
        <button onClick={() => { setForm({ warehouse_id: '', type: 'global' }); setModalOpen(true) }} className="btn-primary">
          <Plus size={15} /> Démarrer un inventaire
        </button>
      </div>

      <div className="card p-5">
        <div className="flex flex-col md:flex-row gap-3 mb-5">

        <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher par référence, entrepôt..." 
              className="input pl-9 w-full"
              value={filters.search}
              onChange={e => handleSearchChange(e.target.value)}
            />
          </div>

          <select 
            className="input md:w-48"
            value={filters.statut}
            onChange={e => setFilters({ ...filters, statut: e.target.value })}
          >
            <option value="">Tous les statuts</option>
            {INVENTORY_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <select 
            className="input md:w-64"
            value={filters.warehouse_id}
            onChange={e => setFilters({ ...filters, warehouse_id: e.target.value })}
          >
            <option value="">Tous les entrepôts</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.nom}</option>)}
          </select>
        </div>

        <DataTable columns={columns} searchable={false} data={rows} loading={loading} emptyText="Aucun inventaire trouvé" />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouvelle session d'inventaire" size="md">
        {errors.global && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">{errors.global[0]}</div>}
        
        <div className="space-y-4">
          <div>
            <label className="label">Entrepôt à inventorier <span className="text-red-500">*</span></label>
            <select className="input" value={form.warehouse_id} onChange={e => setForm({ ...form, warehouse_id: e.target.value })}>
              <option value="">— Sélectionner —</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.nom}</option>)}
            </select>
            {errors.warehouse_id && <p className="text-red-500 text-xs mt-1">{errors.warehouse_id[0]}</p>}
          </div>

          <div>
            <label className="label">Type d'inventaire <span className="text-red-500">*</span></label>
            <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="global">Global (Tout le stock)</option>
              <option value="tournant">Tournant (Partiel)</option>
            </select>
            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type[0]}</p>}
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-2">
            <span className="text-xl">ℹ️</span>
            <p className="text-xs text-blue-800">
              Le démarrage capturera le stock théorique actuel (snapshot) pour cet entrepôt. 
              Les mouvements de stock pendant l'inventaire peuvent fausser les écarts.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-6 mt-4 border-t border-gray-100">
          <button type="button" onClick={handleCreate} disabled={saving} className="btn-primary">
            {saving ? 'Démarrage...' : 'Démarrer le comptage'}
          </button>
        </div>
      </Modal>
    </div>
  )
}