import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { UserManagement } from '@/features/auth/components/UserManagement';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { useBackups, useCreateBackup, useRestoreBackup } from '../hooks/useBackup';
import { useState } from 'react';

export const SettingsPage = () => {
  const { canEdit, user, roleLabel } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { data: backups = [], isLoading } = useBackups();
  const createBackup = useCreateBackup();
  const restoreBackup = useRestoreBackup();
  const [restoringId, setRestoringId] = useState<string | null>(null);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="card p-6">
        <h2 className="page-title">Giao diện</h2>
        <p className="page-subtitle mt-1">Chế độ hiển thị ứng dụng</p>
        <button type="button" onClick={toggleTheme} className="btn-secondary mt-4">
          {isDark ? 'Chế độ sáng' : 'Chế độ tối'}
        </button>
        <p className="mt-2 text-xs text-slate-400">Đang dùng: {theme === 'dark' ? 'Tối' : 'Sáng'}</p>
      </div>

      <div className="card p-6">
        <h2 className="page-title">Tài khoản</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500 dark:text-slate-400">Họ tên</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">{user?.fullName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500 dark:text-slate-400">Email</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500 dark:text-slate-400">Vai trò</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">{roleLabel}</dd>
          </div>
        </dl>
      </div>

      {canEdit && <UserManagement />}

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="page-title">Sao lưu dữ liệu JSON</h2>
            <p className="page-subtitle mt-1">
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

        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-700">
          {isLoading ? (
            <div className="py-4 text-sm text-slate-400">Đang tải...</div>
          ) : backups.length === 0 ? (
            <div className="py-4 text-sm text-slate-400">Chưa có bản backup nào</div>
          ) : (
            backups.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{b.id}</p>
                  <p className="text-xs text-slate-400">{b.files.length} file</p>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setRestoringId(b.id)}
                    className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
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
