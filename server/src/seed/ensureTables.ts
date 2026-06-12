import type { JsonStore } from '../storage/jsonStore.js';
import type { RestaurantTable, TableArea } from '../types/table.types.js';

const AREAS: TableArea[] = [
  { id: 'area-floor1', name: 'Tầng 1', description: 'Khu chính — 25 bàn', sortOrder: 1 },
  { id: 'area-floor2', name: 'Tầng 2', description: 'Khu gia đình — 25 bàn', sortOrder: 2 },
  { id: 'area-vip', name: 'VIP', description: 'Phòng riêng — 25 bàn', sortOrder: 3 },
  { id: 'area-garden', name: 'Sân vườn', description: 'Không gian mở — 25 bàn', sortOrder: 4 },
];

function generateTables(): RestaurantTable[] {
  const now = new Date().toISOString();
  const tables: RestaurantTable[] = [];
  let globalNumber = 1;

  for (const area of AREAS) {
    for (let i = 0; i < 25; i++) {
      tables.push({
        id: `table-${String(globalNumber).padStart(3, '0')}`,
        number: globalNumber,
        label: `B${globalNumber}`,
        areaId: area.id,
        capacity: area.id === 'area-vip' ? 8 : area.id === 'area-garden' ? 6 : 4,
        status: 'empty',
        currentSessionId: null,
        createdAt: now,
        updatedAt: now,
      });
      globalNumber++;
    }
  }

  return tables;
}

export async function ensureTables(
  areaStore: JsonStore<TableArea[]>,
  tableStore: JsonStore<RestaurantTable[]>,
): Promise<void> {
  const areas = await areaStore.read();
  if (areas.length === 0) {
    await areaStore.write(AREAS);
  }

  const tables = await tableStore.read();
  if (tables.length === 0) {
    await tableStore.write(generateTables());
  }
}
