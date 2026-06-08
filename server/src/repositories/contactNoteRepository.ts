import { v4 as uuidv4 } from 'uuid';
import type { JsonStore } from '../storage/jsonStore.js';
import type { ContactNote, CreateContactNoteDto } from '../types/contactNote.types.js';
import type { CustomerRepository } from './customerRepository.js';

export const createContactNoteRepository = (
  store: JsonStore<ContactNote[]>,
  customerRepo: CustomerRepository,
) => ({
  async findByCustomerId(customerId: string): Promise<ContactNote[]> {
    const notes = await store.read();
    return notes
      .filter((n) => n.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async create(dto: CreateContactNoteDto): Promise<ContactNote> {
    const customer = await customerRepo.findById(dto.customerId);
    if (!customer) throw new Error('CUSTOMER_NOT_FOUND');

    const note: ContactNote = {
      id: uuidv4(),
      customerId: dto.customerId,
      type: dto.type,
      content: dto.content,
      createdBy: dto.createdBy,
      createdAt: new Date().toISOString(),
    };

    await store.transaction((notes) => {
      notes.push(note);
      return { next: notes, result: note };
    });

    await customerRepo.updateLastContact(dto.customerId, note.createdAt);
    return note;
  },

  async delete(id: string): Promise<boolean> {
    return store.transaction((notes) => {
      const filtered = notes.filter((n) => n.id !== id);
      if (filtered.length === notes.length) {
        return { next: notes, result: false };
      }
      return { next: filtered, result: true };
    });
  },
});

export type ContactNoteRepository = ReturnType<typeof createContactNoteRepository>;
