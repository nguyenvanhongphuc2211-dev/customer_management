export type CustomerStatus = 'active' | 'inactive' | 'potential' | 'vip';

export interface CustomerGroup {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerGroupWithCount extends CustomerGroup {
  customerCount: number;
}

export interface Customer {
  id: string;
  code: string;
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  status: CustomerStatus;
  group: CustomerGroup;
  totalTransactions: number;
  totalRevenue: number;
  lastContactAt: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface GetCustomersParams {
  page: number;
  limit: number;
  search?: string;
  status?: CustomerStatus;
  groupId?: string;
  sortBy?: keyof Customer | 'group';
  sortOrder?: 'asc' | 'desc';
  deleted?: 'exclude' | 'only';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type CreateCustomerDto = {
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  status: CustomerStatus;
  groupId: string;
  lastContactAt?: string;
};

export type UpdateCustomerDto = Partial<CreateCustomerDto>;

export interface CreateCustomerGroupDto {
  name: string;
  description?: string;
  color: string;
}

export type UpdateCustomerGroupDto = Partial<CreateCustomerGroupDto>;

export interface BulkActionDto {
  action: 'delete' | 'updateStatus' | 'updateGroup' | 'restore' | 'permanentDelete';
  ids: string[];
  status?: CustomerStatus;
  groupId?: string;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: { row: number; message: string }[];
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

export type ContactNoteType = 'call' | 'email' | 'meeting' | 'note';

export interface ContactNote {
  id: string;
  customerId: string;
  type: ContactNoteType;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface CreateContactNoteDto {
  customerId: string;
  type: ContactNoteType;
  content: string;
}

export interface BackupInfo {
  id: string;
  createdAt: string;
  files: string[];
}
