import React, { useEffect, useState } from 'react'
import { listWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from '../../api/warehouses.api'
import { listUsers } from '../../api/users.api'
import DataTable from '../../components/shared/DataTable'
import Modal from '../../components/shared/Modal'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import Select from '../../components/shared/Select'
import { StatusBadge } from '../../components/shared/Badges'
import { Plus, Pencil, Trash2, Warehouse, MapPin, Phone, User } from 'lucide-react'
import { formatDate } from '../../lib/utils'

const EMPTY = { nom: '', code: '', adresse: '', responsable: '', telephone: '', actif: true }

export default function WarehousesPage() {
  const [rows, setRows]       = useState([])
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState({ open: false, data: null })
  const [confirm, setConfirm] = useState({ open: false, id: null })
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm]       = useState(EMPTY)
  const [errors, setErrors]   = useState({})

  useEffect(() => { load(); loadUsers() }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await listWarehouses({ inactifs: true })
      setRows(Array.isArray(data) ? data : data.data || [])
    } catch { setRows([]) } finally { setLoading(false) }
  }

  async function loadUsers() {
    try {
      const data = await listUsers()
      setUsers(Array.isArray(data) ? data : data.data || [])
    } catch { setUsers([]) }
  }

  function openCreate() {
    setForm(EMPTY); setErrors({})
    setModal({ open: true, data: null })
  }
  function openEdit(row) {
    setForm({ nom: row.nom, code: row.code, adresse: row.adresse || '', responsable: row.responsable || '', telephone: row.telephone || '', actif: !!row.actif })
    setErrors({})
    setModal({ open: true, data: row })
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true); setErrors({})
    try {
      if (modal.data) await updateWarehouse(modal.data.id, form)
      else await createWarehouse(form)
      setModal({ open: false, data: null })
      load()
    } catch (err) {
      setErrors(err.response?.data?.errors || {})
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteWarehouse(confirm.id)
      setConfirm({ open: false, id: null })
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur')
    } finally { setDeleting(false) }
  }

  const columns = [
    { header: 'Code',        accessor: 'code',        sortable: true, render: r => <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{r.code}</span> },
    { header: 'Nom',         accessor: 'nom',         sortable: true, render: r => <span className="font-medium text-gray-900">{r.nom}</span> },
    { header: 'Adresse',     accessor: 'adresse',     render: r => r.adresse || '—' },
    { header: 'Responsable', accessor: 'responsable', render: r => r.responsable || '—' },
    { header: 'Téléphone',   accessor: 'telephone',   render: r => r.telephone || '—' },
    { header: 'Statut', render: r => <StatusBadge status={r.actif ? 'actif' : 'inactif'} /> },
    { header: 'Créé le', accessor: 'created_at', sortable: true, render: r => formatDate(r.created_at) },
    {
      header: 'Actions',
      render: r => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(r)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={() => setConfirm({ open: true, id: r.id })} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
            <Warehouse size={18} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Entrepôts</h1>
            <p className="text-xs text-gray-400">{rows.length} entrepôt{rows.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={15} /> Nouvel entrepôt
        </button>
      </div>

      <div className="card p-5">
        <DataTable columns={columns} data={rows} loading={loading} emptyText="Aucun entrepôt" />
      </div>

      {/* Form Modal */}
      <Modal open={modal.open} onClose={() => setModal({ open: false, data: null })}
        title={modal.data ? 'Modifier l\'entrepôt' : 'Nouvel entrepôt'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nom <span className="text-red-500">*</span></label>
              <input className="input" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required />
              {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom[0]}</p>}
            </div>
            <div>
              <label className="label">Code <span className="text-red-500">*</span></label>
              <input className="input font-mono" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="WH-CAS-01" required />
              {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code[0]}</p>}
            </div>
          </div>
          <div>
            <label className="label"><MapPin size={12} className="inline mr-1" />Adresse</label>
            <textarea className="input resize-none" rows={2} value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label"><User size={12} className="inline mr-1" />Responsable</label>
              <Select
                value={form.responsable}
                onChange={val => setForm({ ...form, responsable: val })}
                options={users.map(user => ({ value: `${user.nom} ${user.prenom}`, label: `${user.nom} ${user.prenom}` }))}
                placeholder="— Aucun responsable —"
              />
              {errors.responsable && <p className="text-red-500 text-xs mt-1">{errors.responsable[0]}</p>}
            </div>
            <div>
              <label className="label"><Phone size={12} className="inline mr-1" />Téléphone</label>
              <input className="input" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!form.actif} onChange={e => setForm({ ...form, actif: e.target.checked })} />
              <span className="text-sm">Actif</span>
            </label>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModal({ open: false, data: null })} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        title="Désactiver l'entrepôt"
        message="L'entrepôt sera désactivé (uniquement si son stock est à zéro)."
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
        loading={deleting}
      />
    </div>
  )
}
