import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { categoriesApi } from '../../api/categories.api'
import DataTable from '../../components/shared/DataTable'
import Modal from '../../components/shared/Modal'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { Tag, Plus, Pencil, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { formatDate } from '../../lib/utils'

const EMPTY = { nom: '', description: '' }

export default function CategoriesPage() {
  const { hasRole } = useAuth()
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState({ open: false, data: null })
  const [confirm, setConfirm] = useState({ open: false, id: null })
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [notification, setNotification] = useState(null)
  const [form, setForm]       = useState(EMPTY)
  const [errors, setErrors]   = useState({})
  const canEdit = hasRole('gestionnaire') || hasRole('administrateur')

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(() => setNotification(null), 4500)
    return () => clearTimeout(timer)
  }, [notification])

  async function load() {
    setLoading(true)
    try {
      const { data } = await categoriesApi.list()
      setRows(Array.isArray(data) ? data : data.data || [])
    } catch { setRows([]) } finally { setLoading(false) }
  }

  function openCreate() { setForm(EMPTY); setErrors({}); setModal({ open: true, data: null }) }
  function openEdit(row) {
    setForm({ nom: row.nom, description: row.description || '' })
    setErrors({}); setModal({ open: true, data: row })
  }

  async function handleSave(e) {
    e.preventDefault(); setSaving(true); setErrors({})
    try {
      if (modal.data) {
        await categoriesApi.update(modal.data.id, form)
        setNotification({ type: 'success', message: `Catégorie ${form.nom} modifiée avec succès.` })
      } else {
        await categoriesApi.create(form)
        setNotification({ type: 'success', message: `Catégorie ${form.nom} ajoutée avec succès.` })
      }
      setModal({ open: false, data: null }); load()
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      if (apiErrors) setErrors(apiErrors)
      else setNotification({ type: 'error', message: err.response?.data?.message || 'Erreur lors de l’enregistrement.' })
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await categoriesApi.destroy(confirm.id)
      setConfirm({ open: false, id: null })
      setNotification({ type: 'success', message: 'Catégorie supprimée avec succès.' })
      load()
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Erreur lors de la suppression.' })
    } finally { setDeleting(false) }
  }

  const columns = [
    {
      header: 'Catégorie', accessor: 'nom', sortable: true,
      render: r => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center">
            <Tag size={13} className="text-primary-600" />
          </div>
          <span className="font-medium text-gray-900">{r.nom}</span>
        </div>
      )
    },
    { header: 'Description', accessor: 'description', render: r => r.description || '—' },
    {
      header: 'Produits', accessor: 'products_count', sortable: true,
      render: r => (
        <span className="badge bg-primary-50 text-primary-700">
          {r.products_count ?? 0} produit{r.products_count !== 1 ? 's' : ''}
        </span>
      )
    },
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
            <Tag size={18} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Catégories</h1>
            <p className="text-xs text-gray-400">{rows.length} catégorie{rows.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <button onClick={openCreate} className="btn-primary" disabled={!canEdit}>
          <Plus size={15} /> Nouvelle catégorie
        </button>
      </div>

      {notification && (
        <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm flex items-center gap-3 ${notification.type === 'success' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-amber-100 bg-amber-50 text-amber-700'}`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} className="text-amber-700" />}
          <span>{notification.message}</span>
        </div>
      )}

      {!canEdit && (
        <div className="mb-5 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
          <AlertTriangle size={16} className="text-gray-500" />
          Vous n’êtes pas autorisé à créer, modifier ou supprimer des catégories.
        </div>
      )}

      <div className="card p-5">
        <DataTable columns={columns} data={rows} loading={loading} emptyText="Aucune catégorie" />
      </div>

      <Modal open={modal.open} onClose={() => setModal({ open: false, data: null })}
        title={modal.data ? 'Modifier la catégorie' : 'Nouvelle catégorie'} size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Nom <span className="text-red-500">*</span></label>
            <input className="input" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required autoFocus />
            {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom[0]}</p>}
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
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
        title="Supprimer la catégorie"
        message="Impossible si elle contient des produits."
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
        loading={deleting}
      />
    </div>
  )
}
