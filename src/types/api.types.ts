// ─────────────────────────────────────────────────────────────────────────────
//  Tipos que reflejan los modelos del backend (nest-api-starter)
// ─────────────────────────────────────────────────────────────────────────────

export type Role = 'USER' | 'ADMIN';

// ── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthTokenResponse {
  access_token: string;
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: Role;
}

// ── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  email: string;
  name: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
}

// ── Contact ───────────────────────────────────────────────────────────────────
export interface Contact {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  color: string | null;
  category: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: number | null;
  updatedBy: number | null;
}

export interface CreateContactPayload {
  name: string;
  email?: string;
  phone?: string;
  color?: string;
  category?: string;
}

export type UpdateContactPayload = Partial<CreateContactPayload>;
