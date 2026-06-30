import React, { useEffect, useMemo, useState } from 'react'
import Modal from '../../components/shared/Modal'
import { getUserAccess, updateUserAccess, listRoles, listPermissions } from '../../api/access.api'
import { listWarehouses } from '../../api/warehouses.api'
import { ShieldCheck, Check, Loader2, Warehouse } from 'lucide-react'
import { cn } from '../../lib/utils'

const ROLE_LABEL = {
  administrateur: 'Administrateur',
  gestionnaire: 'Gestionnaire',
  magasinier: 'Magasinier',
  auditeur: 'Auditeur',
}

export default function UserAccessModal({ user, open, onClose, onSaved }) {
  const [roles, setRoles] = useState([])              // [{name, permissions[]}]
  const [permissions, setPermissions] = useState([])  // [{name,label,group}]
  const [warehouses, setWarehouses] = useState([])    // [{id, nom}]
  const [selectedRoles, setSelectedRoles] = useState(new Set())
  const [directPerms, setDirectPerms] = useState(new Set())
  const [selectedWh, setSelectedWh] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const unwrap = (d) => (Array.isArray(d) ? d : d?.data || [])

  useEffect(() => {
    if (!open || !user) return
    let cancelled = false
    setLoading(true); setError('')
    Promise.all([getUserAccess(user.id), listRoles(), listPermissions(), listWarehouses()])
      .then(([access, rs, perms, whs]) => {
        if (cancelled) return
        setRoles(rs)
        setPermissions(perms)
        setWarehouses(unwrap(whs))
        setSelectedRoles(new Set(access.roles))
        setDirectPerms(new Set(access.direct_permissions))
        setSelectedWh(new Set(access.warehouses || []))
      })
      .catch(() => !cancelled && setError('Erreur lors du chargement des accès.'))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [open, user])

  const isAdmin = selectedRoles.has('administrateur')

  // Permissions héritées = union des permissions des rôles sélectionnés.
  const inherited = useMemo(() => {
    const set = new Set()
    roles.filter(r => selectedRoles.has(r.name)).forEach(r => r.permissions.forEach(p => set.add(p)))
    return set
  }, [roles, selectedRoles])

  const groups = useMemo(() => {
    const map = new Map()
    for (const p of permissions) {
      if (!map.has(p.group)) map.set(p.group, [])
      map.get(p.group).push(p)
    }
    return [...map.entries()]
  }, [permissions])

  function toggleRole(name) {
    setSelectedRoles(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  function togglePerm(name) {
    if (inherited.has(name) || isAdmin) return // hérité = non modifiable ici
    setDirectPerms(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  function toggleWh(id) {
    setSelectedWh(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function save() {
    setSaving(true); setError('')
    try {
      // On ne renvoie pas en "direct" une permission déjà couverte par un rôle.
      const directOnly = [...directPerms].filter(p => !inherited.has(p))
      await updateUserAccess(user.id, {
        roles: [...selectedRoles],
        permissions: directOnly,
        warehouses: isAdmin ? [] : [...selectedWh],
      })
      onSaved?.()
      onClose?.()
    } catch {
      setError('Erreur lors de l’enregistrement.')
    } finally { setSaving(false) }
  }

  return (
    <Modal open={open} onClose={onClose} icon={ShieldCheck}
      title="Gérer les accès" subtitle={user ? `${user.prenom} ${user.nom}` : ''} size="lg">
      {loading ? (
        <div className="py-10 text-center text-gray-400">Chargement…</div>
      ) : (
        <div className="space-y-6">
          {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5">{error}</div>}

          {/* Rôles */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Rôles</h3>
            <div className="grid grid-cols-2 gap-2">
              {roles.map(r => {
                const on = selectedRoles.has(r.name)
                return (
                  <button key={r.name} type="button" onClick={() => toggleRole(r.name)}
                    className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all',
                      on ? 'border-primary-200 bg-primary-50/60' : 'border-gray-100 hover:border-gray-200')}>
                    <span className={cn('w-5 h-5 rounded-md flex items-center justify-center shrink-0 border',
                      on ? 'bg-primary-600 border-primary-600' : 'border-gray-300 bg-white')}>
                      {on && <Check size={13} className="text-white" />}
                    </span>
                    <span className="text-sm text-gray-800">{ROLE_LABEL[r.name] || r.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Permissions</h3>
              <span className="text-[11px] text-gray-400">
                <span className="inline-block w-2 h-2 rounded-full bg-primary-300 mr-1 align-middle" />hérité du rôle
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 ml-3 mr-1 align-middle" />accordé directement
              </span>
            </div>

            {isAdmin && (
              <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                L’administrateur dispose de toutes les permissions.
              </div>
            )}

            <div className="space-y-4">
              {groups.map(([group, perms]) => (
                <div key={group}>
                  <p className="text-[11px] font-medium text-gray-400 mb-1.5">{group}</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {perms.map(p => {
                      const isInherited = isAdmin || inherited.has(p.name)
                      const isDirect = directPerms.has(p.name) && !isInherited
                      const on = isInherited || isDirect
                      return (
                        <button key={p.name} type="button" onClick={() => togglePerm(p.name)}
                          disabled={isInherited}
                          className={cn('flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-all',
                            on ? 'bg-primary-50/40 border-primary-100' : 'border-gray-100 hover:border-gray-200',
                            isInherited && 'cursor-not-allowed')}>
                          <span className={cn('w-4 h-4 rounded flex items-center justify-center shrink-0 border',
                            isInherited ? 'bg-primary-300 border-primary-300'
                              : isDirect ? 'bg-emerald-500 border-emerald-500'
                              : 'border-gray-300 bg-white')}>
                            {on && <Check size={11} className="text-white" />}
                          </span>
                          <span className="text-sm text-gray-700 truncate">{p.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Périmètre entrepôts */}
          {!isAdmin && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Warehouse size={14} className="text-gray-400" />
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Entrepôts autorisés</h3>
              </div>
              <p className="text-[11px] text-gray-400 mb-2">
                {selectedWh.size === 0
                  ? 'Aucune restriction — l’utilisateur voit tous les entrepôts.'
                  : `Restreint à ${selectedWh.size} entrepôt${selectedWh.size > 1 ? 's' : ''}.`}
              </p>
              <div className="grid sm:grid-cols-2 gap-2">
                {warehouses.map(w => {
                  const on = selectedWh.has(w.id)
                  return (
                    <button key={w.id} type="button" onClick={() => toggleWh(w.id)}
                      className={cn('flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-all',
                        on ? 'bg-primary-50/60 border-primary-200' : 'border-gray-100 hover:border-gray-200')}>
                      <span className={cn('w-4 h-4 rounded flex items-center justify-center shrink-0 border',
                        on ? 'bg-primary-600 border-primary-600' : 'border-gray-300 bg-white')}>
                        {on && <Check size={11} className="text-white" />}
                      </span>
                      <span className="text-sm text-gray-700 truncate">{w.nom}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="button" onClick={save} className="btn-primary" disabled={saving}>
              {saving && <Loader2 size={15} className="animate-spin" />}
              {saving ? 'Enregistrement…' : 'Enregistrer les accès'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
