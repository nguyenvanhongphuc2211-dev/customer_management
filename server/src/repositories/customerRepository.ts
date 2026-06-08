import { v4 as uuidv4 } from 'uuid';
import type { JsonStore } from '../storage/jsonStore.js';
import type {
  BulkActionDto,
  CreateCustomerDto,
  Customer,
  CustomerGroup,
  CustomerRecord,
  CustomerStatus,
  GetCustomersParams,
  PaginatedResponse,
  UpdateCustomerDto,
} from '../types/customer.types.js';
import type { CustomerGroupRepository } from './customerGroupRepository.js';

const SORTABLE_FIELDS: (keyof CustomerRecord)[] = [
  'code',
  'fullName',
  'email',
  'phone',
  'status',
  'totalRevenue',
  'lastContactAt',
  'createdAt',
];

function toCustomer(record: CustomerRecord, group: CustomerGroup): Customer {
  const { groupId: _groupId, ...rest } = record;
  return { ...rest, group };
}

function generateCode(existing: CustomerRecord[]): string {
  const maxNum = existing.reduce((max, c) => {
    const match = c.code.match(/KH-(\d+)/);
    return match ? Math.max(max, parseInt(match[1], 10)) : max;
  }, 0);
  return `KH-${String(maxNum + 1).padStart(4, '0')}`;
}

function assertNoDuplicate(
  records: CustomerRecord[],
  email: string,
  phone: string,
  excludeId?: string,
): void {
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedPhone = phone.replace(/\s/g, '');
  const dup = records.find(
    (c) =>
      c.id !== excludeId &&
      (c.email.toLowerCase() === normalizedEmail || c.phone.replace(/\s/g, '') === normalizedPhone),
  );
  if (dup) throw new Error('DUPLICATE_CUSTOMER');
}

function filterRecords(records: CustomerRecord[], params: GetCustomersParams): CustomerRecord[] {
  let result = [...records];

  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.company?.toLowerCase().includes(q) ?? false),
    );
  }

  if (params.status) {
    result = result.filter((c) => c.status === params.status);
  }

  if (params.groupId) {
    result = result.filter((c) => c.groupId === params.groupId);
  }

  const sortBy = (params.sortBy ?? 'fullName') as keyof CustomerRecord;
  const sortField = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'fullName';
  const sortOrder = params.sortOrder === 'desc' ? -1 : 1;

  result.sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA === valB) return 0;
    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;
    if (valA < valB) return -1 * sortOrder;
    return 1 * sortOrder;
  });

  return result;
}

export const createCustomerRepository = (
  store: JsonStore<CustomerRecord[]>,
  groupRepo: CustomerGroupRepository,
) => ({
  async getAllRecords(): Promise<CustomerRecord[]> {
    return store.read();
  },

  async findAll(params: GetCustomersParams = {}): Promise<PaginatedResponse<Customer>> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 10));
    const groups = await groupRepo.findAll();
    const groupMap = new Map(groups.map((g) => [g.id, g]));

    const records = filterRecords(await store.read(), params);
    const total = records.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const paginated = records.slice(start, start + limit);

    const data = paginated
      .map((r) => {
        const group = groupMap.get(r.groupId);
        if (!group) return null;
        return toCustomer(r, group);
      })
      .filter((c): c is Customer => c !== null);

    return { data, total, page, limit, totalPages };
  },

  async findAllFiltered(params: GetCustomersParams = {}): Promise<Customer[]> {
    const groups = await groupRepo.findAll();
    const groupMap = new Map(groups.map((g) => [g.id, g]));
    return filterRecords(await store.read(), params)
      .map((r) => {
        const group = groupMap.get(r.groupId);
        return group ? toCustomer(r, group) : null;
      })
      .filter((c): c is Customer => c !== null);
  },

  async findById(id: string): Promise<Customer | null> {
    const records = await store.read();
    const record = records.find((c) => c.id === id);
    if (!record) return null;
    const group = await groupRepo.findById(record.groupId);
    if (!group) return null;
    return toCustomer(record, group);
  },

  async create(dto: CreateCustomerDto): Promise<Customer> {
    const group = await groupRepo.findById(dto.groupId);
    if (!group) throw new Error('GROUP_NOT_FOUND');

    return store.transaction((records) => {
      assertNoDuplicate(records, dto.email, dto.phone);
      const now = new Date().toISOString();
      const record: CustomerRecord = {
        id: uuidv4(),
        code: generateCode(records),
        fullName: dto.fullName.trim(),
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone.trim(),
        company: dto.company?.trim(),
        address: dto.address?.trim(),
        status: dto.status,
        groupId: dto.groupId,
        totalTransactions: 0,
        totalRevenue: 0,
        lastContactAt: dto.lastContactAt ?? now,
        createdAt: now,
        updatedAt: now,
      };
      records.push(record);
      return { next: records, result: toCustomer(record, group) };
    });
  },

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer | null> {
    const groups = await groupRepo.findAll();
    const groupMap = new Map(groups.map((g) => [g.id, g]));

    try {
      return await store.transaction((records) => {
        const index = records.findIndex((c) => c.id === id);
        if (index === -1) return { next: records, result: null };

        const email = dto.email?.trim().toLowerCase() ?? records[index].email;
        const phone = dto.phone?.trim() ?? records[index].phone;
        assertNoDuplicate(records, email, phone, id);

        let groupId = records[index].groupId;
        if (dto.groupId) {
          if (!groupMap.has(dto.groupId)) throw new Error('GROUP_NOT_FOUND');
          groupId = dto.groupId;
        }

        const group = groupMap.get(groupId);
        if (!group) return { next: records, result: null };

        const updated: CustomerRecord = {
          ...records[index],
          ...dto,
          email,
          phone,
          groupId,
          updatedAt: new Date().toISOString(),
        };
        records[index] = updated;
        return { next: records, result: toCustomer(updated, group) };
      });
    } catch (error) {
      if ((error as Error).message === 'GROUP_NOT_FOUND') throw error;
      throw error;
    }
  },

  async updateLastContact(id: string, lastContactAt: string): Promise<void> {
    await store.transaction((records) => {
      const index = records.findIndex((c) => c.id === id);
      if (index === -1) return { next: records, result: undefined };
      records[index].lastContactAt = lastContactAt;
      records[index].updatedAt = new Date().toISOString();
      return { next: records, result: undefined };
    });
  },

  async delete(id: string): Promise<boolean> {
    return store.transaction((records) => {
      const filtered = records.filter((c) => c.id !== id);
      if (filtered.length === records.length) {
        return { next: records, result: false };
      }
      return { next: filtered, result: true };
    });
  },

  async bulkAction(dto: BulkActionDto): Promise<{ affected: number }> {
    return store.transaction((records) => {
      let affected = 0;

      if (dto.action === 'delete') {
        const ids = new Set(dto.ids);
        const next = records.filter((c) => {
          if (ids.has(c.id)) {
            affected++;
            return false;
          }
          return true;
        });
        return { next, result: { affected } };
      }

      const now = new Date().toISOString();
      for (const record of records) {
        if (!dto.ids.includes(record.id)) continue;
        if (dto.action === 'updateStatus' && dto.status) {
          record.status = dto.status;
          record.updatedAt = now;
          affected++;
        }
        if (dto.action === 'updateGroup' && dto.groupId) {
          record.groupId = dto.groupId;
          record.updatedAt = now;
          affected++;
        }
      }

      return { next: records, result: { affected } };
    });
  },

  async countByGroup(groupId: string): Promise<number> {
    const records = await store.read();
    return records.filter((c) => c.groupId === groupId).length;
  },

  exportToCsv(customers: Customer[]): string {
    const headers = [
      'Mã KH',
      'Họ tên',
      'Email',
      'SĐT',
      'Công ty',
      'Nhóm',
      'Trạng thái',
      'Doanh thu',
      'Liên hệ gần nhất',
    ];
    const rows = customers.map((c) =>
      [
        c.code,
        c.fullName,
        c.email,
        c.phone,
        c.company ?? '',
        c.group.name,
        c.status,
        c.totalRevenue,
        c.lastContactAt,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(','),
    );
    return '\uFEFF' + [headers.join(','), ...rows].join('\n');
  },
});

export type CustomerRepository = ReturnType<typeof createCustomerRepository>;
