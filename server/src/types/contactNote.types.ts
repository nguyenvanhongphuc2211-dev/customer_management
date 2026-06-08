export type ContactNoteType = 'call' | 'email' | 'meeting' | 'note';

export interface ContactNote {
  id: string;
  customerId: string;
  type: ContactNoteType;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface CreateContactNoteDto {
  customerId: string;
  type: ContactNoteType;
  content: string;
  createdBy: string;
}
