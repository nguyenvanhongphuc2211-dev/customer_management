export type TableStatus = 'empty' | 'occupied' | 'reserved' | 'cleaning' | 'billing';

export type TableNoteType = 'food' | 'allergy' | 'service' | 'billing';

export type TableNoteStatus = 'pending' | 'done';

export interface TableArea {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
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

export interface TableSession {
  id: string;
  tableId: string;
  guestCount: number;
  openedAt: string;
  closedAt: string | null;
  openedBy: string;
  customerId?: string;
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
}

export interface TableWithMeta extends RestaurantTable {
  area: TableArea;
  pendingNotesCount: number;
  currentSession: TableSession | null;
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

export interface UpdateTableStatusDto {
  status: TableStatus;
}

export interface CreateTableNoteDto {
  tableId: string;
  type: TableNoteType;
  content: string;
}

export interface UpdateTableNoteDto {
  status?: TableNoteStatus;
  content?: string;
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
