import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard, Warehouse, Tag, Package, BarChart3,
  ArrowLeftRight, ClipboardList, FileText, Activity,
  Users, ChevronLeft, ChevronRight, TrendingUp
} from 'lucide-react'
import { cn } from '../../lib/utils'

// Visibility rules aligned with backend permissions (RolePermissionSeeder + api.php).
// `roles`: shown if user has one of these roles (empty = all roles).
// `permissions`: shown if user has one of these permissions (checked via `can()`).
const navItems = [
  { to: '/dashboard',   label: 'Tableau de bord', icon: LayoutDashboard,  permissions: ['view-dashboard'] },
  { to: '/warehouses',  label: 'Entrepôts',        icon: Warehouse,       roles: ['administrateur', 'gestionnaire'] },
  { to: '/categories',  label: 'Catégories',       icon: Tag,             roles: ['administrateur', 'gestionnaire'] },
  { to: '/users',       label: 'Utilisateurs',     icon: Users,           roles: ['administrateur'] },
  { to: '/products',    label: 'Produits',         icon: Package,          roles: ['administrateur', 'gestionnaire'] },
  { to: '/stocks',      label: 'Stocks',           icon: BarChart3,       roles: ['administrateur', 'gestionnaire', 'magasinier'] },
  { to: '/movements',   label: 'Mouvements',       icon: TrendingUp,      roles: ['administrateur', 'magasinier'] },
  { to: '/transfers',   label: 'Transferts',       icon: ArrowLeftRight,  roles: ['administrateur', 'gestionnaire', 'magasinier'] },
  { to: '/inventories', label: 'Inventaires',      icon: ClipboardList,   roles: ['administrateur', 'gestionnaire', 'magasinier'] },
  { to: '/reports',     label: 'Rapports',         icon: FileText,        permissions: ['view-reports'] },
  { to: '/activity',    label: 'Journal',          icon: Activity,        permissions: ['view-activity'] },
]

export default function Sidebar() {
  const { roles, can } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const visible = navItems.filter(item => {
    if (item.permissions) return item.permissions.some(p => can(p))
    if (item.roles && item.roles.length > 0) return item.roles.some(r => roles.includes(r))
    return true
  })

  return (
    <aside className={cn(
      'relative flex flex-col bg-white border-r border-gray-100 transition-all duration-300 h-full',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-gray-100',
        collapsed && 'justify-center px-0'
      )}>
        <div className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">SF</span>
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">StockFlow</p>
            <p className="text-xs text-gray-400">Gestion de stock</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {visible.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
              isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              collapsed && 'justify-center px-0'
            )}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse btn */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors shadow-sm"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  )
}
