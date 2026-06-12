import type { TableNoteStatus, TableNoteType } from './table.types.js';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceTableNote {
  id: string;
  type: TableNoteType;
  content: string;
  status: TableNoteStatus;
  createdBy: string;
  createdAt: string;
}

export interface TableInvoice {
  id: string;
  invoiceNumber: string;
  tableId: string;
  tableLabel: string;
  sessionId: string | null;
  guestCount: number;
  items: InvoiceLineItem[];
  notes: InvoiceTableNote[];
  subtotal: number;
  tax: number;
  total: number;
  createdBy: string;
  createdAt: string;
}

export interface CreateInvoiceDto {
  tableId: string;
  items: InvoiceLineItem[];
  tax?: number;
}
