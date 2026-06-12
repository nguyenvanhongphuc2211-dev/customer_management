import { v4 as uuidv4 } from 'uuid';
import type { JsonStore } from '../storage/jsonStore.js';
import type { CreateInvoiceDto, InvoiceLineItem, TableInvoice } from '../types/invoice.types.js';
import type { TableNoteRepository } from './tableNoteRepository.js';
import type { TableOrderRepository } from './tableOrderRepository.js';
import type { TableRepository } from './tableRepository.js';

const calcTotals = (items: InvoiceLineItem[], tax = 0) => {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = tax > 0 ? tax : 0;
  return { subtotal, tax: taxAmount, total: subtotal + taxAmount };
};

const buildInvoiceNumber = (existing: TableInvoice[]): string => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const todayCount = existing.filter((inv) => inv.invoiceNumber.startsWith(`INV-${date}`)).length;
  return `INV-${date}-${String(todayCount + 1).padStart(3, '0')}`;
};

const normalizeInvoice = (invoice: TableInvoice): TableInvoice => ({
  ...invoice,
  notes: invoice.notes ?? [],
});

export const createInvoiceRepository = (
  store: JsonStore<TableInvoice[]>,
  tableRepo: TableRepository,
  noteRepo: TableNoteRepository,
  orderRepo: TableOrderRepository,
) => ({
  async findAll(): Promise<TableInvoice[]> {
    const invoices = await store.read();
    return invoices
      .map(normalizeInvoice)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async findById(id: string): Promise<TableInvoice | null> {
    const invoices = await store.read();
    const invoice = invoices.find((inv) => inv.id === id);
    return invoice ? normalizeInvoice(invoice) : null;
  },

  async buildDraftItems(tableId: string): Promise<InvoiceLineItem[]> {
    const table = await tableRepo.findById(tableId);
    if (!table) throw new Error('TABLE_NOT_FOUND');
    if (table.status !== 'billing') throw new Error('TABLE_NOT_BILLING');

    const orders = (await orderRepo.findByTable(tableId, table.currentSessionId ?? undefined))
      .filter((order) => order.status !== 'cancelled');
    const orderItems = orders.flatMap((order) =>
      order.items.map((item) => ({
        description: item.menuItemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    );

    if (orderItems.length > 0) {
      return orderItems;
    }

    const notes = await noteRepo.findByTable(tableId, table.currentSessionId ?? undefined);
    return notes
      .filter((note) => note.type === 'food' || note.type === 'service' || note.type === 'billing')
      .map((note) => ({
        description: note.content,
        quantity: 1,
        unitPrice: 0,
      }));
  },

  async create(dto: CreateInvoiceDto, createdBy: string): Promise<TableInvoice> {
    const table = await tableRepo.findById(dto.tableId);
    if (!table) throw new Error('TABLE_NOT_FOUND');
    if (table.status !== 'billing') throw new Error('TABLE_NOT_BILLING');
    if (!dto.items?.length) throw new Error('INVOICE_ITEMS_REQUIRED');

    const items = dto.items.map((item) => ({
      description: item.description.trim(),
      quantity: Math.max(1, Number(item.quantity) || 1),
      unitPrice: Math.max(0, Number(item.unitPrice) || 0),
    }));

    if (items.some((item) => !item.description)) {
      throw new Error('INVOICE_ITEMS_REQUIRED');
    }

    const { subtotal, tax, total } = calcTotals(items, dto.tax ?? 0);
    const now = new Date().toISOString();

    const sessionId = table.currentSessionId;
    const sessionNotes = sessionId
      ? await noteRepo.findByTable(table.id, sessionId)
      : [];

    const invoice = await store.transaction(async (invoices) => {
      const inv: TableInvoice = {
        id: uuidv4(),
        invoiceNumber: buildInvoiceNumber(invoices),
        tableId: table.id,
        tableLabel: table.label,
        sessionId,
        guestCount: table.currentSession?.guestCount ?? 0,
        items,
        notes: sessionNotes.map((note) => ({
          id: note.id,
          type: note.type,
          content: note.content,
          status: note.status,
          createdBy: note.createdBy,
          createdAt: note.createdAt,
        })),
        subtotal,
        tax,
        total,
        createdBy,
        createdAt: now,
      };

      invoices.push(inv);
      return { next: invoices, result: inv };
    });

    await tableRepo.closeTable(dto.tableId);
    return invoice;
  },
});

export type InvoiceRepository = ReturnType<typeof createInvoiceRepository>;
