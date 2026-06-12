import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/utils/format';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CustomerGroupBadge } from '../components/CustomerGroupBadge';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { StatusBadge } from '../components/StatusBadge';
import { useBulkAction } from '../hooks/useBulkAction';
import { useCustomers } from '../hooks/useCustomers';
import {
  usePermanentDeleteCustomer,
  useRestoreCustomer,
} from '../hooks/useRestoreCustomer';

export const TrashPage = () => {
  const { canEdit } = useAuth();
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [permanentDeleteId, setPermanentDeleteId] = useState<string | null>(null);
  const [bulkPermanentOpen, setBulkPermanentOpen] = useState(false);

  const { data, isLoading } = useCustomers({
    page,
    limit: 10,
    deleted: 'only',
    sortBy: 'deletedAt',
    sortOrder: 'desc',
  });

  const restoreCustomer = useRestoreCustomer();
  const permanentDelete = usePermanentDeleteCustomer();
  const bulkAction = useBulkAction();

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="page-title">Thùng rác</h2>
          <p className="page-subtitle">{data ? `${data.total} khách hàng đã xóa` : 'Đang tải...'}</p>
        </div>
        <Link to="/" className="btn-secondary text-sm">
          ← Quay lại danh sách
        </Link>
      </div>

      {canEdit && selectedIds.size > 0 && (
        <div className="mb-4 flex flex-wrap gap-2 rounded-lg border border-primary-200 bg-primary-50 p-3 dark:border-primary-800 dark:bg-primary-950/30">
          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
            Đã chọn {selectedIds.size}
          </span>
          <button
            type="button"
            className="btn-secondary text-sm"
            disabled={bulkAction.isPending}
            onClick={() => {
              bulkAction.mutate(
                { action: 'restore', ids: [...selectedIds] },
                { onSuccess: () => setSelectedIds(new Set()) },
              );
            }}
          >
            Khôi phục
          </button>
          <button
            type="button"
            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            onClick={() => setBulkPermanentOpen(true)}
          >
            Xóa vĩnh viễn
          </button>
          <button type="button" className="text-sm text-slate-500" onClick={() => setSelectedIds(new Set())}>
            Bỏ chọn
          </button>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="table-head">
            <tr>
              {canEdit && <th className="px-4 py-3" />}
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Mã KH</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Họ tên</th>
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 md:table-cell dark:text-slate-400">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Nhóm</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Trạng thái</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Ngày xóa</th>
              {canEdit && <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {isLoading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Đang tải...</td></tr>
            ) : !data?.data.length ? (
              <tr><td colSpan={8} className="px-4 py-16 text-center text-slate-400">Thùng rác trống</td></tr>
            ) : (
              data.data.map((c) => (
                <tr key={c.id} className="table-row-hover">
                  {canEdit && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(c.id)}
                        onChange={() => toggleSelect(c.id)}
                        className="h-4 w-4 cursor-pointer rounded"
                        aria-label={`Chọn ${c.fullName}`}
                      />
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm text-primary-600">{c.code}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">{c.fullName}</td>
                  <td className="hidden px-4 py-3 text-sm text-slate-600 md:table-cell dark:text-slate-400">{c.email}</td>
                  <td className="px-4 py-3"><CustomerGroupBadge group={c.group} /></td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                    {c.deletedAt ? formatDate(c.deletedAt) : '—'}
                  </td>
                  {canEdit && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => restoreCustomer.mutate(c.id)}
                          disabled={restoreCustomer.isPending}
                          className="cursor-pointer rounded-lg px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30"
                        >
                          Khôi phục
                        </button>
                        <button
                          type="button"
                          onClick={() => setPermanentDeleteId(c.id)}
                          className="cursor-pointer rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          Xóa hẳn
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary">Trước</button>
          <span className="py-2 text-sm text-slate-500">Trang {data.page} / {data.totalPages}</span>
          <button type="button" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary">Sau</button>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!permanentDeleteId}
        title="Xóa vĩnh viễn"
        message="Khách hàng sẽ bị xóa hoàn toàn, không thể khôi phục. Bạn có chắc?"
        isLoading={permanentDelete.isPending}
        onCancel={() => setPermanentDeleteId(null)}
        onConfirm={() => {
          if (permanentDeleteId) {
            permanentDelete.mutate(permanentDeleteId, {
              onSuccess: () => setPermanentDeleteId(null),
            });
          }
        }}
      />

      <DeleteConfirmModal
        isOpen={bulkPermanentOpen}
        title="Xóa vĩnh viễn hàng loạt"
        message={`Xóa hoàn toàn ${selectedIds.size} khách hàng đã chọn?`}
        isLoading={bulkAction.isPending}
        onCancel={() => setBulkPermanentOpen(false)}
        onConfirm={() => {
          bulkAction.mutate(
            { action: 'permanentDelete', ids: [...selectedIds] },
            {
              onSuccess: () => {
                setSelectedIds(new Set());
                setBulkPermanentOpen(false);
              },
            },
          );
        }}
      />
    </div>
  );
};
