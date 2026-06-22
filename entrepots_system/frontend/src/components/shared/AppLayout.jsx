import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../../contexts/AuthContext'
import { Bell, LogOut, User, ChevronDown } from 'lucide-react'

export default function AppLayout() {
  const { user, logout, roles } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const roleLabel = roles[0] || 'Utilisateur'

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
          <div />
          <div className="flex items-center gap-3">
            {/* Bell */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
              <Bell size={18} />
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 text-xs font-semibold">
                    {user?.prenom?.[0]}{user?.nom?.[0]}
                  </span>
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 leading-tight">
                    {user?.prenom} {user?.nom}
                  </p>
                  <p className="text-xs text-gray-400 leading-tight">{roleLabel}</p>
                </div>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl border border-gray-100 shadow-lg z-20 py-1">
                    <div className="px-4 py-2.5 border-b border-gray-50">
                      <p className="text-sm font-medium text-gray-900">{user?.prenom} {user?.nom}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={14} />
                      Déconnexion
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
