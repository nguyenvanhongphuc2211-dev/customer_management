import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useState } from 'react';
import { BulkActionBar } from '../components/BulkActionBar';
import { CustomerFilters } from '../components/CustomerFilters';
import { CustomerForm } from '../components/CustomerForm';
import { CustomerGroupManagement } from '../components/CustomerGroupManagement';
import { CustomerTable } from '../components/CustomerTable';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { ImportCsvModal } from '../components/ImportCsvModal';
import { StatsCards } from '../components/StatsCards';
import { useBulkAction } from '../hooks/useBulkAction';
import { useCreateCustomer } from '../hooks/useCreateCustomer';
import { useCustomerGroups } from '../hooks/useCustomerGroups';
import { useCustomers } from '../hooks/useCustomers';
import { useDeleteCustomer } from '../hooks/useDeleteCustomer';
import { useUpdateCustomer } from '../hooks/useUpdateCustomer';
import { customerService } from '../services';
import type { CustomerFormValues } from '../schemas/customerSchema';
import type { Customer, CustomerStatus } from '../types/customer.types';

type SortField = 'code' | 'fullName' | 'totalRevenue' | 'lastContactAt';

export const CustomerManagementPage = () => {
  const { canEdit } = useAuth();
  const { showToast } = useToast();
  const { data: groups = [] } = useCustomerGroups();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CustomerStatus | ''>('');
  const [groupId, setGroupId] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('fullName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const queryParams = {
    page,
    limit,
    search: debouncedSearch || undefined,
    status: status || undefined,
    groupId: groupId || undefined,
    sortBy,
    sortOrder,
  };

  const { data, isLoading, isError, error } = useCustomers(queryParams);

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();
  const bulkAction = useBulkAction();

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!data) return;
    const allSelected = data.data.every((c) => selectedIds.has(c.id));
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.data.map((c) => c.id)));
    }
  };

  const handleExport = async () => {
    try {
      const blob = await customerService.exportCsv({
        page: 1,
        limit: 10000,
        search: debouncedSearch || undefined,
        status: status || undefined,
        groupId: groupId || undefined,
        sortBy,
        sortOrder,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Xuất CSV thành công', 'success');
    } catch {
      showToast('Không thể xuất CSV', 'error');
    }
  };

  const handleFormSubmit = (values: CustomerFormValues) => {
    const payload = {
      ...values,
      company: values.company || undefined,
      address: values.address || undefined,
      lastContactAt: values.lastContactAt
        ? new Date(values.lastContactAt).toISOString()
        : undefined,
    };

    if (editingCustomer) {
      updateCustomer.mutate(
        { id: editingCustomer.id, payload },
        { onSuccess: () => { setFormOpen(false); setEditingCustomer(null); } },
      );
    } else {
      createCustomer.mutate(payload, { onSuccess: () => setFormOpen(false) });
    }
  };

  return (
    <div>
      <StatsCards />

      <div className="card p-4 lg:p-6">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="page-title">Danh sách khách hàng</h2>
            <p className="page-subtitle">
              {data ? `${data.total} khách hàng` : 'Đang tải...'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleExport} className="btn-secondary">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Xuất CSV
            </button>
            {canEdit && (
              <>
                <button type="button" onClick={() => setImportOpen(true)} className="btn-secondary">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Import CSV
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingCustomer(null); setFormOpen(true); }}
                  className="btn-primary"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm khách hàng
                </button>
              </>
            )}
          </div>
        </div>

        <CustomerFilters
          search={search}
          status={status}
          groupId={groupId}
          groups={groups}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          onStatusChange={(v) => { setStatus(v); setPage(1); }}
          onGroupChange={(v) => { setGroupId(v); setPage(1); }}
        />

        {canEdit && selectedIds.size > 0 && (
          <div className="mt-4">
            <BulkActionBar
              selectedCount={selectedIds.size}
              groups={groups}
              isLoading={bulkAction.isPending}
              onClear={() => setSelectedIds(new Set())}
              onDelete={() => setBulkDeleteOpen(true)}
              onUpdateStatus={(s) => {
                bulkAction.mutate(
                  { action: 'updateStatus', ids: [...selectedIds], status: s },
                  { onSuccess: () => setSelectedIds(new Set()) },
                );
              }}
              onUpdateGroup={(gid) => {
                bulkAction.mutate(
                  { action: 'updateGroup', ids: [...selectedIds], groupId: gid },
                  { onSuccess: () => setSelectedIds(new Set()) },
                );
              }}
            />
          </div>
        )}

        {isError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            Không thể tải dữ liệu. {(error as Error)?.message ?? 'Vui lòng kiểm tra server API.'}
          </div>
        )}

        <div className="mt-4">
          <CustomerTable
            customers={data?.data ?? []}
            sortBy={sortBy}
            sortOrder={sortOrder}
            selectedIds={selectedIds}
            onSort={handleSort}
            onEdit={(c) => { setEditingCustomer(c); setFormOpen(true); }}
            onDelete={setDeletingCustomer}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            isLoading={isLoading}
          />
        </div>

        {data && data.totalPages > 0 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <label htmlFor="page-size">Hiển thị</label>
              <select
                id="page-size"
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="cursor-pointer rounded-lg border border-slate-200 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>/ trang</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Trước
              </button>
              <span className="text-sm text-slate-600">Trang {data.page} / {data.totalPages}</span>
              <button
                type="button"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      <CustomerGroupManagement />

      <CustomerForm
        isOpen={formOpen}
        customer={editingCustomer}
        groups={groups}
        isLoading={createCustomer.isPending || updateCustomer.isPending}
        onSubmit={handleFormSubmit}
        onClose={() => { setFormOpen(false); setEditingCustomer(null); }}
      />

      <DeleteConfirmModal
        isOpen={!!deletingCustomer}
        title="Chuyển vào thùng rác"
        message={`Khách hàng "${deletingCustomer?.fullName}" sẽ được chuyển vào thùng rác. Bạn có thể khôi phục sau.`}
        isLoading={deleteCustomer.isPending}
        onCancel={() => setDeletingCustomer(null)}
        onConfirm={() => {
          if (deletingCustomer) {
            deleteCustomer.mutate(deletingCustomer.id, {
              onSuccess: () => setDeletingCustomer(null),
            });
          }
        }}
      />

      <DeleteConfirmModal
        isOpen={bulkDeleteOpen}
        title="Chuyển vào thùng rác"
        message={`Chuyển ${selectedIds.size} khách hàng đã chọn vào thùng rác?`}
        isLoading={bulkAction.isPending}
        onCancel={() => setBulkDeleteOpen(false)}
        onConfirm={() => {
          bulkAction.mutate(
            { action: 'delete', ids: [...selectedIds] },
            {
              onSuccess: () => {
                setSelectedIds(new Set());
                setBulkDeleteOpen(false);
              },
            },
          );
        }}
      />

      <ImportCsvModal isOpen={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
};
