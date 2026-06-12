import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate } from './middleware/auth.js';
import { createMenuRepository } from './repositories/menuRepository.js';
import { createInvoiceRepository } from './repositories/invoiceRepository.js';
import { createAuthRepository } from './repositories/authRepository.js';
import { createContactNoteRepository } from './repositories/contactNoteRepository.js';
import { createCustomerGroupRepository } from './repositories/customerGroupRepository.js';
import { createCustomerRepository } from './repositories/customerRepository.js';
import { createTableAreaRepository } from './repositories/tableAreaRepository.js';
import { createTableOrderRepository } from './repositories/tableOrderRepository.js';
import { createTableNoteRepository } from './repositories/tableNoteRepository.js';
import { createTableRepository } from './repositories/tableRepository.js';
import { createAnalyticsRoutes } from './routes/analytics.js';
import { createMenuRoutes } from './routes/menu.js';
import { createInvoiceRoutes } from './routes/invoices.js';
import { createAuthRoutes } from './routes/auth.js';
import { createUserRoutes } from './routes/users.js';
import { createBackupRoutes } from './routes/backup.js';
import { createContactNoteRoutes } from './routes/contactNotes.js';
import { createCustomerGroupRoutes } from './routes/customerGroups.js';
import { createCustomerRoutes } from './routes/customers.js';
import { createTableAreaRoutes } from './routes/tableAreas.js';
import { createTableNoteRoutes, createTableOrderRoutes, createTableRoutes } from './routes/tables.js';
import { ensureMenu } from './seed/ensureMenu.js';
import { ensureTables } from './seed/ensureTables.js';
import { ensureUsers } from './seed/ensureUsers.js';
import { createAnalyticsService } from './services/analyticsService.js';
import { createBackupService } from './services/backupService.js';
import { createCsvImportService } from './services/csvImportService.js';
import { JsonStore } from './storage/jsonStore.js';
import type { UserRecord } from './types/auth.types.js';
import type { MenuItem } from './types/menu.types.js';
import type { TableInvoice } from './types/invoice.types.js';
import type { ContactNote } from './types/contactNote.types.js';
import type { CustomerGroup, CustomerRecord } from './types/customer.types.js';
import type {
  RestaurantTable,
  TableArea,
  TableNote,
  TableOrder,
  TableSession,
} from './types/table.types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

const customerStore = new JsonStore<CustomerRecord[]>(path.join(DATA_DIR, 'customers.json'));
const groupStore = new JsonStore<CustomerGroup[]>(path.join(DATA_DIR, 'customer-groups.json'));
const userStore = new JsonStore<UserRecord[]>(path.join(DATA_DIR, 'users.json'));
const noteStore = new JsonStore<ContactNote[]>(path.join(DATA_DIR, 'contact-notes.json'));

const tableAreaStore = new JsonStore<TableArea[]>(path.join(DATA_DIR, 'table-areas.json'));
const tableStore = new JsonStore<RestaurantTable[]>(path.join(DATA_DIR, 'tables.json'));
const tableSessionStore = new JsonStore<TableSession[]>(path.join(DATA_DIR, 'table-sessions.json'));
const tableNoteStore = new JsonStore<TableNote[]>(path.join(DATA_DIR, 'table-notes.json'));
const invoiceStore = new JsonStore<TableInvoice[]>(path.join(DATA_DIR, 'table-invoices.json'));
const menuStore = new JsonStore<MenuItem[]>(path.join(DATA_DIR, 'menu.json'));
const tableOrderStore = new JsonStore<TableOrder[]>(path.join(DATA_DIR, 'table-orders.json'));

const groupRepo = createCustomerGroupRepository(groupStore);
const customerRepo = createCustomerRepository(customerStore, groupRepo);
const authRepo = createAuthRepository(userStore);
const noteRepo = createContactNoteRepository(noteStore, customerRepo);
const analyticsService = createAnalyticsService(customerRepo, groupRepo);
const backupService = createBackupService(DATA_DIR);
const csvImportService = createCsvImportService(customerRepo, groupRepo);

const tableAreaRepo = createTableAreaRepository(tableAreaStore);
const tableNoteRepo = createTableNoteRepository(tableNoteStore, tableStore);
const menuRepo = createMenuRepository(menuStore);
const orderRepo = createTableOrderRepository(
  tableOrderStore,
  tableStore,
  menuRepo,
  tableNoteRepo,
);
const tableRepo = createTableRepository(
  tableStore,
  tableSessionStore,
  tableAreaRepo,
  tableNoteRepo,
  orderRepo,
);
const invoiceRepo = createInvoiceRepository(invoiceStore, tableRepo, tableNoteRepo, orderRepo);

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', storage: 'json' });
});

app.use('/api/auth', createAuthRoutes(authRepo));

app.use('/api', authenticate);
app.use('/api/users', createUserRoutes(authRepo));
app.use('/api/customers', createCustomerRoutes(customerRepo, csvImportService));
app.use('/api/customer-groups', createCustomerGroupRoutes(groupRepo, customerRepo));
app.use('/api/contact-notes', createContactNoteRoutes(noteRepo));
app.use('/api/analytics', createAnalyticsRoutes(analyticsService));
app.use('/api/backup', createBackupRoutes(backupService));
app.use('/api/table-areas', createTableAreaRoutes(tableAreaRepo));
app.use('/api/tables', createTableRoutes(tableRepo, tableNoteRepo, orderRepo));
app.use('/api/table-notes', createTableNoteRoutes(tableNoteRepo, orderRepo));
app.use('/api/table-orders', createTableOrderRoutes(orderRepo));
app.use('/api/invoices', createInvoiceRoutes(invoiceRepo));
app.use('/api/menu', createMenuRoutes(menuRepo));

async function start() {
  await ensureUsers(userStore);
  await ensureMenu(menuStore);
  await ensureTables(tableAreaStore, tableStore);
  app.listen(PORT, () => {
    console.log(`CRM API running at http://localhost:${PORT}`);
    console.log(`Data stored in: ${DATA_DIR}`);
    console.log('Demo accounts: admin@crm.vn / admin123 | staff@crm.vn / staff123');
  });
}

start();
