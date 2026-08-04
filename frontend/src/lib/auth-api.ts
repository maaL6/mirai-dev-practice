/* ──────────────────────────────────────────────
 *  Auth & user management API – TV1 contract
 * ────────────────────────────────────────────── */

import { apiGet, apiPatch, apiPost } from "./api-client";
import type {
  CreateUserPayload,
  LoginCredentials,
  PaginatedResponse,
  UpdateUserPayload,
  User,
} from "./types";

/* ── Authentication ── */

export function login(
  credentials: LoginCredentials,
  signal?: AbortSignal,
): Promise<User> {
  return apiPost<User>("/auth/login/", credentials, { signal });
}

export function logout(signal?: AbortSignal): Promise<void> {
  return apiPost<void>("/auth/logout/", undefined, { signal });
}

export function getMe(signal?: AbortSignal): Promise<User> {
  return apiGet<User>("/auth/me/", { signal });
}

/* ── User management (Admin only) ── */

export function listUsers(
  signal?: AbortSignal,
): Promise<PaginatedResponse<User>> {
  return apiGet<PaginatedResponse<User>>("/users/", { signal });
}

export function createUser(
  data: CreateUserPayload,
  signal?: AbortSignal,
): Promise<User> {
  return apiPost<User>("/users/", data, { signal });
}

export function updateUser(
  id: string,
  data: UpdateUserPayload,
  signal?: AbortSignal,
): Promise<User> {
  return apiPatch<User>(`/users/${id}/`, data, { signal });
}
