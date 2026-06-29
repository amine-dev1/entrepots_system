import { useEffect, useState } from 'react'
import { downloadReport } from '../../api/reports.api'
import { listWarehouses } from '../../api/warehouses.api'
import { 
  FileText, Download, FileSpreadsheet, 
  Package, History, ClipboardList, BarChart3 
} from 'lucide-react'

const REPORT_TYPES = [
  { 
    id: 'stocks', 
    label: 'État des stocks', 
    desc: 'Vision globale du stock actuel par produit et entrepôt.',
    icon: Package 
  },
  { 
    id: 'mouvements', 
    label: 'Historique des mouvements', 
    desc: 'Traçabilité complète des entrées, sorties et transferts.',
    icon: History 
  },
  { 
    id: 'inventaire', 
    label: 'Sessions d\'inventaire', 
    desc: 'Bilan des comptages et mise en évidence des écarts.',
    icon: ClipboardList 
  }
]

const FORMATS = [
  { 
    id: 'pdf', 
    label: 'Document PDF', 
    icon: FileText, 
    colorClass: 'text-red-500', 
    activeBorder: 'border-red-500 ring-1 ring-red-500' 
  },
  { 
    id: 'xlsx', 
    label: 'Tableur Excel', 
    icon: FileSpreadsheet, 
    colorClass: 'text-green-600', 
    activeBorder: 'border-green-500 ring-1 ring-green-500' 
  }
]

export default function ReportsPage() {
  const [warehouses, setWarehouses] = useState([])
  
  // Paramètres du rapport
  const [type, setType] = useState('stocks')
  const [format, setFormat] = useState('pdf')
  const [filters, setFilters] = useState({
    warehouse_id: '',
    date_debut: '',
    date_fin: ''
  })
  
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadWarehouses()
  }, [])

  async function loadWarehouses() {
    try {
      const data = await listWarehouses()
      setWarehouses(Array.isArray(data) ? data : data.data ?? [])
    } catch (err) {
      console.error("Impossible de charger les entrepôts", err)
    }
  }

  async function handleDownload() {
    setError(null)
    setDownloading(true)
    
    try {
      // Nettoyer les filtres vides
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      )

      // Appel API qui retourne un Blob
      const blob = await downloadReport(type, format, cleanFilters)
      
      // Création de l'URL objet pour forcer le téléchargement côté client
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      
      // Génération du nom de fichier (ex: rapport-stocks-20260101.pdf)
      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '')
      link.setAttribute('download', `rapport-${type}-${dateStr}.${format}`)
      
      document.body.appendChild(link)
      link.click()
      
      // Nettoyage
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
      
    } catch (err) {
      console.error(err)
      setError("Une erreur est survenue lors de la génération du rapport. Vérifiez vos critères.")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="p-6 max-w-8xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
          <BarChart3 size={20} className="text-primary-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Rapports & Exports</h1>
          <p className="text-sm text-gray-500">Générez des états au format PDF ou Excel</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Colonne de gauche : Configuration */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Étape 1 : Type de rapport */}
          <div className="card p-5">
            <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs">1</span>
              Type de données
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {REPORT_TYPES.map(rt => {
                const isSelected = type === rt.id
                const Icon = rt.icon
                return (
                  <button
                    key={rt.id}
                    onClick={() => setType(rt.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected 
                        ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' 
                        : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={24} className={`mb-3 ${isSelected ? 'text-primary-600' : 'text-gray-400'}`} />
                    <h3 className={`font-semibold text-sm ${isSelected ? 'text-primary-900' : 'text-gray-700'}`}>
                      {rt.label}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{rt.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Étape 2 : Filtres optionnels */}
          <div className="card p-5">
            <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs">2</span>
              Filtres (Optionnel)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-1 md:col-span-3">
                <label className="label">Restreindre à un entrepôt</label>
                <select 
                  className="input" 
                  value={filters.warehouse_id}
                  onChange={e => setFilters({...filters, warehouse_id: e.target.value})}
                >
                  <option value="">Tous les entrepôts</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.nom}</option>)}
                </select>
              </div>

              {(type === 'mouvements' || type === 'inventaire') && (
                <>
                  <div>
                    <label className="label">Date de début</label>
                    <input 
                      type="date" 
                      className="input" 
                      value={filters.date_debut}
                      onChange={e => setFilters({...filters, date_debut: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="label">Date de fin</label>
                    <input 
                      type="date" 
                      className="input" 
                      value={filters.date_fin}
                      onChange={e => setFilters({...filters, date_fin: e.target.value})}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Colonne de droite : Format & Action */}
        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs">3</span>
              Format de sortie
            </h2>
            <div className="space-y-3">
              {FORMATS.map(f => {
                const isSelected = format === f.id
                const Icon = f.icon
                return (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                      isSelected ? f.activeBorder : 'border-gray-100 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-md bg-white shadow-sm border border-gray-100 ${f.colorClass}`}>
                      <Icon size={18} />
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                      {f.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Bouton de génération */}
          <div className="card p-5 bg-gray-50 border-gray-200 border border-dashed flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
              <Download className="text-primary-600" size={24} />
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">Prêt à générer</h3>
            <p className="text-xs text-gray-500 mb-5">
              Le document sera téléchargé directement sur votre appareil.
            </p>
            <button 
              onClick={handleDownload} 
              disabled={downloading}
              className="btn-primary w-full py-3 justify-center text-sm"
            >
              {downloading ? (
                'Génération en cours...'
              ) : (
                <>Télécharger le {format.toUpperCase()}</>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}