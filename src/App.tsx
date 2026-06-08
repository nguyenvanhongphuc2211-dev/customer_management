import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { AnalyticsPage } from '@/features/customers/pages/AnalyticsPage';
import { CustomerDetailPage } from '@/features/customers/pages/CustomerDetailPage';
import { CustomerManagementPage } from '@/features/customers/pages/CustomerManagementPage';
import { SettingsPage } from '@/features/customers/pages/SettingsPage';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
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
              <Route index element={<CustomerManagementPage />} />
              <Route path="customers/:id" element={<CustomerDetailPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
