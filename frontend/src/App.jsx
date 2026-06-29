import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'
import { useAuth } from './contexts/AuthContext'
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

function HomeRedirect() {
  const { roles } = useAuth()
  const dest = roles.includes('magasinier') ? '/stocks' : '/dashboard'
  return <Navigate to={dest} replace />
}

// AuthProvider est fourni par main.jsx (couche API existante de main).
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><HomeRedirect /></ProtectedRoute>} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard"   element={<ProtectedRoute roles={['administrateur','gestionnaire','auditeur']}><DashboardPage /></ProtectedRoute>} />
          <Route path="warehouses"  element={<ProtectedRoute roles={['administrateur','gestionnaire']}><WarehousesPage /></ProtectedRoute>} />
          <Route path="categories"  element={<ProtectedRoute roles={['administrateur','gestionnaire']}><CategoriesPage /></ProtectedRoute>} />
          <Route path="users"       element={<ProtectedRoute roles={['administrateur']}><UsersPage /></ProtectedRoute>} />
          <Route path="products"    element={<ProtectedRoute roles={['administrateur','gestionnaire']}><ProductsPage /></ProtectedRoute>} />
          <Route path="stocks"      element={<ProtectedRoute roles={['administrateur','gestionnaire','magasinier']}><StocksPage /></ProtectedRoute>} />
          <Route path="movements"   element={<ProtectedRoute roles={['administrateur','magasinier']}><MovementsPage /></ProtectedRoute>} />
          <Route path="transfers"   element={<ProtectedRoute roles={['administrateur','gestionnaire','magasinier']}><TransfersPage /></ProtectedRoute>} />
          <Route path="/transfers/:id" element={<ProtectedRoute roles={['administrateur','gestionnaire','magasinier']}><TransferDetailPage /></ProtectedRoute>} />
          <Route path="inventories" element={<ProtectedRoute roles={['administrateur','gestionnaire','magasinier']}><InventoriesPage /></ProtectedRoute>} />
          <Route path="/inventories/:id" element={<ProtectedRoute roles={['administrateur','gestionnaire','magasinier']}><InventoriesPage /></ProtectedRoute>} />
          <Route path="/inventories/:id/adjust" element={<ProtectedRoute roles={['administrateur','gestionnaire']}><InventoryAdjustPage /></ProtectedRoute>} />
          <Route path="/inventories/:id/session" element={<ProtectedRoute roles={['administrateur','gestionnaire','magasinier']}><InventorySessionPage /></ProtectedRoute>} />
          <Route path="reports"     element={<ProtectedRoute roles={['administrateur','gestionnaire','auditeur']}><ReportsPage /></ProtectedRoute>} />
          <Route path="activity"    element={<ProtectedRoute roles={['administrateur','auditeur']}><ActivityLogPage /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
