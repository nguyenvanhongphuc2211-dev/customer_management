import bcrypt from 'bcryptjs';
import type { JsonStore } from '../storage/jsonStore.js';
import type { UserRecord } from '../types/auth.types.js';

const DEV_ACCOUNTS: { email: string; password: string }[] = [
  { email: 'admin@crm.vn', password: 'admin123' },
  { email: 'staff@crm.vn', password: 'staff123' },
];

export async function ensureUsers(store: JsonStore<UserRecord[]>): Promise<void> {
  const users = await store.read();
  const passwordMap = new Map(DEV_ACCOUNTS.map((a) => [a.email, a.password]));

  let needsWrite = false;
  for (const user of users) {
    if (user.passwordHash === 'UNHASHED' || !user.passwordHash.startsWith('$2')) {
      const password = passwordMap.get(user.email);
      if (password) {
        user.passwordHash = await bcrypt.hash(password, 10);
        needsWrite = true;
      }
    }
  }

  if (needsWrite) {
    await store.write(users);
  }
}
