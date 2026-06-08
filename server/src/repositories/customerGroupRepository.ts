import { v4 as uuidv4 } from 'uuid';
import { JsonStore } from '../storage/jsonStore.js';
import type {
  CreateCustomerGroupDto,
  CustomerGroup,
  UpdateCustomerGroupDto,
} from '../types/customer.types.js';

export const createCustomerGroupRepository = (store: JsonStore<CustomerGroup[]>) => ({
  async findAll(): Promise<CustomerGroup[]> {
    return store.read();
  },

  async findById(id: string): Promise<CustomerGroup | undefined> {
    const groups = await store.read();
    return groups.find((g) => g.id === id);
  },

  async create(dto: CreateCustomerGroupDto): Promise<CustomerGroup> {
    const groups = await store.read();
    const now = new Date().toISOString();
    const group: CustomerGroup = {
      id: uuidv4(),
      name: dto.name,
      description: dto.description,
      color: dto.color,
      createdAt: now,
      updatedAt: now,
    };
    groups.push(group);
    await store.write(groups);
    return group;
  },

  async update(id: string, dto: UpdateCustomerGroupDto): Promise<CustomerGroup | null> {
    const groups = await store.read();
    const index = groups.findIndex((g) => g.id === id);
    if (index === -1) return null;

    const updated: CustomerGroup = {
      ...groups[index],
      ...dto,
      updatedAt: new Date().toISOString(),
    };
    groups[index] = updated;
    await store.write(groups);
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    const groups = await store.read();
    const filtered = groups.filter((g) => g.id !== id);
    if (filtered.length === groups.length) return false;
    await store.write(filtered);
    return true;
  },
});

export type CustomerGroupRepository = ReturnType<typeof createCustomerGroupRepository>;
