import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getInventory, adjustInventory } from '../../api/inventories.api'
import { ArrowLeft, CheckSquare, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { InventoryBadge } from '../../components/shared/Badges'
import DataTable from '../../components/shared/DataTable'

export default function InventoryAdjustPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [inventory, setInventory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [adjusting, setAdjusting] = useState(false)

  useEffect(() => { loadInventory() }, [id])

  async function loadInventory() {
    try {
      const data = await getInventory(id)
      setInventory(data.data || data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAdjust() {
    if (!window.confirm("Attention : Cette action va générer les mouvements de stock d'ajustement. Confirmer ?")) return
    
    setAdjusting(true)
    try {
      const data = await adjustInventory(inventory.id)
      setInventory(data.data || data)
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'ajustement.")
    } finally {
      setAdjusting(false)
    }
  }

  if (loading) return <div className="p-6 text-gray-500">Chargement...</div>
  if (!inventory) return <div className="p-6 text-red-500">Inventaire introuvable.</div>

  const items = inventory.items || []
  const itemsWithEcart = items.filter(i => i.ecart !== 0)
  
  // Statistiques pour le résumé
  const totalEcartPositif = itemsWithEcart.filter(i => i.ecart > 0).length
  const totalEcartNegatif = itemsWithEcart.filter(i => i.ecart < 0).length

  const columns = [
    { header: 'SKU', accessor: 'product.sku', render: r => <span className="text-gray-500">{r.product?.sku}</span> },
    { header: 'Produit', accessor: 'product.nom', render: r => <span className="font-medium text-gray-900">{r.product?.nom}</span> },
    { header: 'Qté Théorique', accessor: 'qte_theorique', render: r => <span className="text-gray-500">{r.qte_theorique}</span> },
    { header: 'Qté Réelle', accessor: 'qte_reelle', render: r => <span className="font-bold">{r.qte_reelle ?? 'Non compté'}</span> },
    { 
      header: 'Écart Constaté', 
      accessor: 'ecart', 
      render: r => {
        if (r.ecart === 0) return <span className="text-gray-400">0</span>
        return (
          <span className={`font-bold flex items-center gap-1 ${r.ecart > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {r.ecart > 0 ? '+' : ''}{r.ecart}
          </span>
        )
      }
    },
  ]

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/inventories')} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Validation & Ajustement</h1>
              <InventoryBadge status={inventory.statut} />
            </div>
            <p className="text-sm text-gray-500">{inventory.warehouse?.nom}</p>
          </div>
        </div>

        {inventory.statut === 'cloture' && (
          <button onClick={handleAdjust} disabled={adjusting} className="btn-primary bg-green-600 hover:bg-green-700 border-green-600">
            <CheckSquare size={16} /> {adjusting ? 'Validation...' : 'Valider les ajustements de stock'}
          </button>
        )}
      </div>

      {inventory.statut === 'cloture' && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-sm font-bold text-amber-800">Prêt pour l'ajustement</h3>
            <p className="text-sm text-amber-700 mt-1">
              La validation va générer les mouvements de stock "ajustement_entree" et "ajustement_sortie" pour corriger les écarts constatés ci-dessous. Cette action est irréversible.
            </p>
          </div>
        </div>
      )}

      {inventory.statut === 'ajuste' && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="text-green-600 shrink-0" size={20} />
          <p className="text-sm text-green-800 font-medium">Cet inventaire a été validé. Les stocks ont été mis à jour.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4 flex items-center justify-between">
          <div><p className="text-xs text-gray-500 uppercase font-bold">Total Lignes</p><p className="text-xl font-bold mt-1">{items.length}</p></div>
        </div>
        <div className="card p-4 flex items-center justify-between border-b-4 border-green-500">
          <div><p className="text-xs text-gray-500 uppercase font-bold">Écarts Positifs (+)</p><p className="text-xl font-bold mt-1 text-green-600">{totalEcartPositif}</p></div>
        </div>
        <div className="card p-4 flex items-center justify-between border-b-4 border-red-500">
          <div><p className="text-xs text-gray-500 uppercase font-bold">Écarts Négatifs (-)</p><p className="text-xl font-bold mt-1 text-red-600">{totalEcartNegatif}</p></div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Lignes d'inventaire</h3>
        {/* On peut passer false à searchable si le tableau DataTable gère un mode simple */}
        <DataTable columns={columns} data={items} searchable={true} emptyText="Aucune ligne" />
      </div>
    </div>
  )
}