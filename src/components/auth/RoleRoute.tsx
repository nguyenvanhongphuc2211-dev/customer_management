import { useAuth } from '@/contexts/AuthContext';
import { getHomePath } from '@/features/auth/constants/roles';
import { CustomerManagementPage } from '@/features/customers/pages/CustomerManagementPage';
import type { UserRole } from '@/features/auth/types/auth.types';
import { Navigate } from 'react-router-dom';

export const RoleRoute = ({
  roles,
  children,
}: {
  roles: UserRole[];
  children: React.ReactNode;
}) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }

  return children;
};

export const RoleHomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'admin' || user.role === 'staff') {
    return <CustomerManagementPage />;
  }

  return <Navigate to={getHomePath(user.role)} replace />;
};
