import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'
import AppLayout from './components/shared/AppLayout'
import LoginPage from './features/auth/LoginPage'
import DashboardPage from './features/dashboard/DashboardPage'
import WarehousesPage from './features/warehouses/WarehousesPage'
import CategoriesPage from './features/categories/CategoriesPage'
import UsersPage from './features/users/UsersPage'
import TransfersPage from './features/transfers/TransfersPage'
import TransferDetailPage from './features/transfers/TransferDetailPage'
import InventoriesPage from './features/inventories/InventoriesPage'
import InventoryAdjustPage from './features/inventories/InventoryAdjustPage'
import InventorySessionPage from './features/inventories/InventorySessionPage'
import ReportsPage from './features/reports/ReportsPage'
import ActivityLogPage from './features/activity/ActivityLogPage'
import ProductsPage from './features/products/ProductsPage'
import StocksPage from './features/stocks/StocksPage'
import MovementsPage from './features/movements/MovementsPage'

// AuthProvider est fourni par main.jsx (couche API existante de main).
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard"   element={<DashboardPage />} />
          <Route path="warehouses"  element={<WarehousesPage />} />
          <Route path="categories"  element={<CategoriesPage />} />
          <Route path="users"       element={<UsersPage />} />
          <Route path="products"    element={<ProductsPage />} />
          <Route path="stocks"      element={<StocksPage />} />
          <Route path="movements"   element={<MovementsPage />} />
          <Route path="transfers"   element={<TransfersPage />} />
          <Route path="/transfers/:id" element={<TransferDetailPage />} />
          <Route path="inventories" element={<InventoriesPage />} />
          <Route path="/inventories/:id" element={<InventoriesPage />} />
          <Route path="/inventories/:id/adjust" element={<InventoryAdjustPage />} />
          <Route path="/inventories/:id/session" element={<InventorySessionPage />} />
          <Route path="reports"     element={<ReportsPage />} />
          <Route path="activity"    element={<ActivityLogPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
