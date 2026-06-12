import { formatDate } from '@/utils/format';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomers } from '@/features/customers/hooks/useCustomers';
import { useDebounce } from '@/hooks/useDebounce';
import { useEffect, useState } from 'react';
import {
  useCloseTable,
  useCreateTableNote,
  useMarkTableNoteDone,
  useOpenTable,
  useReserveTable,
  useUpdateTableStatus,
} from '../hooks/useTableMutations';
import { useTable } from '../hooks/useTables';
import { TableOrderPanel } from './TableOrderPanel';
import type { TableNoteType, TableStatus } from '../types/table.types';
import {
  TABLE_NOTE_TYPE_LABELS,
  TABLE_STATUS_LABELS,
} from '../types/table.types';

interface TableDetailDrawerProps {
  tableId: string | null;
  onClose: () => void;
}

const NOTE_TYPES: TableNoteType[] = ['food', 'allergy', 'service', 'billing'];

const STATUS_ACTIONS: { status: TableStatus; label: string }[] = [
  { status: 'billing', label: 'Thanh toán' },
  { status: 'cleaning', label: 'Dọn bàn' },
  { status: 'empty', label: 'Trống' },
];

export const TableDetailDrawer = ({ tableId, onClose }: TableDetailDrawerProps) => {
  const { permissions } = useAuth();
  const { data: table, isLoading } = useTable(tableId);
  const openTable = useOpenTable();
  const reserveTable = useReserveTable();
  const closeTable = useCloseTable();
  const updateStatus = useUpdateTableStatus();
  const createNote = useCreateTableNote();
  const markDone = useMarkTableNoteDone();

  const [guestCount, setGuestCount] = useState(2);
  const [customerId, setCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [reserveName, setReserveName] = useState('');
  const [reservePhone, setReservePhone] = useState('');
  const [reserveGuests, setReserveGuests] = useState(2);
  const [reserveNote, setReserveNote] = useState('');
  const [noteType, setNoteType] = useState<TableNoteType>('food');
  const [noteContent, setNoteContent] = useState('');

  const debouncedCustomerSearch = useDebounce(customerSearch, 300);
  const { data: customerResults } = useCustomers({
    page: 1,
    limit: 8,
    search: debouncedCustomerSearch || undefined,
  });

  useEffect(() => {
    if (table?.reservation) {
      setGuestCount(table.reservation.guestCount);
      setReserveName(table.reservation.guestName);
      setReservePhone(table.reservation.guestPhone ?? '');
      setReserveGuests(table.reservation.guestCount);
      setReserveNote(table.reservation.note ?? '');
    }
  }, [table?.id, table?.reservation]);

  if (!tableId) return null;

  const handleOpen = () => {
    openTable.mutate({
      id: tableId,
      payload: { guestCount, customerId: customerId || undefined },
    });
  };

  const handleReserve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reserveName.trim()) return;
    reserveTable.mutate({
      id: tableId,
      payload: {
        guestName: reserveName.trim(),
        guestPhone: reservePhone.trim() || undefined,
        guestCount: reserveGuests,
        note: reserveNote.trim() || undefined,
      },
    });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    createNote.mutate(
      { tableId, type: noteType, content: noteContent.trim() },
      { onSuccess: () => setNoteContent('') },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-slate-900/50 dark:bg-black/60" aria-label="Đóng" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col card shadow-xl sm:max-w-lg">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
          <div>
            <h2 className="page-title text-xl">{table?.label ?? '...'}</h2>
            <p className="page-subtitle">{table?.area.name} · Sức chứa {table?.capacity}</p>
          </div>
          <button type="button" onClick={onClose} className="cursor-pointer rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Đóng">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading || !table ? (
            <div className="animate-pulse space-y-3">
              <div className="h-20 rounded-lg bg-slate-200 dark:bg-slate-700" />
              <div className="h-32 rounded-lg bg-slate-200 dark:bg-slate-700" />
            </div>
          ) : (
            <>
              <div className="card p-4">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Trạng thái</p>
                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {TABLE_STATUS_LABELS[table.status]}
                </p>
                {table.currentSession && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {table.currentSession.guestCount} khách · Mở lúc{' '}
                    {formatDate(table.currentSession.openedAt)}
                  </p>
                )}

                {table.reservation && (
                  <div className="mt-2 rounded-lg bg-blue-50 p-3 text-sm dark:bg-blue-950/30">
                    <p className="font-medium text-blue-900 dark:text-blue-200">{table.reservation.guestName}</p>
                    <p className="text-blue-700 dark:text-blue-300">
                      {table.reservation.guestCount} khách
                      {table.reservation.guestPhone ? ` · ${table.reservation.guestPhone}` : ''}
                    </p>
                    {table.reservation.note && (
                      <p className="mt-1 text-blue-600 dark:text-blue-400">{table.reservation.note}</p>
                    )}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {permissions.canManageTables && table.status === 'empty' && (
                    <form onSubmit={handleReserve} className="w-full space-y-2 rounded-lg border border-blue-200 p-3 dark:border-blue-800">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Đặt bàn trước</p>
                      <input value={reserveName} onChange={(e) => setReserveName(e.target.value)} placeholder="Tên khách" className="input-field w-full" required />
                      <input value={reservePhone} onChange={(e) => setReservePhone(e.target.value)} placeholder="SĐT" className="input-field w-full" />
                      <input type="number" min={1} max={table.capacity} value={reserveGuests} onChange={(e) => setReserveGuests(Number(e.target.value))} className="input-field w-full" aria-label="Số khách đặt" />
                      <input value={reserveNote} onChange={(e) => setReserveNote(e.target.value)} placeholder="Ghi chú đặt bàn" className="input-field w-full" />
                      <button type="submit" disabled={reserveTable.isPending} className="btn-secondary w-full text-sm">Lưu đặt bàn</button>
                    </form>
                  )}
                  {permissions.canManageTables && (table.status === 'empty' || table.status === 'reserved') && (
                    <div className="flex w-full flex-col gap-2">
                      <input
                        type="search"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        placeholder="Tìm khách hàng CRM..."
                        className="input-field w-full"
                        aria-label="Tìm khách hàng"
                      />
                      {customerResults && customerResults.data.length > 0 && (
                        <select
                          value={customerId}
                          onChange={(e) => setCustomerId(e.target.value)}
                          className="select-field w-full"
                          aria-label="Chọn khách hàng"
                        >
                          <option value="">— Không gắn KH —</option>
                          {customerResults.data.map((c) => (
                            <option key={c.id} value={c.id}>{c.fullName} · {c.phone}</option>
                          ))}
                        </select>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={1}
                          max={table.capacity}
                          value={guestCount}
                          onChange={(e) => setGuestCount(Number(e.target.value))}
                          className="input-field w-20"
                          aria-label="Số khách"
                        />
                        <button type="button" onClick={handleOpen} disabled={openTable.isPending} className="btn-primary flex-1">
                          Mở bàn
                        </button>
                      </div>
                    </div>
                  )}
                  {permissions.canManageTables && table.status === 'occupied' && (
                    <>
                      <button type="button" onClick={() => updateStatus.mutate({ id: table.id, status: 'billing' })} className="btn-secondary text-sm">
                        Chuyển TT
                      </button>
                      <button type="button" onClick={() => closeTable.mutate(table.id)} disabled={closeTable.isPending} className="btn-secondary text-sm">
                        Đóng bàn
                      </button>
                    </>
                  )}
                  {permissions.canManageTables && table.status === 'cleaning' && (
                    <button
                      type="button"
                      onClick={() => updateStatus.mutate({ id: table.id, status: 'empty' })}
                      disabled={updateStatus.isPending}
                      className="btn-primary w-full text-sm"
                    >
                      Bàn sẵn sàng
                    </button>
                  )}
                  {permissions.canManageTables && table.status === 'billing' && (
                    <p className="w-full rounded-lg bg-violet-50 p-3 text-sm text-violet-800 dark:bg-violet-950/30 dark:text-violet-200">
                      Bàn đang chờ thu ngân lập hóa đơn. Sau khi thanh toán, bàn sẽ tự chuyển sang dọn bàn.
                    </p>
                  )}
                  {permissions.canManageTables &&
                    table.status !== 'occupied' &&
                    table.status !== 'cleaning' &&
                    table.status !== 'billing' &&
                    STATUS_ACTIONS.filter((a) => a.status !== table.status).map((action) => (
                      <button
                        key={action.status}
                        type="button"
                        onClick={() => updateStatus.mutate({ id: table.id, status: action.status })}
                        className="btn-secondary text-sm"
                      >
                        {action.label}
                      </button>
                    ))}
                </div>
              </div>

              {permissions.canManageTables && (
                <TableOrderPanel
                  tableId={table.id}
                  tableStatus={table.status}
                  orders={table.orders ?? []}
                />
              )}

              {permissions.canManageTables && table.status === 'occupied' && (
                <form onSubmit={handleAddNote} className="mt-4 card p-4">
                  <h3 className="page-title text-sm">Thêm ghi chú / yêu cầu</h3>
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value as TableNoteType)}
                    className="select-field mt-2 w-full"
                    aria-label="Loại ghi chú"
                  >
                    {NOTE_TYPES.map((t) => (
                      <option key={t} value={t}>{TABLE_NOTE_TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="VD: Không cay, thêm đá, trẻ em cần ghế cao..."
                    rows={2}
                    className="input-field mt-2"
                    aria-label="Nội dung ghi chú"
                  />
                  <button type="submit" disabled={createNote.isPending || !noteContent.trim()} className="btn-primary mt-2 w-full">
                    {createNote.isPending ? 'Đang lưu...' : 'Thêm ghi chú'}
                  </button>
                </form>
              )}

              <div className="mt-4">
                <h3 className="page-title mb-3 text-sm">Lịch sử ghi chú</h3>
                {table.notes.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-400">Chưa có ghi chú</p>
                ) : (
                  <ul className="space-y-2">
                    {table.notes.map((note) => (
                      <li
                        key={note.id}
                        className={`rounded-lg border p-3 ${
                          note.status === 'pending'
                            ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30'
                            : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              {TABLE_NOTE_TYPE_LABELS[note.type]} · {formatDate(note.createdAt)}
                            </span>
                            <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">{note.content}</p>
                            <p className="mt-1 text-xs text-slate-400">{note.createdBy}</p>
                          </div>
                          {permissions.canMarkKitchenDone && note.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => markDone.mutate(note.id)}
                              disabled={markDone.isPending}
                              className="shrink-0 cursor-pointer rounded-lg bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};
