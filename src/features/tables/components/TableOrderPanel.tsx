import { useMemo, useState } from 'react';
import { useMenuItems } from '@/features/menu/hooks/useMenu';
import { useCancelTableOrder, useCreateTableOrder } from '../hooks/useTableMutations';
import type { TableOrder, TableStatus } from '../types/table.types';
import { TABLE_ORDER_STATUS_LABELS } from '../types/table.types';

const formatMoney = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

interface TableOrderPanelProps {
  tableId: string;
  tableStatus: TableStatus;
  orders: TableOrder[];
}

export const TableOrderPanel = ({ tableId, tableStatus, orders }: TableOrderPanelProps) => {
  const canOrder = tableStatus === 'occupied' || tableStatus === 'billing';
  const { data: menuItems = [], isLoading: loadingMenu } = useMenuItems(canOrder);
  const createOrder = useCreateTableOrder();
  const cancelOrder = useCancelTableOrder();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [orderNote, setOrderNote] = useState('');

  const cartItems = useMemo(
    () =>
      menuItems
        .filter((item) => (quantities[item.id] ?? 0) > 0)
        .map((item) => ({
          menuItemId: item.id,
          name: item.name,
          quantity: quantities[item.id] ?? 0,
          unitPrice: item.price,
        })),
    [menuItems, quantities],
  );

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  const updateQuantity = (menuItemId: string, delta: number) => {
    setQuantities((prev) => {
      const next = Math.max(0, (prev[menuItemId] ?? 0) + delta);
      return { ...prev, [menuItemId]: next };
    });
  };

  const handleSubmit = () => {
    if (cartItems.length === 0) return;

    createOrder.mutate(
      {
        tableId,
        payload: {
          items: cartItems.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
          })),
          note: orderNote.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setQuantities({});
          setOrderNote('');
        },
      },
    );
  };

  if (!canOrder) return null;

  return (
    <>
      <div className="mt-4 card p-4">
        <h3 className="page-title text-sm">Order món cho bàn</h3>
        <p className="page-subtitle mt-1">Chọn món từ thực đơn và gửi xuống bếp</p>

        {loadingMenu ? (
          <p className="mt-4 text-sm text-slate-400">Đang tải thực đơn...</p>
        ) : menuItems.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">Thực đơn đang trống</p>
        ) : (
          <ul className="mt-4 max-h-56 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const qty = quantities[item.id] ?? 0;
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                      {item.name}
                    </p>
                    <p className="text-xs text-primary-700 dark:text-primary-300">
                      {formatMoney(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -1)}
                      disabled={qty === 0}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-sm dark:border-slate-600"
                      aria-label={`Giảm ${item.name}`}
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm text-white"
                      aria-label={`Tăng ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {cartItems.length > 0 && (
          <div className="mt-4 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Giỏ order</p>
            <ul className="mt-2 space-y-1 text-sm">
              {cartItems.map((item) => (
                <li key={item.menuItemId} className="flex justify-between gap-2">
                  <span>{item.quantity}× {item.name}</span>
                  <span>{formatMoney(item.quantity * item.unitPrice)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-sm font-semibold dark:border-slate-700">
              <span>Tạm tính</span>
              <span>{formatMoney(cartTotal)}</span>
            </div>
          </div>
        )}

        <textarea
          value={orderNote}
          onChange={(e) => setOrderNote(e.target.value)}
          placeholder="Ghi chú thêm: không cay, ít đá..."
          rows={2}
          className="input-field mt-3 w-full"
          aria-label="Ghi chú order"
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={createOrder.isPending || cartItems.length === 0}
          className="btn-primary mt-3 w-full"
        >
          {createOrder.isPending ? 'Đang gửi...' : 'Gửi order xuống bếp'}
        </button>
      </div>

      <div className="mt-4">
        <h3 className="page-title mb-3 text-sm">Order đã gửi</h3>
        {orders.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">Chưa có order nào</p>
        ) : (
          <ul className="space-y-2">
            {orders.map((order) => (
              <li
                key={order.id}
                className={`rounded-lg border p-3 ${
                  order.status === 'pending'
                    ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30'
                    : order.status === 'cancelled'
                      ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20'
                      : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {TABLE_ORDER_STATUS_LABELS[order.status]}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {formatMoney(
                        order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
                      )}
                    </span>
                    {order.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => cancelOrder.mutate(order.id)}
                        disabled={cancelOrder.isPending}
                        className="cursor-pointer rounded bg-red-600 px-2 py-0.5 text-xs text-white hover:bg-red-700"
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </div>
                <ul className="mt-2 space-y-1 text-sm text-slate-800 dark:text-slate-200">
                  {order.items.map((item) => (
                    <li key={`${order.id}-${item.menuItemId}`}>
                      {item.quantity}× {item.menuItemName}
                    </li>
                  ))}
                </ul>
                {order.note && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Ghi chú: {order.note}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};
