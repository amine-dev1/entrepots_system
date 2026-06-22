import React, { useEffect, useState } from 'react'
import { listProducts, createProduct, updateProduct, deleteProduct } from '../../api/products.api'
import { listCategories } from '../../api/categories.api'
import DataTable from '../../components/shared/DataTable'
import Modal from '../../components/shared/Modal'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { Tag, Plus, Pencil, Trash2, Image } from 'lucide-react'
import { formatDate, formatMoney } from '../../lib/utils'

const EMPTY = { nom: '', description: '', prix_achat: '', prix_vente: '', sku: '', stock_minimum: '', categorie_id: null, actif: true }

export default function ProductsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, data: null })
  const [confirm, setConfirm] = useState({ open: false, id: null })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [categories, setCategories] = useState([])

  useEffect(() => { load(); loadCategories() }, [])

  async function loadCategories() {
    try {
      const data = await listCategories()
      setCategories(Array.isArray(data) ? data : data.data || [])
    } catch { setCategories([]) }
  }

  async function load() {
    setLoading(true)
    try {
      const data = await listProducts({ inactifs: true })
      setRows(Array.isArray(data) ? data : data.data || [])
    } catch { setRows([]) } finally { setLoading(false) }
  }

  function openCreate() { setForm(EMPTY); setErrors({}); setModal({ open: true, data: null }) }
  function openEdit(row) {
    setForm({
      nom: row.nom || '', description: row.description || '', prix_achat: row.prix_achat, prix_vente: row.prix_vente,
      sku: row.sku || '', stock_minimum: row.stock_minimum ?? '', categorie_id: row.categorie_id || null, actif: !!row.actif
    })
    setErrors({}); setModal({ open: true, data: row })
  }

  async function handleSave(e) {
    e.preventDefault(); setSaving(true); setErrors({})
    try {
      const payload = { ...form }
      if (form.image instanceof File) {
        const fd = new FormData()
        Object.entries(payload).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v) })
        fd.append('image', form.image)
        if (modal.data) await updateProduct(modal.data.id, fd)
        else await createProduct(fd)
      } else {
        if (modal.data) await updateProduct(modal.data.id, payload)
        else await createProduct(payload)
      }
      setModal({ open: false, data: null }); load()
    } catch (err) { setErrors(err.response?.data?.errors || {}) }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteProduct(confirm.id)
      setConfirm({ open: false, id: null }); load()
    } catch (err) { alert(err.response?.data?.message || 'Erreur') }
    finally { setDeleting(false) }
  }

  const columns = [
    {
      header: 'Produit', accessor: 'nom', sortable: true,
      render: r => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
            <Image size={13} className="text-primary-600" />
          </div>
          <span className="font-medium text-gray-900">{r.nom}</span>
        </div>
      )
    },
    { header: 'Catégorie', accessor: 'category', render: r => r.category ? r.category.nom : '—' },
    { header: 'SKU', accessor: 'sku', render: r => r.sku || '—' },
    { header: 'Prix vente', accessor: 'prix_vente', sortable: true, render: r => formatMoney(r.prix_vente) },
    { header: 'Stock min', accessor: 'stock_minimum', render: r => (r.stock_minimum ?? '—') },
    { header: 'Actif', accessor: 'actif', render: r => r.actif ? <span className="badge bg-green-50 text-green-700">Actif</span> : <span className="badge bg-gray-50 text-gray-600">Inactif</span> },
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
            <h1 className="text-lg font-bold text-gray-900">Produits</h1>
            <p className="text-xs text-gray-400">{rows.length} produit{rows.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={15} /> Nouveau produit
        </button>
      </div>

      <div className="card p-5">
        <DataTable columns={columns} data={rows} loading={loading} emptyText="Aucun produit" />
      </div>

      <Modal open={modal.open} onClose={() => setModal({ open: false, data: null })}
        title={modal.data ? 'Modifier le produit' : 'Nouveau produit'} size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Nom <span className="text-red-500">*</span></label>
            <input className="input" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required autoFocus />
            {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Prix achat</label>
              <input className="input" value={form.prix_achat} onChange={e => setForm({ ...form, prix_achat: e.target.value })} />
            </div>
            <div>
              <label className="label">Prix vente</label>
              <input className="input" value={form.prix_vente} onChange={e => setForm({ ...form, prix_vente: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">SKU</label>
              <input className="input" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
            </div>
            <div>
              <label className="label">Stock minimum</label>
              <input className="input" value={form.stock_minimum} onChange={e => setForm({ ...form, stock_minimum: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          <div>
            <label className="label">Catégorie</label>
            <select className="input" value={form.categorie_id || ''} onChange={e => setForm({ ...form, categorie_id: e.target.value || null })}>
              <option value="">— Aucune —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
            {errors.categorie_id && <p className="text-red-500 text-xs mt-1">{errors.categorie_id[0]}</p>}
          </div>

          <div>
            <label className="label">Image</label>
            <input type="file" accept="image/*" onChange={e => setForm({ ...form, image: e.target.files[0] })} />
            {modal.data?.image && !(form.image instanceof File) && (
              <div className="mt-2 text-sm text-gray-600">Aucune sélection — l'image actuelle sera conservée.</div>
            )}
            {form.image instanceof File && (
              <div className="mt-2">
                <img src={URL.createObjectURL(form.image)} alt="preview" className="w-24 h-24 object-cover rounded" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="actif" checked={!!form.actif} onChange={e => setForm({ ...form, actif: e.target.checked })} />
            <label htmlFor="actif" className="text-sm cursor-pointer">Actif</label>
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
        title="Supprimer le produit"
        message="Cette action est irréversible."
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
        loading={deleting}
      />
    </div>
  )
}
