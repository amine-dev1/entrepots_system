import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getInventory, recordCount, closeInventory } from '../../api/inventories.api'
import { ClipboardList, Save, CheckCircle, ArrowLeft } from 'lucide-react'
import { InventoryBadge } from '../../components/shared/Badges'

export default function InventorySessionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [inventory, setInventory] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [closing, setClosing] = useState(false)
  const [savingItem, setSavingItem] = useState(null) // ID of item currently saving

  useEffect(() => { loadInventory() }, [id])

  async function loadInventory() {
    try {
      const data = await getInventory(id)
      const inv = data.data || data
      setInventory(inv)
      // Initialiser le state local des lignes
      setItems(inv.items || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Met à jour la valeur localement avant sauvegarde
  function handleQuantityChange(itemId, value) {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, _tempQty: value } : item
    ))
  }

  async function saveItemCount(item) {
    if (item._tempQty === undefined || item._tempQty === '') return
    
    setSavingItem(item.id)
    try {
      const updatedItem = await recordCount(inventory.id, item.id, { qte_reelle: Number(item._tempQty) })
      // Mettre à jour l'item dans la liste avec la donnée serveur
      setItems(items.map(i => i.id === item.id ? { ...(updatedItem.data || updatedItem), _tempQty: undefined } : i))
    } catch (err) {
      alert("Erreur lors de la sauvegarde de la ligne.")
    } finally {
      setSavingItem(null)
    }
  }

  async function handleCloseInventory() {
    if (!window.confirm("Êtes-vous sûr de vouloir clôturer cette session ? Vous ne pourrez plus modifier les comptages.")) return
    
    setClosing(true)
    try {
      await closeInventory(inventory.id)
      navigate(`/inventories/${inventory.id}/adjust`)
    } catch (err) {
      alert("Erreur lors de la clôture.")
      setClosing(false)
    }
  }

  if (loading) return <div className="p-6 text-gray-500">Chargement de la session...</div>
  if (!inventory) return <div className="p-6 text-red-500">Inventaire introuvable.</div>

  const isClosed = inventory.statut !== 'en_cours'
  const progress = items.length ? Math.round((items.filter(i => i.qte_reelle !== null).length / items.length) * 100) : 0

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/inventories')} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600">
            <ArrowLeft size={18} />
          </button>
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <ClipboardList size={20} className="text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Saisie d'Inventaire</h1>
              <InventoryBadge status={inventory.statut} />
            </div>
            <p className="text-sm text-gray-500">{inventory.warehouse?.nom} — Type: <span className="capitalize">{inventory.type}</span></p>
          </div>
        </div>

        {!isClosed && (
          <button onClick={handleCloseInventory} disabled={closing} className="btn-primary bg-amber-500 hover:bg-amber-600 border-amber-600">
            <CheckCircle size={16} /> {closing ? 'Clôture...' : 'Clôturer la session'}
          </button>
        )}
      </div>

      {!isClosed && (
        <div className="mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">Progression du comptage</span>
              <span className="text-blue-600 font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <div className="text-xs text-gray-500 text-right w-32">
            {items.filter(i => i.qte_reelle !== null).length} / {items.length} lignes saisies
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-gray-600 font-medium">SKU</th>
                <th className="px-4 py-3 text-gray-600 font-medium">Produit</th>
                <th className="px-4 py-3 text-gray-600 font-medium text-center">Qté Théorique</th>
                <th className="px-4 py-3 text-gray-600 font-medium text-center w-48">Qté Comptée (Réelle)</th>
                <th className="px-4 py-3 text-gray-600 font-medium text-center">Écart Instantané</th>
                {!isClosed && <th className="px-4 py-3 text-gray-600 font-medium text-center w-24">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => {
                const isEdited = item._tempQty !== undefined
                const displayReelle = isEdited ? item._tempQty : (item.qte_reelle ?? '')
                
                // Calcul de l'écart dynamique
                const qteReelleNum = Number(displayReelle)
                const hasValue = displayReelle !== '' && displayReelle !== null
                const ecart = hasValue ? qteReelleNum - item.qte_theorique : null
                
                return (
                  <tr key={item.id} className={`hover:bg-gray-50 ${item.qte_reelle === null ? 'bg-yellow-50/30' : 'bg-white'}`}>
                    <td className="px-4 py-3 font-medium text-gray-600">{item.product?.sku}</td>
                    <td className="px-4 py-3 text-gray-900">{item.product?.nom}</td>
                    <td className="px-4 py-3 text-center text-gray-500 bg-gray-50/50">{item.qte_theorique}</td>
                    
                    <td className="px-4 py-3 text-center">
                      {isClosed ? (
                        <span className="font-bold">{item.qte_reelle ?? '—'}</span>
                      ) : (
                        <input 
                          type="number" min="0"
                          className={`input text-center py-1.5 ${isEdited ? 'border-amber-400 bg-amber-50' : ''}`}
                          value={displayReelle}
                          onChange={e => handleQuantityChange(item.id, e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && saveItemCount(item)}
                          placeholder="Saisir..."
                        />
                      )}
                    </td>

                    <td className="px-4 py-3 text-center font-bold">
                      {hasValue ? (
                        <span className={ecart > 0 ? 'text-green-600' : ecart < 0 ? 'text-red-600' : 'text-gray-400'}>
                          {ecart > 0 ? '+' : ''}{ecart}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>

                    {!isClosed && (
                      <td className="px-4 py-3 text-center">
                        {isEdited ? (
                          <button 
                            onClick={() => saveItemCount(item)}
                            disabled={savingItem === item.id}
                            className="btn-primary py-1 px-2 text-xs w-full justify-center"
                          >
                            {savingItem === item.id ? '...' : <><Save size={12} className="mr-1"/> OK</>}
                          </button>
                        ) : item.qte_reelle !== null ? (
                          <span className="text-green-600 flex justify-center"><CheckCircle size={16} /></span>
                        ) : null}
                      </td>
                    )}
                  </tr>
                )
              })}
              {items.length === 0 && (
                <tr><td colSpan="6" className="p-6 text-center text-gray-400">Aucune ligne dans cet inventaire.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}