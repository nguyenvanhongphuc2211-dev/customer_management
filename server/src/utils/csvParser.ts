export interface CsvRow {
  [key: string]: string;
}

export function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let current = '';
  let row: string[] = [];
  let inQuotes = false;

  const text = content.replace(/^\uFEFF/, '');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(current.trim());
      current = '';
    } else if (char === '\n' || (char === '\r' && next === '\n')) {
      row.push(current.trim());
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      current = '';
      if (char === '\r') i++;
    } else if (char !== '\r') {
      current += char;
    }
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    if (row.some((cell) => cell.length > 0)) rows.push(row);
  }

  return rows;
}

export function csvToObjects(content: string): CsvRow[] {
  const rows = parseCsv(content);
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((cells) => {
    const obj: CsvRow = {};
    headers.forEach((header, i) => {
      obj[header] = cells[i]?.trim() ?? '';
    });
    return obj;
  });
}

const HEADER_MAP: Record<string, string> = {
  'họ tên': 'fullName',
  'ho ten': 'fullName',
  fullname: 'fullName',
  'full name': 'fullName',
  email: 'email',
  'sđt': 'phone',
  sdt: 'phone',
  phone: 'phone',
  'số điện thoại': 'phone',
  'so dien thoai': 'phone',
  'công ty': 'company',
  'cong ty': 'company',
  company: 'company',
  'địa chỉ': 'address',
  'dia chi': 'address',
  address: 'address',
  'nhóm': 'groupName',
  'nhom': 'groupName',
  group: 'groupName',
  'nhóm kh': 'groupName',
  'trạng thái': 'status',
  'trang thai': 'status',
  status: 'status',
};

export function normalizeCsvRow(row: CsvRow): CsvRow {
  const normalized: CsvRow = {};
  for (const [key, value] of Object.entries(row)) {
    const mapped = HEADER_MAP[key.toLowerCase()] ?? key;
    normalized[mapped] = value;
  }
  return normalized;
}
