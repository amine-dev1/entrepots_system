import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import AppLayout from './components/shared/AppLayout'
import LoginPage from './features/auth/LoginPage'
import DashboardPage from './features/dashboard/DashboardPage'
import WarehousesPage from './features/warehouses/WarehousesPage'
import CategoriesPage from './features/categories/CategoriesPage'
import UsersPage from './features/users/UsersPage'
import {
  ProductsPage, StocksPage, MovementsPage,
  TransfersPage, InventoriesPage, ReportsPage, ActivityPage
} from './features/placeholders'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard"    element={<DashboardPage />} />
            <Route path="warehouses"   element={<WarehousesPage />} />
            <Route path="categories"   element={<CategoriesPage />} />
            <Route path="users"        element={<UsersPage />} />
            <Route path="products"     element={<ProductsPage />} />
            <Route path="stocks"       element={<StocksPage />} />
            <Route path="movements"    element={<MovementsPage />} />
            <Route path="transfers"    element={<TransfersPage />} />
            <Route path="inventories"  element={<InventoriesPage />} />
            <Route path="reports"      element={<ReportsPage />} />
            <Route path="activity"     element={<ActivityPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
