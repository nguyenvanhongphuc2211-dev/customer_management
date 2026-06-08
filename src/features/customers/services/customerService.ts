import type { AxiosInstance } from 'axios';
import { paginatedCustomerSchema, customerSchema } from '../schemas/customerSchema';
import type {
  AnalyticsData,
  BackupInfo,
  BulkActionDto,
  CreateContactNoteDto,
  CreateCustomerDto,
  CreateCustomerGroupDto,
  Customer,
  CustomerGroupWithCount,
  ContactNote,
  GetCustomersParams,
  PaginatedResponse,
  UpdateCustomerDto,
  UpdateCustomerGroupDto,
} from '../types/customer.types';

export const createCustomerService = (httpClient: AxiosInstance) => ({
  getAll: async (params: GetCustomersParams): Promise<PaginatedResponse<Customer>> => {
    const { data } = await httpClient.get('/customers', { params });
    return paginatedCustomerSchema.parse(data);
  },

  getById: async (id: string): Promise<Customer> => {
    const { data } = await httpClient.get(`/customers/${id}`);
    return customerSchema.parse(data);
  },

  create: async (payload: CreateCustomerDto): Promise<Customer> => {
    const { data } = await httpClient.post('/customers', payload);
    return customerSchema.parse(data);
  },

  update: async (id: string, payload: UpdateCustomerDto): Promise<Customer> => {
    const { data } = await httpClient.put(`/customers/${id}`, payload);
    return customerSchema.parse(data);
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`/customers/${id}`);
  },

  bulkAction: async (payload: BulkActionDto): Promise<{ affected: number }> => {
    const { data } = await httpClient.post<{ affected: number }>('/customers/bulk', payload);
    return data;
  },

  exportCsv: async (params: GetCustomersParams): Promise<Blob> => {
    const { data } = await httpClient.get('/customers/export', {
      params,
      responseType: 'blob',
    });
    return data;
  },

  getGroups: async (): Promise<CustomerGroupWithCount[]> => {
    const { data } = await httpClient.get<CustomerGroupWithCount[]>('/customer-groups');
    return data;
  },

  createGroup: async (payload: CreateCustomerGroupDto): Promise<CustomerGroupWithCount> => {
    const { data } = await httpClient.post<CustomerGroupWithCount>('/customer-groups', payload);
    return data;
  },

  updateGroup: async (
    id: string,
    payload: UpdateCustomerGroupDto,
  ): Promise<CustomerGroupWithCount> => {
    const { data } = await httpClient.put<CustomerGroupWithCount>(
      `/customer-groups/${id}`,
      payload,
    );
    return data;
  },

  deleteGroup: async (id: string): Promise<void> => {
    await httpClient.delete(`/customer-groups/${id}`);
  },

  getContactNotes: async (customerId: string): Promise<ContactNote[]> => {
    const { data } = await httpClient.get<ContactNote[]>(`/contact-notes/customer/${customerId}`);
    return data;
  },

  createContactNote: async (payload: CreateContactNoteDto): Promise<ContactNote> => {
    const { data } = await httpClient.post<ContactNote>('/contact-notes', payload);
    return data;
  },

  deleteContactNote: async (id: string): Promise<void> => {
    await httpClient.delete(`/contact-notes/${id}`);
  },

  getAnalytics: async (): Promise<AnalyticsData> => {
    const { data } = await httpClient.get<AnalyticsData>('/analytics');
    return data;
  },

  listBackups: async (): Promise<BackupInfo[]> => {
    const { data } = await httpClient.get<BackupInfo[]>('/backup');
    return data;
  },

  createBackup: async (): Promise<{ id: string }> => {
    const { data } = await httpClient.post<{ id: string }>('/backup');
    return data;
  },

  restoreBackup: async (id: string): Promise<void> => {
    await httpClient.post(`/backup/restore/${id}`);
  },
});

export type CustomerService = ReturnType<typeof createCustomerService>;
