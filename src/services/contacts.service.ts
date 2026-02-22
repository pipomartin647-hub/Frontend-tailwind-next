import { api } from './api';
import { authService } from './auth.service';
import type { Contact, CreateContactPayload, UpdateContactPayload } from '@/types/api.types';

interface PaginatedContacts {
  data: Contact[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const contactsService = {
  async getAll(page = 1, limit = 20): Promise<PaginatedContacts> {
    return api.get<PaginatedContacts>(`/contacts?page=${page}&limit=${limit}`, authService.getToken() ?? undefined);
  },

  async getOne(id: number): Promise<Contact> {
    return api.get<Contact>(`/contacts/${id}`, authService.getToken() ?? undefined);
  },

  async create(data: CreateContactPayload): Promise<Contact> {
    return api.post<Contact>('/contacts', data, authService.getToken() ?? undefined);
  },

  async update(id: number, data: UpdateContactPayload): Promise<Contact> {
    return api.patch<Contact>(`/contacts/${id}`, data, authService.getToken() ?? undefined);
  },

  async remove(id: number): Promise<Contact> {
    return api.delete<Contact>(`/contacts/${id}`, authService.getToken() ?? undefined);
  },
};