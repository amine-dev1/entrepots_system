import React from 'react'
import { Package, BarChart3, TrendingUp, ArrowLeftRight, ClipboardList, FileText, Activity } from 'lucide-react'

function PlaceholderPage({ icon: Icon, title, desc, owner }) {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-96 text-center">
      <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={28} className="text-primary-400" />
      </div>
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500 mt-1 max-w-xs">{desc}</p>
      <span className="mt-4 badge bg-gray-100 text-gray-500">Développé par {owner}</span>
    </div>
  )
}

export { default as ProductsPage } from './products/ProductsPage'

// Placeholder exports for other pages remain unchanged
export function StocksPage() {
  return <PlaceholderPage icon={BarChart3} title="Stocks & Alertes" desc="Vue stock filtrée par entrepôt/produit." owner="" />
}
export function MovementsPage() {
  return <PlaceholderPage icon={TrendingUp} title="Mouvements de stock" desc="Historique et création de mouvements." owner="" />
}
export function TransfersPage() {
  return <PlaceholderPage icon={ArrowLeftRight} title="Transferts" desc="Wizard multi-étapes, cycle complet de transfert." owner="Youssef" />
}
export function InventoriesPage() {
  return <PlaceholderPage icon={ClipboardList} title="Inventaires" desc="Sessions de comptage, écarts et ajustements." owner="Youssef" />
}
export function ReportsPage() {
  return <PlaceholderPage icon={FileText} title="Rapports" desc="Export PDF / Excel par type de rapport." owner="Youssef" />
}
export function ActivityPage() {
  return <PlaceholderPage icon={Activity} title="Journal d'activité" desc="Timeline filtrée des actions." owner="Youssef" />
}
