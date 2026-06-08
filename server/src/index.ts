import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate } from './middleware/auth.js';
import { createAuthRepository } from './repositories/authRepository.js';
import { createContactNoteRepository } from './repositories/contactNoteRepository.js';
import { createCustomerGroupRepository } from './repositories/customerGroupRepository.js';
import { createCustomerRepository } from './repositories/customerRepository.js';
import { createAnalyticsRoutes } from './routes/analytics.js';
import { createAuthRoutes } from './routes/auth.js';
import { createBackupRoutes } from './routes/backup.js';
import { createContactNoteRoutes } from './routes/contactNotes.js';
import { createCustomerGroupRoutes } from './routes/customerGroups.js';
import { createCustomerRoutes } from './routes/customers.js';
import { ensureUsers } from './seed/ensureUsers.js';
import { createAnalyticsService } from './services/analyticsService.js';
import { createBackupService } from './services/backupService.js';
import { JsonStore } from './storage/jsonStore.js';
import type { UserRecord } from './types/auth.types.js';
import type { ContactNote } from './types/contactNote.types.js';
import type { CustomerGroup, CustomerRecord } from './types/customer.types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

const customerStore = new JsonStore<CustomerRecord[]>(path.join(DATA_DIR, 'customers.json'));
const groupStore = new JsonStore<CustomerGroup[]>(path.join(DATA_DIR, 'customer-groups.json'));
const userStore = new JsonStore<UserRecord[]>(path.join(DATA_DIR, 'users.json'));
const noteStore = new JsonStore<ContactNote[]>(path.join(DATA_DIR, 'contact-notes.json'));

const groupRepo = createCustomerGroupRepository(groupStore);
const customerRepo = createCustomerRepository(customerStore, groupRepo);
const authRepo = createAuthRepository(userStore);
const noteRepo = createContactNoteRepository(noteStore, customerRepo);
const analyticsService = createAnalyticsService(customerRepo, groupRepo);
const backupService = createBackupService(DATA_DIR);

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', storage: 'json' });
});

app.use('/api/auth', createAuthRoutes(authRepo));

app.use('/api', authenticate);
app.use('/api/customers', createCustomerRoutes(customerRepo));
app.use('/api/customer-groups', createCustomerGroupRoutes(groupRepo, customerRepo));
app.use('/api/contact-notes', createContactNoteRoutes(noteRepo));
app.use('/api/analytics', createAnalyticsRoutes(analyticsService));
app.use('/api/backup', createBackupRoutes(backupService));

async function start() {
  await ensureUsers(userStore);
  app.listen(PORT, () => {
    console.log(`CRM API running at http://localhost:${PORT}`);
    console.log(`Data stored in: ${DATA_DIR}`);
    console.log('Demo accounts: admin@crm.vn / admin123 | staff@crm.vn / staff123');
  });
}

start();
