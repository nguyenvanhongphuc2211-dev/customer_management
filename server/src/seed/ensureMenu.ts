import type { JsonStore } from '../storage/jsonStore.js';
import type { MenuItem } from '../types/menu.types.js';

const DEFAULT_MENU: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Phở bò tái',
    price: 65000,
    description: 'Phở bò truyền thống, nước dùng trong, thịt bò tái',
    category: 'Món chính',
  },
  {
    name: 'Cơm tấm sườn bì chả',
    price: 55000,
    description: 'Cơm tấm Sài Gòn với sườn nướng, bì, chả trứng',
    category: 'Món chính',
  },
  {
    name: 'Bún chả Hà Nội',
    price: 60000,
    description: 'Bún tươi, chả nướng than, rau sống và nước mắm pha',
    category: 'Món chính',
  },
  {
    name: 'Gỏi cuốn tôm thịt',
    price: 45000,
    description: '4 cuốn / phần, kèm nước chấm tương đen',
    category: 'Khai vị',
  },
  {
    name: 'Canh chua cá lóc',
    price: 120000,
    description: 'Canh chua miền Nam, cá lóc đồng, dứa và me',
    category: 'Món chính',
  },
];

export async function ensureMenu(store: JsonStore<MenuItem[]>): Promise<void> {
  const items = await store.read();
  if (items.length > 0) return;

  const now = new Date().toISOString();
  await store.write(
    DEFAULT_MENU.map((item, index) => ({
      ...item,
      id: `menu-${String(index + 1).padStart(3, '0')}`,
      createdAt: now,
      updatedAt: now,
    })),
  );
}
