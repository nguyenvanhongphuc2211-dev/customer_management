import type { UserRole } from '../types/auth.types';

export const ALL_ROLES: UserRole[] = ['admin', 'staff', 'cashier', 'kitchen', 'head_chef'];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Quản trị viên',
  staff: 'Nhân viên phục vụ',
  cashier: 'Thu ngân',
  kitchen: 'Nhân viên bếp',
  head_chef: 'Bếp trưởng',
};

export const getHomePath = (role: UserRole): string => {
  switch (role) {
    case 'cashier':
      return '/cashier';
    case 'kitchen':
    case 'head_chef':
      return '/kitchen';
    default:
      return '/';
  }
};

export const canEditCustomers = (role: UserRole): boolean => role === 'admin';

export const canManageTables = (role: UserRole): boolean =>
  role === 'admin' || role === 'staff';

export const canViewKitchenQueue = (role: UserRole): boolean =>
  role === 'admin' || role === 'staff' || role === 'kitchen' || role === 'head_chef';

export const canMarkKitchenDone = (role: UserRole): boolean =>
  role === 'admin' || role === 'staff' || role === 'head_chef';

export const canManageInvoices = (role: UserRole): boolean =>
  role === 'admin' || role === 'cashier';

export const canManageMenu = (role: UserRole): boolean =>
  role === 'admin' || role === 'head_chef';

export const canViewMenu = (role: UserRole): boolean =>
  role === 'admin' ||
  role === 'staff' ||
  role === 'cashier' ||
  role === 'kitchen' ||
  role === 'head_chef';

export const canViewBillingTables = (role: UserRole): boolean =>
  role === 'admin' || role === 'staff' || role === 'cashier';

export const canViewCustomers = (role: UserRole): boolean =>
  role === 'admin' || role === 'staff';

export const canViewAnalytics = (role: UserRole): boolean =>
  role === 'admin' || role === 'staff';

export const canViewTrash = (role: UserRole): boolean =>
  role === 'admin' || role === 'staff';

export const canViewFloorPlan = (role: UserRole): boolean =>
  role === 'admin' || role === 'staff';
