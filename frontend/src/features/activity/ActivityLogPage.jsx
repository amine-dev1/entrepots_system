import { useEffect, useState } from 'react'
import { Activity, Search, Filter, Calendar, User, Plus, Edit, Trash, LogIn, CheckCircle } from 'lucide-react'
import { listActivityLogs } from '../../api/activity.api'
import { listUsers } from '../../api/users.api' // Supposant que vous avez cette route pour les filtres
import { formatDate } from '../../lib/utils' // Assurez-vous que cette fonction gère l'heure (ex: DD/MM/YYYY HH:mm)
import Select from '../../components/shared/Select'
import DateInput from '../../components/shared/DateInput'

// Dictionnaire pour styliser les différents types d'actions dans la timeline
const ACTION_STYLES = {
  creation:     { icon: Plus,        color: 'text-green-600', bg: 'bg-green-100', dot: 'bg-green-500' },
  modification: { icon: Edit,        color: 'text-blue-600',  bg: 'bg-blue-100',  dot: 'bg-blue-500' },
  suppression:  { icon: Trash,       color: 'text-red-600',   bg: 'bg-red-100',   dot: 'bg-red-500' },
  connexion:    { icon: LogIn,       color: 'text-gray-600',  bg: 'bg-gray-100',  dot: 'bg-gray-500' },
  validation:   { icon: CheckCircle, color: 'text-amber-600', bg: 'bg-amber-100', dot: 'bg-amber-500' },
  default:      { icon: Activity,    color: 'text-primary-600', bg: 'bg-primary-100', dot: 'bg-primary-500' }
}

const ACTION_TYPES = [
  { value: 'creation', label: 'Création' },
  { value: 'modification', label: 'Modification' },
  { value: 'suppression', label: 'Suppression' },
  { value: 'connexion', label: 'Connexion' },
  { value: 'validation', label: 'Validation / Clôture' },
]

export default function ActivityLogPage() {
  const [logs, setLogs] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState({
    action: '',
    user_id: '',
    date_debut: '',
    date_fin: '',
    search: ''
  })

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    loadLogs()
    console.log( loadLogs())
  }, [filters.action, filters.user_id, filters.date_debut, filters.date_fin]) 

  async function loadUsers() {
    try {
      const data = await listUsers()
      setUsers(Array.isArray(data) ? data : data.data ?? [])
    } catch { setUsers([]) }
  }

  async function loadLogs() {
    setLoading(true)
    try {
      const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      const data = await listActivityLogs(cleanFilters)
      setLogs(Array.isArray(data) ? data : data.data ?? [])
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  // Filtrage local supplémentaire pour la recherche textuelle
  const filteredLogs = logs.filter(log => {
    if (!filters.search) return true
    const q = filters.search.toLowerCase()
    return log.description?.toLowerCase().includes(q) || 
           log.user?.nom?.toLowerCase().includes(q) ||
           log.user?.prenom?.toLowerCase().includes(q)
  })

  return (
    <div className="p-6 max-w-8xl mx-auto">
      
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
            <Activity size={20} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Journal d'activité</h1>
            <p className="text-sm text-gray-500">Trace d'audit et historique des événements</p>
          </div>
        </div>
      </div>

      {/* Barre de filtres */}
      <div className="card p-4 mb-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
          <Filter size={16} /> Filtres
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="input pl-9 w-full"
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <Select
            icon={User}
            value={filters.user_id}
            onChange={val => setFilters({ ...filters, user_id: val })}
            options={users.map(u => ({ value: u.id, label: `${u.prenom} ${u.nom}` }))}
            placeholder="Tous les utilisateurs"
          />

          <Select
            icon={Activity}
            value={filters.action}
            onChange={val => setFilters({ ...filters, action: val })}
            options={ACTION_TYPES}
            placeholder="Toutes les actions"
          />

          <div className="flex gap-2">
            <DateInput
              value={filters.date_debut}
              onChange={val => setFilters({ ...filters, date_debut: val })}
              title="Date de début"
            />
            <DateInput
              value={filters.date_fin}
              onChange={val => setFilters({ ...filters, date_fin: val })}
              title="Date de fin"
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card p-6">
        {loading ? (
          <div className="flex justify-center p-8 text-gray-400">Chargement de l'historique...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center p-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3 text-gray-400">
              <Activity size={24} />
            </div>
            <h3 className="text-sm font-medium text-gray-900">Aucun événement trouvé</h3>
            <p className="text-xs text-gray-500 mt-1">Essayez de modifier vos critères de recherche.</p>
          </div>
        ) : (
          <div className="relative border-l border-gray-200 ml-3 md:ml-4 space-y-8 py-2">
            {filteredLogs.map((log) => {
              // Récupération du style selon l'action
              const style = ACTION_STYLES[log.action] || ACTION_STYLES.default
              const Icon = style.icon

              return (
                <div key={log.id} className="relative pl-8 md:pl-10 group">
                  {/* Point sur la timeline */}
                  <span className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full ${style.dot} ring-4 ring-white group-hover:scale-125 transition-transform`} />
                  
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {/* Badge Icône Action */}
                        <div className={`p-1 rounded ${style.bg} ${style.color}`}>
                          <Icon size={14} />
                        </div>
                        {/* Auteur */}
                        <span className="font-semibold text-sm text-gray-900">
                          {log.user ? `${log.user.prenom} ${log.user.nom}` : 'Système'}
                        </span>
                        <span className="text-gray-400 text-sm hidden sm:inline">•</span>
                        {/* Titre/Action brute (Optionnel) */}
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {log.action}
                        </span>
                      </div>
                      
                      {/* Description / Message */}
                      <p className="text-sm text-gray-700 mt-1">
                        {log.description}
                      </p>

                      {/* Données techniques (Optionnel: IP, Cible, etc.) */}
                      {log.target_type && (
                        <div className="mt-2 text-xs text-gray-400 font-mono bg-gray-50 inline-block px-2 py-1 rounded border border-gray-100">
                          Cible : {log.target_type} #{log.target_id}
                        </div>
                      )}
                    </div>

                    {/* Date et Heure */}
                    <div className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap sm:mt-1">
                      <Calendar size={12} />
                      {formatDate(log.created_at)} {/* Idéalement avec l'heure : 12/03/2026 à 14:30 */}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}