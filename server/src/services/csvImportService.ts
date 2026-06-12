import type { CustomerGroupRepository } from '../repositories/customerGroupRepository.js';
import type { CustomerRepository } from '../repositories/customerRepository.js';
import type { CustomerStatus } from '../types/customer.types.js';
import { csvToObjects, normalizeCsvRow } from '../utils/csvParser.js';

const VALID_STATUSES: CustomerStatus[] = ['active', 'inactive', 'potential', 'vip'];

const STATUS_MAP: Record<string, CustomerStatus> = {
  active: 'active',
  'hoạt động': 'active',
  'hoat dong': 'active',
  inactive: 'inactive',
  'ngừng hd': 'inactive',
  'ngung hd': 'inactive',
  potential: 'potential',
  'tiềm năng': 'potential',
  'tiem nang': 'potential',
  vip: 'vip',
};

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

export const createCsvImportService = (
  customerRepo: CustomerRepository,
  groupRepo: CustomerGroupRepository,
) => ({
  async importFromCsv(csvContent: string): Promise<ImportResult> {
    const rows = csvToObjects(csvContent).map(normalizeCsvRow);
    const groups = await groupRepo.findAll();
    const groupByName = new Map(groups.map((g) => [g.name.toLowerCase(), g.id]));

    const result: ImportResult = { imported: 0, skipped: 0, errors: [] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      const fullName = row.fullName?.trim();
      const email = row.email?.trim();
      const phone = row.phone?.trim();

      if (!fullName || !email || !phone) {
        result.errors.push({ row: rowNum, message: 'Thiếu Họ tên, Email hoặc SĐT' });
        result.skipped++;
        continue;
      }

      const groupName = row.groupName?.trim().toLowerCase();
      const groupId = groupName ? groupByName.get(groupName) : groups[0]?.id;

      if (!groupId) {
        result.errors.push({ row: rowNum, message: `Không tìm thấy nhóm "${row.groupName}"` });
        result.skipped++;
        continue;
      }

      const statusKey = (row.status?.trim().toLowerCase() ?? 'active');
      const status = STATUS_MAP[statusKey];
      if (!status || !VALID_STATUSES.includes(status)) {
        result.errors.push({ row: rowNum, message: `Trạng thái không hợp lệ: ${row.status}` });
        result.skipped++;
        continue;
      }

      try {
        await customerRepo.create({
          fullName,
          email,
          phone,
          company: row.company?.trim() || undefined,
          address: row.address?.trim() || undefined,
          status,
          groupId,
        });
        result.imported++;
      } catch (error) {
        const msg = (error as Error).message;
        if (msg === 'DUPLICATE_CUSTOMER') {
          result.errors.push({ row: rowNum, message: 'Email hoặc SĐT đã tồn tại' });
        } else {
          result.errors.push({ row: rowNum, message: 'Không thể tạo khách hàng' });
        }
        result.skipped++;
      }
    }

    return result;
  },
});
