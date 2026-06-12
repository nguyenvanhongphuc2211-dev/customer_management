import { formatDate } from '@/utils/format';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { useTable, useTables } from '@/features/tables/hooks/useTables';
import type { TableOrder, TableWithMeta } from '@/features/tables/types/table.types';
import { TABLE_NOTE_TYPE_LABELS, TABLE_STATUS_LABELS } from '@/features/tables/types/table.types';
import {
  useCreateInvoice,
  useExportInvoice,
  useInvoiceDraft,
  useInvoices,
} from '../hooks/useInvoices';
import { printInvoice } from '../utils/printInvoice';
import type { InvoiceLineItem, InvoiceTableNote, TableInvoice } from '../types/invoice.types';

const EMPTY_DRAFT_ITEMS: InvoiceLineItem[] = [];

const formatMoney = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const ordersToLineItems = (orders: TableOrder[]): InvoiceLineItem[] =>
  orders
    .filter((order) => order.status !== 'cancelled')
    .flatMap((order) =>
      order.items.map((item) => ({
        description: item.menuItemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    );

const emptyLineItem = (): InvoiceLineItem => ({
  description: '',
  quantity: 1,
  unitPrice: 0,
});

const noteTypeLabel = (type: InvoiceTableNote['type']) =>
  TABLE_NOTE_TYPE_LABELS[type] ?? type;

export const CashierPage = () => {
  const { showToast } = useToast();
  const { data: billingTables = [], isLoading: loadingTables } = useTables({ status: 'billing' });
  const { data: invoices = [], isLoading: loadingInvoices } = useInvoices();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [items, setItems] = useState<InvoiceLineItem[]>([emptyLineItem()]);
  const [tax, setTax] = useState(0);
  const initializedTableRef = useRef<string | null>(null);

  const { data: selectedTableDetail, isLoading: loadingTableDetail } = useTable(selectedTableId);
  const selectedTable =
    billingTables.find((t) => t.id === selectedTableId) ?? selectedTableDetail ?? null;

  const { data: draftItemsData, isLoading: loadingDraft, isError: draftError } =
    useInvoiceDraft(selectedTableId);
  const draftItems = draftItemsData ?? EMPTY_DRAFT_ITEMS;

  const createInvoice = useCreateInvoice();
  const exportInvoice = useExportInvoice();

  useEffect(() => {
    if (selectedTableId) return;
    initializedTableRef.current = null;
    setItems([emptyLineItem()]);
    setTax(0);
  }, [selectedTableId]);

  useEffect(() => {
    if (!selectedTableId) return;
    if (initializedTableRef.current === selectedTableId) return;
    if (loadingDraft || loadingTableDetail) return;

    const orderItems = ordersToLineItems(selectedTableDetail?.orders ?? []);
    const nextItems =
      draftItems.length > 0
        ? draftItems
        : orderItems.length > 0
          ? orderItems
          : [emptyLineItem()];

    setItems(nextItems);
    setTax(0);
    initializedTableRef.current = selectedTableId;
  }, [selectedTableId, loadingDraft, loadingTableDetail, draftItems, selectedTableDetail?.orders]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    return { subtotal, total: subtotal + tax };
  }, [items, tax]);

  const validItems = useMemo(
    () => items.filter((item) => item.description.trim()),
    [items],
  );

  const canSave =
    !!selectedTableId &&
    validItems.length > 0 &&
    !createInvoice.isPending &&
    selectedTable?.status === 'billing';

  const updateItem = (index: number, patch: Partial<InvoiceLineItem>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const addItem = () => {
    setItems((prev) => [...prev, emptyLineItem()]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => (prev.length === 1 ? [emptyLineItem()] : prev.filter((_, i) => i !== index)));
  };

  const handleSave = () => {
    if (!selectedTableId) return;
    if (validItems.length === 0) {
      showToast('Thêm ít nhất một dòng hóa đơn có mô tả món/dịch vụ', 'error');
      return;
    }
    if (selectedTable?.status !== 'billing') {
      showToast('Bàn không còn ở trạng thái thanh toán', 'error');
      return;
    }

    createInvoice.mutate(
      { tableId: selectedTableId, items: validItems, tax },
      {
        onSuccess: (invoice) => {
          initializedTableRef.current = null;
          setSelectedTableId(null);
          printInvoice(invoice);
        },
      },
    );
  };

  const handlePrint = (invoice: TableInvoice) => {
    printInvoice(invoice);
  };

  const loadingForm = !!selectedTableId && (loadingDraft || loadingTableDetail);
  const sessionNotes = selectedTableDetail?.notes ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
      <div className="space-y-6">
        <div className="card p-6">
          <h2 className="page-title">Bàn chờ thanh toán</h2>
          <p className="page-subtitle mt-1">Chọn bàn để lập và lưu hóa đơn</p>

          {loadingTables ? (
            <p className="mt-4 text-sm text-slate-400">Đang tải...</p>
          ) : billingTables.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">Không có bàn nào đang thanh toán</p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {billingTables.map((table: TableWithMeta) => (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => {
                    initializedTableRef.current = null;
                    setSelectedTableId(table.id);
                  }}
                  className={`cursor-pointer rounded-xl border-2 p-4 text-left transition-colors ${
                    selectedTableId === table.id
                      ? 'border-violet-500 bg-violet-50 dark:border-violet-400 dark:bg-violet-950/30'
                      : 'border-violet-200 bg-violet-100/60 hover:border-violet-400 dark:border-violet-800 dark:bg-violet-950/20'
                  }`}
                >
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{table.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{table.area.name}</p>
                  <p className="mt-1 text-xs font-medium text-violet-700 dark:text-violet-300">
                    {TABLE_STATUS_LABELS[table.status]}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="page-title">Hóa đơn đã lưu</h2>
          {loadingInvoices ? (
            <p className="mt-4 text-sm text-slate-400">Đang tải...</p>
          ) : invoices.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">Chưa có hóa đơn nào</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-700">
              {invoices.map((invoice) => {
                const savedNotes = invoice.notes ?? [];
                return (
                  <li key={invoice.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {invoice.invoiceNumber} · {invoice.tableLabel}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(invoice.createdAt)} · {formatMoney(invoice.total)}
                          {savedNotes.length > 0 ? ` · ${savedNotes.length} ghi chú` : ''}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => handlePrint(invoice)}
                          className="btn-secondary text-sm"
                        >
                          In
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            exportInvoice.mutate({
                              id: invoice.id,
                              invoiceNumber: invoice.invoiceNumber,
                            })
                          }
                          disabled={exportInvoice.isPending}
                          className="btn-secondary text-sm"
                        >
                          JSON
                        </button>
                      </div>
                    </div>
                    {savedNotes.length > 0 && (
                      <ul className="mt-2 space-y-1 rounded-lg bg-slate-50 p-2 text-xs dark:bg-slate-800/50">
                        {savedNotes.map((note) => (
                          <li key={note.id} className="text-slate-600 dark:text-slate-300">
                            <span className="font-medium">{noteTypeLabel(note.type)}:</span>{' '}
                            {note.content}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="page-title">Lập hóa đơn</h2>
        {!selectedTableId ? (
          <p className="mt-4 text-sm text-slate-400">Chọn bàn bên trái để bắt đầu</p>
        ) : loadingForm ? (
          <p className="mt-4 text-sm text-slate-400">Đang tải dữ liệu bàn...</p>
        ) : (
          <>
            <div className="mt-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {selectedTable?.label ?? '...'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {selectedTable?.area?.name ?? ''}
                {selectedTable?.currentSession
                  ? ` · ${selectedTable.currentSession.guestCount} khách`
                  : ''}
              </p>
              {selectedTable && selectedTable.status !== 'billing' && (
                <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                  Bàn không còn chờ thanh toán — chọn bàn khác.
                </p>
              )}
            </div>

            {draftError && (
              <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
                Không tải được draft tự động — vui lòng nhập thủ công hoặc kiểm tra order của bàn.
              </p>
            )}

            {validItems.length === 0 && (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Chưa có món từ order — nhập tên món, số lượng và đơn giá bên dưới.
              </p>
            )}

            {sessionNotes.length > 0 && (
              <div className="mt-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Ghi chú sẽ lưu kèm hóa đơn ({sessionNotes.length})
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  {sessionNotes.map((note) => (
                    <li key={note.id} className="text-slate-700 dark:text-slate-200">
                      <span className="font-medium">{noteTypeLabel(note.type)}:</span> {note.content}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                >
                  <input
                    value={item.description}
                    onChange={(e) => updateItem(index, { description: e.target.value })}
                    placeholder="Mô tả món / dịch vụ"
                    className="input-field w-full"
                    aria-label={`Mô tả dòng ${index + 1}`}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, { quantity: Number(e.target.value) || 1 })}
                      className="input-field"
                      aria-label={`Số lượng dòng ${index + 1}`}
                    />
                    <input
                      type="number"
                      min={0}
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, { unitPrice: Number(e.target.value) || 0 })}
                      className="input-field"
                      aria-label={`Đơn giá dòng ${index + 1}`}
                    />
                    <button type="button" onClick={() => removeItem(index)} className="btn-secondary text-sm">
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addItem} className="btn-secondary w-full text-sm">
                Thêm dòng
              </button>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <label className="flex items-center justify-between gap-3">
                <span className="text-slate-500 dark:text-slate-400">Thuế / phí thêm</span>
                <input
                  type="number"
                  min={0}
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value) || 0)}
                  className="input-field w-32"
                />
              </label>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Tạm tính</span>
                <span className="font-medium">{formatMoney(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-slate-900 dark:text-slate-100">
                <span>Tổng cộng</span>
                <span>{formatMoney(totals.total)}</span>
              </div>
            </div>

            {createInvoice.isError && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                Không thể lưu hóa đơn. Kiểm tra bàn vẫn đang ở trạng thái &quot;Thanh toán&quot;.
              </p>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="btn-primary mt-4 w-full"
            >
              {createInvoice.isPending ? 'Đang lưu...' : 'Lưu hóa đơn & in'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
