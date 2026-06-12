import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RoleHomeRedirect, RoleRoute } from '@/components/auth/RoleRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { AnalyticsPage } from '@/features/customers/pages/AnalyticsPage';
import { CustomerDetailPage } from '@/features/customers/pages/CustomerDetailPage';
import { SettingsPage } from '@/features/customers/pages/SettingsPage';
import { TrashPage } from '@/features/customers/pages/TrashPage';
import { CashierPage } from '@/features/invoices/pages/CashierPage';
import { KitchenQueuePage } from '@/features/kitchen/pages/KitchenQueuePage';
import { MenuPage } from '@/features/menu/pages/MenuPage';
import { FloorPlanPage } from '@/features/tables/pages/FloorPlanPage';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<RoleHomeRedirect />} />
                <Route
                  path="customers/:id"
                  element={
                    <RoleRoute roles={['admin', 'staff']}>
                      <CustomerDetailPage />
                    </RoleRoute>
                  }
                />
                <Route
                  path="trash"
                  element={
                    <RoleRoute roles={['admin', 'staff']}>
                      <TrashPage />
                    </RoleRoute>
                  }
                />
                <Route
                  path="tables"
                  element={
                    <RoleRoute roles={['admin', 'staff']}>
                      <FloorPlanPage />
                    </RoleRoute>
                  }
                />
                <Route
                  path="kitchen"
                  element={
                    <RoleRoute roles={['admin', 'staff', 'kitchen', 'head_chef']}>
                      <KitchenQueuePage />
                    </RoleRoute>
                  }
                />
                <Route
                  path="menu"
                  element={
                    <RoleRoute roles={['admin', 'staff', 'cashier', 'kitchen', 'head_chef']}>
                      <MenuPage />
                    </RoleRoute>
                  }
                />
                <Route
                  path="cashier"
                  element={
                    <RoleRoute roles={['admin', 'cashier']}>
                      <CashierPage />
                    </RoleRoute>
                  }
                />
                <Route
                  path="analytics"
                  element={
                    <RoleRoute roles={['admin', 'staff']}>
                      <AnalyticsPage />
                    </RoleRoute>
                  }
                />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
