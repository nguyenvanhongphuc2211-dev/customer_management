import fs from 'fs/promises';
import path from 'path';

const DATA_FILES = [
  'customers.json',
  'customer-groups.json',
  'contact-notes.json',
  'users.json',
  'table-areas.json',
  'tables.json',
  'table-sessions.json',
  'table-notes.json',
  'table-invoices.json',
  'menu.json',
  'table-orders.json',
];

export const createBackupService = (dataDir: string) => {
  const backupDir = path.join(dataDir, 'backups');

  const ensureBackupDir = async () => {
    await fs.mkdir(backupDir, { recursive: true });
  };

  return {
    async createBackup(): Promise<string> {
      await ensureBackupDir();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const folder = path.join(backupDir, timestamp);
      await fs.mkdir(folder, { recursive: true });

      for (const file of DATA_FILES) {
        const src = path.join(dataDir, file);
        try {
          await fs.copyFile(src, path.join(folder, file));
        } catch {
          // skip missing files
        }
      }

      return timestamp;
    },

    async listBackups(): Promise<{ id: string; createdAt: string; files: string[] }[]> {
      await ensureBackupDir();
      const entries = await fs.readdir(backupDir, { withFileTypes: true });
      const folders = entries.filter((e) => e.isDirectory()).map((e) => e.name);

      const backups = await Promise.all(
        folders.map(async (id) => {
          const folder = path.join(backupDir, id);
          const files = await fs.readdir(folder);
          return {
            id,
            createdAt: id.replace(/-/g, (m, i) => (i < 10 ? '-' : i < 13 ? ':' : '.')),
            files,
          };
        }),
      );

      return backups.sort((a, b) => b.id.localeCompare(a.id));
    },

    async restoreBackup(backupId: string): Promise<void> {
      const folder = path.join(backupDir, backupId);
      const stat = await fs.stat(folder).catch(() => null);
      if (!stat?.isDirectory()) throw new Error('BACKUP_NOT_FOUND');

      for (const file of DATA_FILES) {
        const src = path.join(folder, file);
        try {
          await fs.copyFile(src, path.join(dataDir, file));
        } catch {
          // skip
        }
      }
    },
  };
};
