import React, { useEffect, useState } from 'react'
import { usersApi } from '../../api/users.api'
import DataTable from '../../components/shared/DataTable'
import Modal from '../../components/shared/Modal'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { StatusBadge } from '../../components/shared/Badges'
import { Users, Plus, Pencil, Power, Trash2, CheckCircle2 } from 'lucide-react'
import { formatDate, getRoleBadgeColor, cn } from '../../lib/utils'

const ROLES = [
  { value: 'administrateur', label: 'Administrateur' },
  { value: 'gestionnaire', label: 'Gestionnaire' },
  { value: 'magasinier', label: 'Magasinier' },
  { value: 'auditeur', label: 'Auditeur' },
]
const EMPTY = { nom: '', prenom: '', email: '', password: '', password_confirmation: '', telephone: '', role: '' }

export default function UsersPage() {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState({ open: false, data: null })
  const [confirm, setConfirm] = useState({ open: false, id: null })
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(null)
  const [notification, setNotification] = useState(null)
  const [form, setForm]       = useState(EMPTY)
  const [errors, setErrors]   = useState({})

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(() => setNotification(null), 4500)
    return () => clearTimeout(timer)
  }, [notification])

  async function load() {
    setLoading(true)
    try {
      const { data } = await usersApi.list()
      setRows(Array.isArray(data) ? data : data.data || [])
    } catch { setRows([]) } finally { setLoading(false) }
  }

  function openCreate() {
    setForm({ ...EMPTY, role: '' })
    setErrors({})
    setModal({ open: true, data: null })
  }
  function openEdit(row) {
    setForm({ nom: row.nom, prenom: row.prenom, email: row.email, password: '', password_confirmation: '', telephone: row.telephone || '', role: row.roles?.[0]?.name || '' })
    setErrors({}); setModal({ open: true, data: row })
  }

  async function handleSave(e) {
    e.preventDefault(); setSaving(true); setErrors({})
    const payload = { ...form }
    
    // Clean payload for create vs update
    if (modal.data) {
      // Update: remove password if empty
      if (!payload.password) { delete payload.password; delete payload.password_confirmation }
    }
    
    try {
      if (modal.data) {
        await usersApi.update(modal.data.id, payload)
        setNotification({ type: 'success', message: `Utilisateur ${form.prenom} ${form.nom} modifié avec succès.` })
      } else {
        await usersApi.create(payload)
        setNotification({ type: 'success', message: `Utilisateur ${form.prenom} ${form.nom} ajouté avec succès.` })
      }
      setModal({ open: false, data: null }); load()
    } catch (err) {
      const validationErrors = err.response?.data?.errors || {}
      console.error('Erreurs de validation:', validationErrors, 'Payload:', payload)
      setErrors(validationErrors)
    }
    finally { setSaving(false) }
  }

  async function handleToggle(id, actif, prenom, nom) {
    setToggling(id)
    try {
      await usersApi.toggle(id)
      setNotification({ type: 'success', message: `Utilisateur ${prenom} ${nom} ${actif ? 'désactivé' : 'activé'} avec succès.` })
      load()
    } catch {
      alert('Erreur')
    } finally {
      setToggling(null)
    }
  }

  function confirmDelete(id) {
    setConfirm({ open: true, id })
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await usersApi.destroy(confirm.id)
      setConfirm({ open: false, id: null })
      setNotification({ type: 'success', message: 'Utilisateur supprimé avec succès.' })
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    {
      header: 'Utilisateur', accessor: 'nom', sortable: true,
      render: r => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 text-xs font-semibold">{r.prenom?.[0]}{r.nom?.[0]}</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{r.prenom} {r.nom}</p>
            <p className="text-xs text-gray-400">{r.email}</p>
          </div>
        </div>
      )
    },
    { header: 'Téléphone', accessor: 'telephone', render: r => r.telephone || '—' },
    {
      header: 'Rôle',
      render: r => {
        const role = r.roles?.[0]?.name
        return role
          ? <span className={cn('badge', getRoleBadgeColor(role))}>{role}</span>
          : <span className="text-gray-400 text-xs">Aucun rôle</span>
      }
    },
    { header: 'Statut', render: r => <StatusBadge status={r.actif ? 'actif' : 'inactif'} /> },
    { header: 'Créé le', accessor: 'created_at', sortable: true, render: r => formatDate(r.created_at) },
    {
      header: 'Actions',
      render: r => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(r)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
            <Pencil size={14} />
          </button>
          <button
            onClick={() => confirmDelete(r.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => handleToggle(r.id, r.actif, r.prenom, r.nom)}
            disabled={toggling === r.id}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              r.actif
                ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
            )}
            title={r.actif ? 'Désactiver' : 'Activer'}
          >
            <Power size={14} />
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
            <Users size={18} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Utilisateurs</h1>
            <p className="text-xs text-gray-400">{rows.length} utilisateur{rows.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={15} /> Nouvel utilisateur
        </button>
      </div>

      {notification && (
        <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm flex items-center gap-3 ${notification.type === 'success' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-amber-100 bg-amber-50 text-amber-700'}`}>
          <CheckCircle2 size={18} />
          <span>{notification.message}</span>
        </div>
      )}

      <div className="card p-5">
        <DataTable columns={columns} data={rows} loading={loading} emptyText="Aucun utilisateur" />
      </div>

      <Modal open={modal.open} onClose={() => setModal({ open: false, data: null })}
        title={modal.data ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Prénom <span className="text-red-500">*</span></label>
              <input className="input" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} required />
              {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom[0]}</p>}
            </div>
            <div>
              <label className="label">Nom <span className="text-red-500">*</span></label>
              <input className="input" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required />
              {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom[0]}</p>}
            </div>
          </div>
          <div>
            <label className="label">Email <span className="text-red-500">*</span></label>
            <input type="email" className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
          </div>
          <div>
            <label className="label">Téléphone</label>
            <input className="input" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} />
          </div>
          <div>
            <label className="label">Rôle <span className="text-red-500">*</span></label>
            <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} required>
              <option value="">— Sélectionner un rôle —</option>
              {ROLES.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}
            </select>
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role[0]}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">
                {modal.data ? 'Nouveau mot de passe' : 'Mot de passe'} {!modal.data && <span className="text-red-500">*</span>}
              </label>
              <input type="password" className="input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!modal.data} minLength={8} />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
            </div>
            <div>
              <label className="label">Confirmation {!modal.data && <span className="text-red-500">*</span>}</label>
              <input type="password" className="input" value={form.password_confirmation} onChange={e => setForm({ ...form, password_confirmation: e.target.value })} required={!modal.data} />
            </div>
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
        title="Supprimer l'utilisateur"
        message="Cette action est définitive. Voulez-vous continuer ?"
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
        loading={deleting}
      />
    </div>
  )
}
