import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CustomerTable } from '@/features/customers/components/CustomerTable';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ canEdit: true }),
}));

const mockCustomer = {
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
};

describe('CustomerTable', () => {
  it('should render customer data', () => {
    render(
      <MemoryRouter>
        <CustomerTable
          customers={[mockCustomer]}
          sortBy="fullName"
          sortOrder="asc"
          selectedIds={new Set()}
          onSort={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onToggleSelect={vi.fn()}
          onToggleSelectAll={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    expect(screen.getByText('KH-0001')).toBeInTheDocument();
  });
});
