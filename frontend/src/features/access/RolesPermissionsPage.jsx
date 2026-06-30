import React, { useEffect, useMemo, useState } from 'react'
import { listPermissions, listRoles, updateRolePermissions } from '../../api/access.api'
import { ShieldCheck, Check, Save, Loader2, Users, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '../../lib/utils'

const ROLE_META = {
  administrateur: { label: 'Administrateur', color: 'bg-red-50 text-red-700 border-red-200' },
  gestionnaire:   { label: 'Gestionnaire',   color: 'bg-green-50 text-green-700 border-green-200' },
  magasinier:     { label: 'Magasinier',     color: 'bg-blue-50 text-blue-700 border-blue-200' },
  auditeur:       { label: 'Auditeur',       color: 'bg-purple-50 text-purple-700 border-purple-200' },
}

export default function RolesPermissionsPage() {
  const [permissions, setPermissions] = useState([])
  const [roles, setRoles] = useState([])
  const [activeRole, setActiveRole] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState(null)

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!notification) return
    const t = setTimeout(() => setNotification(null), 4000)
    return () => clearTimeout(t)
  }, [notification])

  async function load() {
    setLoading(true)
    try {
      const [perms, rs] = await Promise.all([listPermissions(), listRoles()])
      setPermissions(perms)
      setRoles(rs)
      const first = rs[0]
      setActiveRole(first?.id ?? null)
      setSelected(new Set(first?.permissions ?? []))
    } catch {
      setNotification({ type: 'error', message: 'Erreur lors du chargement des rôles.' })
    } finally { setLoading(false) }
  }

  // Permissions groupées par domaine (ordre stable).
  const groups = useMemo(() => {
    const map = new Map()
    for (const p of permissions) {
      if (!map.has(p.group)) map.set(p.group, [])
      map.get(p.group).push(p)
    }
    return [...map.entries()]
  }, [permissions])

  const current = roles.find(r => r.id === activeRole)
  const isAdmin = current?.name === 'administrateur'
  const dirty = useMemo(() => {
    if (!current) return false
    const orig = new Set(current.permissions)
    if (orig.size !== selected.size) return true
    for (const p of selected) if (!orig.has(p)) return true
    return false
  }, [current, selected])

  function pickRole(role) {
    setActiveRole(role.id)
    setSelected(new Set(role.permissions))
  }

  function toggle(name) {
    if (isAdmin) return
    setSelected(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  function toggleGroup(perms, allOn) {
    if (isAdmin) return
    setSelected(prev => {
      const next = new Set(prev)
      perms.forEach(p => allOn ? next.delete(p.name) : next.add(p.name))
      return next
    })
  }

  async function save() {
    if (!current || isAdmin) return
    setSaving(true)
    try {
      await updateRolePermissions(current.id, [...selected])
      setRoles(rs => rs.map(r => r.id === current.id ? { ...r, permissions: [...selected] } : r))
      setNotification({ type: 'success', message: `Permissions du rôle « ${ROLE_META[current.name]?.label || current.name} » enregistrées.` })
    } catch {
      setNotification({ type: 'error', message: 'Erreur lors de l’enregistrement.' })
    } finally { setSaving(false) }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
            <ShieldCheck size={18} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Rôles &amp; Permissions</h1>
            <p className="text-xs text-gray-400">Contrôlez ce que chaque rôle peut faire</p>
          </div>
        </div>
        <button onClick={save} className="btn-primary" disabled={!dirty || saving || isAdmin}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>

      {notification && (
        <div className={cn('mb-5 rounded-2xl border px-4 py-3 text-sm flex items-center gap-3',
          notification.type === 'success' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-amber-100 bg-amber-50 text-amber-700')}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {loading ? (
        <div className="card p-10 text-center text-gray-400">Chargement…</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Liste des rôles */}
          <div className="lg:col-span-1 space-y-2">
            {roles.map(role => {
              const meta = ROLE_META[role.name] || { label: role.name, color: 'bg-gray-50 text-gray-700 border-gray-200' }
              const active = role.id === activeRole
              return (
                <button
                  key={role.id}
                  onClick={() => pickRole(role)}
                  className={cn('w-full text-left p-4 rounded-xl border transition-all',
                    active ? 'border-primary-300 bg-primary-50/50 ring-2 ring-primary-100' : 'border-gray-100 bg-white hover:border-gray-200')}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn('badge border', meta.color)}>{meta.label}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Users size={12} /> {role.users_count}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{role.permissions.length} permission{role.permissions.length > 1 ? 's' : ''}</p>
                </button>
              )
            })}
          </div>

          {/* Matrice de permissions */}
          <div className="lg:col-span-3 card p-5">
            {isAdmin && (
              <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
                <ShieldCheck size={16} className="text-gray-500" />
                L’administrateur possède toujours toutes les permissions (non modifiable).
              </div>
            )}
            <div className="space-y-5">
              {groups.map(([group, perms]) => {
                const allOn = perms.every(p => selected.has(p.name) || isAdmin)
                return (
                  <div key={group}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{group}</h3>
                      {!isAdmin && (
                        <button onClick={() => toggleGroup(perms, allOn)}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                          {allOn ? 'Tout décocher' : 'Tout cocher'}
                        </button>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {perms.map(p => {
                        const on = isAdmin || selected.has(p.name)
                        return (
                          <button
                            key={p.name}
                            onClick={() => toggle(p.name)}
                            disabled={isAdmin}
                            className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all',
                              on ? 'border-primary-200 bg-primary-50/60' : 'border-gray-100 bg-white hover:border-gray-200',
                              isAdmin && 'cursor-not-allowed opacity-90')}
                          >
                            <span className={cn('w-5 h-5 rounded-md flex items-center justify-center shrink-0 border',
                              on ? 'bg-primary-600 border-primary-600' : 'border-gray-300 bg-white')}>
                              {on && <Check size={13} className="text-white" />}
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm text-gray-800 truncate">{p.label}</span>
                              <span className="block text-[11px] text-gray-400 font-mono truncate">{p.name}</span>
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
