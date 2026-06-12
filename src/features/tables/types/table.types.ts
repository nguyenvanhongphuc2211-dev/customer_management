export type TableStatus = 'empty' | 'occupied' | 'reserved' | 'cleaning' | 'billing';

export type TableNoteType = 'food' | 'allergy' | 'service' | 'billing';

export type TableNoteStatus = 'pending' | 'done';

export interface TableArea {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
}

export interface TableSession {
  id: string;
  tableId: string;
  guestCount: number;
  openedAt: string;
  closedAt: string | null;
  openedBy: string;
  customerId?: string;
}

export interface TableReservation {
  guestName: string;
  guestPhone?: string;
  guestCount: number;
  note?: string;
  reservedAt: string;
}

export interface RestaurantTable {
  id: string;
  number: number;
  label: string;
  areaId: string;
  capacity: number;
  status: TableStatus;
  currentSessionId: string | null;
  reservation?: TableReservation | null;
  createdAt: string;
  updatedAt: string;
}

export interface TableNote {
  id: string;
  tableId: string;
  sessionId: string;
  type: TableNoteType;
  content: string;
  status: TableNoteStatus;
  orderId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tableLabel?: string;
}

export type TableOrderStatus = 'pending' | 'done' | 'cancelled';

export interface TableOrderItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
}

export interface TableOrder {
  id: string;
  tableId: string;
  sessionId: string;
  items: TableOrderItem[];
  status: TableOrderStatus;
  note?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTableOrderItemDto {
  menuItemId: string;
  quantity: number;
}

export interface CreateTableOrderDto {
  items: CreateTableOrderItemDto[];
  note?: string;
}

export interface TableWithMeta extends RestaurantTable {
  area: TableArea;
  pendingNotesCount: number;
  currentSession: TableSession | null;
}

export interface TableDetail extends TableWithMeta {
  notes: TableNote[];
  orders: TableOrder[];
}

export interface GetTablesParams {
  areaId?: string;
  status?: TableStatus;
  search?: string;
}

export interface OpenTableDto {
  guestCount: number;
  customerId?: string;
}

export interface ReserveTableDto {
  guestName: string;
  guestPhone?: string;
  guestCount: number;
  note?: string;
}

export interface CreateTableNoteDto {
  tableId: string;
  type: TableNoteType;
  content: string;
}

export const TABLE_STATUS_LABELS: Record<TableStatus, string> = {
  empty: 'Trống',
  occupied: 'Có khách',
  reserved: 'Đặt trước',
  cleaning: 'Dọn bàn',
  billing: 'Thanh toán',
};

export const TABLE_ORDER_STATUS_LABELS: Record<TableOrderStatus, string> = {
  pending: 'Đang chế biến',
  done: 'Đã xong',
  cancelled: 'Đã hủy',
};

export const TABLE_NOTE_TYPE_LABELS: Record<TableNoteType, string> = {
  food: 'Món ăn',
  allergy: 'Dị ứng',
  service: 'Phục vụ',
  billing: 'Thanh toán',
};

export const TABLE_STATUS_COLORS: Record<TableStatus, string> = {
  empty: 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-300',
  occupied: 'bg-orange-100 border-orange-400 text-orange-900 dark:bg-orange-950/40 dark:border-orange-600 dark:text-orange-300',
  reserved: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-950/40 dark:border-blue-600 dark:text-blue-300',
  cleaning: 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:border-amber-600 dark:text-amber-300',
  billing: 'bg-violet-100 border-violet-300 text-violet-800 dark:bg-violet-950/40 dark:border-violet-600 dark:text-violet-300',
};
