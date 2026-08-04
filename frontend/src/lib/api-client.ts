/* ──────────────────────────────────────────────
 *  API client – single source of HTTP transport
 *
 *  • credentials: "include" for session cookie
 *  • CSRF token from cookie for mutations
 *  • Normalized ApiError on non-2xx responses
 *  • AbortSignal support on every request
 * ────────────────────────────────────────────── */

import { ApiRequestError, parseApiError } from "./api-error";

const BASE_URL: string =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

/** Callback invoked when a 401 is received – set by AuthProvider. */
let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(cb: (() => void) | null) {
  onUnauthorized = cb;
}

/* ── CSRF helper ── */

function getCsrfToken(): string {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="));
  return match ? match.split("=")[1] : "";
}

/* ── Core request ── */

type RequestOptions = {
  signal?: AbortSignal;
  params?: Record<string, string>;
};

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  let url = `${BASE_URL}${path}`;

  if (options?.params) {
    const qs = new URLSearchParams(options.params).toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  // CSRF token for state-changing methods
  if (method !== "GET") {
    const csrf = getCsrfToken();
    if (csrf) {
      headers["X-CSRFToken"] = csrf;
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: options?.signal,
  });

  if (response.status === 401) {
    onUnauthorized?.();
    throw new ApiRequestError(await parseApiError(response));
  }

  if (!response.ok) {
    throw new ApiRequestError(await parseApiError(response));
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/* ── Public methods ── */

export function apiGet<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>("GET", path, undefined, options);
}

export function apiPost<T>(
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  return request<T>("POST", path, body, options);
}

export function apiPatch<T>(
  path: string,
  body: unknown,
  options?: RequestOptions,
): Promise<T> {
  return request<T>("PATCH", path, body, options);
}

export function apiDelete<T = void>(
  path: string,
  options?: RequestOptions,
): Promise<T> {
  return request<T>("DELETE", path, undefined, options);
}
