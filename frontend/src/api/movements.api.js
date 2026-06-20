import client from './client'

// The nine movement types (matches App\Enums\MovementType on the backend).
export const MOVEMENT_TYPES = [
  { value: 'achat', label: 'Achat', sens: 'entree' },
  { value: 'retour_fournisseur', label: 'Retour fournisseur', sens: 'entree' },
  { value: 'ajustement_entree', label: 'Ajustement (entrée)', sens: 'entree' },
  { value: 'transfert_entree', label: 'Transfert (entrée)', sens: 'entree' },
  { value: 'vente', label: 'Vente', sens: 'sortie' },
  { value: 'consommation', label: 'Consommation', sens: 'sortie' },
  { value: 'perte', label: 'Perte', sens: 'sortie' },
  { value: 'ajustement_sortie', label: 'Ajustement (sortie)', sens: 'sortie' },
  { value: 'transfert_sortie', label: 'Transfert (sortie)', sens: 'sortie' },
]

export function isSortie(type) {
  return MOVEMENT_TYPES.find((t) => t.value === type)?.sens === 'sortie'
}

export async function listMovements(params = {}) {
  const { data } = await client.get('/movements', { params })
  return data
}

export async function createMovement(payload) {
  const { data } = await client.post('/movements', payload)
  return data
}
