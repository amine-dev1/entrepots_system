import React from 'react'
import { cn } from '../../lib/utils'

export function StockBadge({ disponible, seuil = 0 }) {
  const v = Number(disponible ?? 0)
  const s = Number(seuil ?? 0)

  let cls, label
  if (v === 0) {
    cls = 'bg-red-100 text-red-700 border border-red-200'
    label = 'Rupture'
  } else if (v <= s) {
    cls = 'bg-orange-100 text-orange-700 border border-orange-200'
    label = `${v} — Alerte`
  } else {
    cls = 'bg-green-100 text-green-700 border border-green-200'
    label = String(v)
  }

  return (
    <span className={cn('badge font-semibold tabular-nums', cls)}>
      {label}
    </span>
  )
}

const STATUS_MAP = {
  brouillon:  { cls: 'bg-gray-100 text-gray-600',   label: 'Brouillon' },
  en_attente: { cls: 'bg-yellow-100 text-yellow-700', label: 'En attente' },
  valide:     { cls: 'bg-blue-100 text-blue-700',    label: 'Validé' },
  recu:       { cls: 'bg-green-100 text-green-700',  label: 'Reçu' },
  annule:     { cls: 'bg-red-100 text-red-600',      label: 'Annulé' },
  en_cours:   { cls: 'bg-blue-100 text-blue-700',    label: 'En cours' },
  cloture:    { cls: 'bg-gray-100 text-gray-600',    label: 'Clôturé' },
  ajuste:     { cls: 'bg-green-100 text-green-700',  label: 'Ajusté' },
  actif:      { cls: 'bg-green-100 text-green-700',  label: 'Actif' },
  inactif:    { cls: 'bg-gray-100 text-gray-500',    label: 'Inactif' },
}

export function StatusBadge({ status }) {
  const { cls, label } = STATUS_MAP[status] || { cls: 'bg-gray-100 text-gray-600', label: status }
  return <span className={cn('badge', cls)}>{label}</span>
}




const TRANSFERS_STATUS_MAP = {
  brouillon:  { cls: 'bg-gray-100 text-gray-600',     label: 'Brouillon' },
  en_attente: { cls: 'bg-yellow-100 text-yellow-700', label: 'En attente' },
  valide:     { cls: 'bg-blue-100 text-blue-700',     label: 'Validé' },
  recu:       { cls: 'bg-green-100 text-green-700',   label: 'Reçu' },
  annule:     { cls: 'bg-red-100 text-red-600',       label: 'Annulé' },
}

export function TransfersBadge({ status }) {
  const { cls, label } = TRANSFERS_STATUS_MAP[status] || { cls: 'bg-gray-100 text-gray-600', label: status }
  
  return (
    <span className={cn('badge font-medium px-2.5 py-0.5 rounded-full', cls)}>
      {label}
    </span>
  )
}



export function InventoryBadge({ status }) {
  const styles = {
    en_cours: 'bg-blue-100 text-blue-800',
    cloture:  'bg-amber-100 text-amber-800',
    ajuste:   'bg-green-100 text-green-800',
  }
  const labels = {
    en_cours: 'En cours',
    cloture:  'Clôturé',
    ajuste:   'Ajusté',
  }
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  )
}