/* ──────────────────────────────────────────────
 *  Shared domain types – aligned with TV1 API contract
 * ────────────────────────────────────────────── */

export type UserRole = "admin" | "manager" | "member";

export type User = {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type CreateUserPayload = {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  password: string;
};

export type UpdateUserPayload = Partial<
  Omit<CreateUserPayload, "password"> & { is_active: boolean }
>;
