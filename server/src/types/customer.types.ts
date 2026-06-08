export type CustomerStatus = 'active' | 'inactive' | 'potential' | 'vip';

export interface CustomerGroup {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRecord {
  id: string;
  code: string;
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  status: CustomerStatus;
  groupId: string;
  totalTransactions: number;
  totalRevenue: number;
  lastContactAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer extends Omit<CustomerRecord, 'groupId'> {
  group: CustomerGroup;
}

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomerStatus;
  groupId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateCustomerDto {
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  status: CustomerStatus;
  groupId: string;
  lastContactAt?: string;
}

export type UpdateCustomerDto = Partial<CreateCustomerDto>;

export interface CreateCustomerGroupDto {
  name: string;
  description?: string;
  color: string;
}

export type UpdateCustomerGroupDto = Partial<CreateCustomerGroupDto>;

export interface CustomerGroupWithCount extends CustomerGroup {
  customerCount: number;
}

export interface BulkActionDto {
  action: 'delete' | 'updateStatus' | 'updateGroup';
  ids: string[];
  status?: CustomerStatus;
  groupId?: string;
}

export interface AnalyticsData {
  totalCustomers: number;
  activeCustomers: number;
  vipCustomers: number;
  totalRevenue: number;
  newCustomersLast30Days: number;
  byStatus: Record<CustomerStatus, number>;
  byGroup: { groupId: string; name: string; color: string; count: number; revenue: number }[];
  revenueByMonth: { month: string; revenue: number; count: number }[];
}
