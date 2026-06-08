import { describe, expect, it, vi } from 'vitest';
import { createCustomerService } from '@/features/customers/services/customerService';

const mockPaginatedResponse = {
  data: [
    {
      id: '1',
      code: 'KH-0001',
      fullName: 'Nguyen Van A',
      email: 'a@test.com',
      phone: '0901234567',
      status: 'active' as const,
      group: { id: 'g1', name: 'Doanh nghiệp', color: '#4F46E5' },
      totalTransactions: 0,
      totalRevenue: 0,
      lastContactAt: '2025-01-01T00:00:00.000Z',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ],
  total: 1,
  page: 1,
  limit: 10,
  totalPages: 1,
};

describe('customerService.getAll', () => {
  it('should call correct endpoint with params', async () => {
    const mockHttp = {
      get: vi.fn().mockResolvedValue({ data: mockPaginatedResponse }),
    };
    const service = createCustomerService(mockHttp as never);
    await service.getAll({ page: 1, limit: 10, search: 'Nguyen' });
    expect(mockHttp.get).toHaveBeenCalledWith('/customers', {
      params: { page: 1, limit: 10, search: 'Nguyen' },
    });
  });
});
