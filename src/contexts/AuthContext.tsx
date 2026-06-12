import { authService } from '@/features/auth/services';
import {
  canEditCustomers,
  canManageInvoices,
  canManageMenu,
  canManageTables,
  canMarkKitchenDone,
  canViewAnalytics,
  canViewBillingTables,
  canViewCustomers,
  canViewFloorPlan,
  canViewKitchenQueue,
  canViewMenu,
  canViewTrash,
  ROLE_LABELS,
} from '@/features/auth/constants/roles';
import type { AuthUser, LoginDto, UserRole } from '@/features/auth/types/auth.types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface AuthPermissions {
  canEdit: boolean;
  canManageTables: boolean;
  canMarkKitchenDone: boolean;
  canManageInvoices: boolean;
  canManageMenu: boolean;
  canViewMenu: boolean;
  canViewKitchenQueue: boolean;
  canViewBillingTables: boolean;
  canViewCustomers: boolean;
  canViewFloorPlan: boolean;
  canViewAnalytics: boolean;
  canViewTrash: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  canEdit: boolean;
  permissions: AuthPermissions;
  roleLabel: string;
  login: (dto: LoginDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'auth_token';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const login = useCallback(async (dto: LoginDto) => {
    const { token, user: authUser } = await authService.login(dto);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(authUser);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    authService
      .getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo(() => {
    const role = user?.role as UserRole | undefined;
    const permissions: AuthPermissions = {
      canEdit: canEditCustomers(role ?? 'staff'),
      canManageTables: canManageTables(role ?? 'staff'),
      canMarkKitchenDone: canMarkKitchenDone(role ?? 'staff'),
      canManageInvoices: canManageInvoices(role ?? 'staff'),
      canManageMenu: canManageMenu(role ?? 'staff'),
      canViewMenu: canViewMenu(role ?? 'staff'),
      canViewKitchenQueue: canViewKitchenQueue(role ?? 'staff'),
      canViewBillingTables: canViewBillingTables(role ?? 'staff'),
      canViewCustomers: canViewCustomers(role ?? 'staff'),
      canViewFloorPlan: canViewFloorPlan(role ?? 'staff'),
      canViewAnalytics: canViewAnalytics(role ?? 'staff'),
      canViewTrash: canViewTrash(role ?? 'staff'),
    };

    return {
      user,
      isLoading,
      canEdit: permissions.canEdit,
      permissions,
      roleLabel: role ? ROLE_LABELS[role] : '',
      login,
      logout,
    };
  }, [user, isLoading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
