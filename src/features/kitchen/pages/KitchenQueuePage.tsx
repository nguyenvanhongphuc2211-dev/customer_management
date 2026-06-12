import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/utils/format';
import { useMarkTableNoteDone } from '@/features/tables/hooks/useTableMutations';
import { usePendingTableNotes } from '@/features/tables/hooks/useTables';
import { TABLE_NOTE_TYPE_LABELS } from '@/features/tables/types/table.types';

export const KitchenQueuePage = () => {
  const { permissions } = useAuth();
  const { data: notes = [], isLoading } = usePendingTableNotes();
  const markDone = useMarkTableNoteDone();

  return (
    <div className="max-w-4xl">
      <div className="card p-6">
        <h2 className="page-title">Yêu cầu từ bàn</h2>
        <p className="page-subtitle mt-1">
          {permissions.canMarkKitchenDone
            ? 'Theo dõi và đánh dấu hoàn thành yêu cầu món ăn / dị ứng'
            : 'Chỉ xem yêu cầu — liên hệ bếp trưởng để xác nhận hoàn thành'}
        </p>

        {isLoading ? (
          <p className="mt-6 text-sm text-slate-400">Đang tải...</p>
        ) : notes.length === 0 ? (
          <p className="mt-6 rounded-lg border border-dashed border-slate-200 py-12 text-center text-sm text-slate-400 dark:border-slate-700">
            Không có yêu cầu đang chờ
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {notes.map((note) => (
              <li
                key={note.id}
                className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                        {note.tableLabel}
                      </span>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {TABLE_NOTE_TYPE_LABELS[note.type]}
                      </span>
                      <span className="text-xs text-slate-400">{formatDate(note.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-800 dark:text-slate-200">{note.content}</p>
                    <p className="mt-1 text-xs text-slate-400">{note.createdBy}</p>
                  </div>
                  {permissions.canMarkKitchenDone && (
                    <button
                      type="button"
                      onClick={() => markDone.mutate(note.id)}
                      disabled={markDone.isPending}
                      className="shrink-0 cursor-pointer rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      Xong
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
