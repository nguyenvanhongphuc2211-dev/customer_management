import { useAuth } from '@/contexts/AuthContext';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { useBackups, useCreateBackup, useRestoreBackup } from '../hooks/useBackup';
import { useState } from 'react';

export const SettingsPage = () => {
  const { canEdit, user } = useAuth();
  const { data: backups = [], isLoading } = useBackups();
  const createBackup = useCreateBackup();
  const restoreBackup = useRestoreBackup();
  const [restoringId, setRestoringId] = useState<string | null>(null);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Tài khoản</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Họ tên</dt>
            <dd className="font-medium text-slate-900">{user?.fullName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-900">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Vai trò</dt>
            <dd className="font-medium text-slate-900">{user?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Sao lưu dữ liệu JSON</h2>
            <p className="mt-1 text-sm text-slate-500">
              Tạo và khôi phục bản sao lưu từ file JSON
            </p>
          </div>
          {canEdit && (
            <button
              type="button"
              onClick={() => createBackup.mutate()}
              disabled={createBackup.isPending}
              className="cursor-pointer rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {createBackup.isPending ? 'Đang sao lưu...' : 'Tạo backup'}
            </button>
          )}
        </div>

        {!canEdit && (
          <p className="mt-4 text-sm text-amber-600">Chỉ admin mới có quyền sao lưu và khôi phục.</p>
        )}

        <div className="mt-4 divide-y divide-slate-100">
          {isLoading ? (
            <div className="py-4 text-sm text-slate-400">Đang tải...</div>
          ) : backups.length === 0 ? (
            <div className="py-4 text-sm text-slate-400">Chưa có bản backup nào</div>
          ) : (
            backups.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{b.id}</p>
                  <p className="text-xs text-slate-400">{b.files.length} file</p>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setRestoringId(b.id)}
                    className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Khôi phục
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={!!restoringId}
        title="Khôi phục dữ liệu"
        message="Thao tác này sẽ ghi đè toàn bộ dữ liệu hiện tại bằng bản backup. Bạn có chắc chắn?"
        isLoading={restoreBackup.isPending}
        onCancel={() => setRestoringId(null)}
        onConfirm={() => {
          if (restoringId) {
            restoreBackup.mutate(restoringId, {
              onSuccess: () => setRestoringId(null),
            });
          }
        }}
      />
    </div>
  );
};
