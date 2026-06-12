import { useAuth } from '@/contexts/AuthContext';
import { useMemo, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { TableCard } from '../components/TableCard';
import { TableDetailDrawer } from '../components/TableDetailDrawer';
import { useMarkTableNoteDone } from '../hooks/useTableMutations';
import { usePendingTableNotes, useTableAreas, useTables } from '../hooks/useTables';
import type { TableStatus, TableWithMeta } from '../types/table.types';
import { TABLE_NOTE_TYPE_LABELS, TABLE_STATUS_LABELS } from '../types/table.types';

const STATUS_FILTERS: { value: TableStatus | ''; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'empty', label: 'Trống' },
  { value: 'occupied', label: 'Có khách' },
  { value: 'reserved', label: 'Đặt trước' },
  { value: 'billing', label: 'Thanh toán' },
  { value: 'cleaning', label: 'Dọn bàn' },
];

export const FloorPlanPage = () => {
  const { permissions } = useAuth();
  const [areaId, setAreaId] = useState('');
  const [status, setStatus] = useState<TableStatus | ''>('');
  const [search, setSearch] = useState('');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [showPending, setShowPending] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const { data: areas = [] } = useTableAreas();
  const { data: tables = [], isLoading } = useTables({
    areaId: areaId || undefined,
    status: status || undefined,
    search: debouncedSearch || undefined,
  });
  const { data: pendingNotes = [] } = usePendingTableNotes();
  const markDone = useMarkTableNoteDone();

  const stats = useMemo(() => {
    const all = tables;
    return {
      total: all.length,
      occupied: all.filter((t) => t.status === 'occupied').length,
      pendingNotes: pendingNotes.length,
    };
  }, [tables, pendingNotes]);

  const handleTableClick = (table: TableWithMeta) => {
    setSelectedTableId(table.id);
  };

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Tổng bàn', value: stats.total },
          { label: 'Có khách', value: stats.occupied },
          { label: 'Ghi chú chờ', value: stats.pendingNotes },
          { label: 'Khu vực', value: areas.length },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-4 lg:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setAreaId('')}
              className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                !areaId ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              Tất cả
            </button>
            {areas.map((area) => (
              <button
                key={area.id}
                type="button"
                onClick={() => setAreaId(area.id)}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  areaId === area.id ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {area.name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="search"
              placeholder="Tìm số bàn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field w-full sm:w-40"
              aria-label="Tìm bàn"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TableStatus | '')}
              className="select-field"
              aria-label="Lọc trạng thái"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowPending((v) => !v)}
              className={`btn-secondary ${pendingNotes.length > 0 ? 'border-amber-400' : ''}`}
            >
              Ghi chú ({pendingNotes.length})
            </button>
          </div>
        </div>

        {showPending && (
          <div className="mt-4 max-h-48 overflow-y-auto rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
            {pendingNotes.length === 0 ? (
              <p className="text-sm text-slate-500">Không có ghi chú chờ xử lý</p>
            ) : (
              <ul className="space-y-2">
                {pendingNotes.map((note) => (
                  <li key={note.id} className="flex items-center justify-between gap-2 text-sm">
                    <span>
                      <strong>{note.tableLabel}</strong> · {TABLE_NOTE_TYPE_LABELS[note.type]}: {note.content}
                    </span>
                    {permissions.canMarkKitchenDone && (
                      <button
                        type="button"
                        onClick={() => markDone.mutate(note.id)}
                        className="shrink-0 cursor-pointer rounded bg-emerald-600 px-2 py-0.5 text-xs text-white"
                      >
                        Xong
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
          {(Object.keys(TABLE_STATUS_LABELS) as TableStatus[]).map((s) => (
            <span key={s} className="flex items-center gap-1">
              <span className={`inline-block h-3 w-3 rounded border-2 ${s === 'empty' ? 'bg-emerald-200 border-emerald-400' : s === 'occupied' ? 'bg-orange-200 border-orange-400' : s === 'reserved' ? 'bg-blue-200 border-blue-400' : s === 'cleaning' ? 'bg-amber-200 border-amber-400' : 'bg-violet-200 border-violet-400'}`} />
              {TABLE_STATUS_LABELS[s]}
            </span>
          ))}
        </div>

        {isLoading ? (
          <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="h-[88px] animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
            ))}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10">
            {tables.map((table) => (
              <TableCard key={table.id} table={table} onClick={handleTableClick} />
            ))}
          </div>
        )}

        {!isLoading && tables.length === 0 && (
          <p className="py-12 text-center text-slate-400">Không tìm thấy bàn phù hợp</p>
        )}
      </div>

      <TableDetailDrawer tableId={selectedTableId} onClose={() => setSelectedTableId(null)} />
    </div>
  );
};
