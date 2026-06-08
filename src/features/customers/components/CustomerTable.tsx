import { useAuth } from '@/contexts/AuthContext';
import { formatDate, formatVND } from '@/utils/format';
import { Link } from 'react-router-dom';
import type { Customer, CustomerStatus } from '../types/customer.types';
import { CustomerGroupBadge } from './CustomerGroupBadge';
import { StatusBadge } from './StatusBadge';

type SortableField = 'code' | 'fullName' | 'totalRevenue' | 'lastContactAt';

interface CustomerTableProps {
  customers: Customer[];
  sortBy: SortableField;
  sortOrder: 'asc' | 'desc';
  selectedIds: Set<string>;
  onSort: (field: SortableField) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  isLoading?: boolean;
}

const COLUMNS: { key: SortableField | null; label: string; className?: string }[] = [
  { key: 'code', label: 'Mã KH' },
  { key: 'fullName', label: 'Họ tên' },
  { key: null, label: 'Email', className: 'hidden lg:table-cell' },
  { key: null, label: 'SĐT', className: 'hidden md:table-cell' },
  { key: null, label: 'Nhóm KH', className: 'hidden sm:table-cell' },
  { key: null, label: 'Trạng thái' },
  { key: 'totalRevenue', label: 'Doanh thu', className: 'hidden xl:table-cell' },
  { key: 'lastContactAt', label: 'Liên hệ gần nhất', className: 'hidden lg:table-cell' },
  { key: null, label: 'Thao tác' },
];

function SortIcon({ active, order }: { active: boolean; order: 'asc' | 'desc' }) {
  return (
    <svg
      className={`ml-1 inline h-3.5 w-3.5 ${active ? 'text-primary-600' : 'text-slate-300'}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      {order === 'asc' ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      )}
    </svg>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: 10 }).map((__, j) => (
            <td key={j} className="px-4 py-4">
              <div className="h-4 rounded bg-slate-200" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export const CustomerTable = ({
  customers,
  sortBy,
  sortOrder,
  selectedIds,
  onSort,
  onEdit,
  onDelete,
  onToggleSelect,
  onToggleSelectAll,
  isLoading,
}: CustomerTableProps) => {
  const { canEdit } = useAuth();
  const allSelected = customers.length > 0 && customers.every((c) => selectedIds.has(c.id));

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {canEdit && (
              <th scope="col" className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  aria-label="Chọn tất cả"
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
            )}
            {COLUMNS.map((col) => (
              <th
                key={col.label}
                scope="col"
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 ${col.className ?? ''}`}
              >
                {col.key ? (
                  <button
                    type="button"
                    onClick={() => onSort(col.key as SortableField)}
                    className="inline-flex cursor-pointer items-center transition-colors hover:text-slate-700"
                  >
                    {col.label}
                    <SortIcon active={sortBy === col.key} order={sortBy === col.key ? sortOrder : 'asc'} />
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            <TableSkeleton />
          ) : customers.length === 0 ? (
            <tr>
              <td colSpan={canEdit ? 10 : 9} className="px-4 py-16 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-slate-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="mt-3 text-sm font-medium text-slate-900">Không tìm thấy khách hàng</p>
                <p className="mt-1 text-sm text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </td>
            </tr>
          ) : (
            customers.map((customer) => (
              <tr key={customer.id} className="transition-colors hover:bg-slate-50/80">
                {canEdit && (
                  <td className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(customer.id)}
                      onChange={() => onToggleSelect(customer.id)}
                      aria-label={`Chọn ${customer.fullName}`}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                )}
                <td className="whitespace-nowrap px-4 py-3.5 text-sm font-medium">
                  <Link to={`/customers/${customer.id}`} className="text-primary-600 hover:underline">
                    {customer.code}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-sm font-medium text-slate-900">
                  <Link to={`/customers/${customer.id}`} className="hover:text-primary-600">
                    {customer.fullName}
                  </Link>
                </td>
                <td className="hidden whitespace-nowrap px-4 py-3.5 text-sm text-slate-600 lg:table-cell">
                  {customer.email}
                </td>
                <td className="hidden whitespace-nowrap px-4 py-3.5 text-sm text-slate-600 md:table-cell">
                  {customer.phone}
                </td>
                <td className="hidden whitespace-nowrap px-4 py-3.5 sm:table-cell">
                  <CustomerGroupBadge group={customer.group} />
                </td>
                <td className="whitespace-nowrap px-4 py-3.5">
                  <StatusBadge status={customer.status as CustomerStatus} />
                </td>
                <td className="hidden whitespace-nowrap px-4 py-3.5 text-sm font-medium text-slate-900 xl:table-cell">
                  {formatVND(customer.totalRevenue)}
                </td>
                <td className="hidden whitespace-nowrap px-4 py-3.5 text-sm text-slate-600 lg:table-cell">
                  {formatDate(customer.lastContactAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={`/customers/${customer.id}`}
                      aria-label={`Xem ${customer.fullName}`}
                      className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </Link>
                    {canEdit && (
                      <>
                        <button
                          type="button"
                          onClick={() => onEdit(customer)}
                          aria-label={`Sửa ${customer.fullName}`}
                          className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-primary-600"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(customer)}
                          aria-label={`Xóa ${customer.fullName}`}
                          className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
