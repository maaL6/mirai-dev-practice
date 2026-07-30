export type HealthStatus = {
  status: "ok";
  service: string;
  database: "ok";
  version: string;
};

export type UserInfo = {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: "admin" | "manager" | "member";
};

const API_URL = "/api";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCsrfToken(): string {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : "";
}

async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Include CSRF token for unsafe methods.
  const method = (options.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    headers["X-CSRFToken"] = getCsrfToken();
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
}

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

export async function login(
  email: string,
  password: string,
): Promise<UserInfo> {
  const response = await apiFetch("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const message =
      data?.detail ??
      data?.non_field_errors?.[0]?.detail ??
      "Đăng nhập thất bại.";
    throw new Error(message);
  }

  return response.json() as Promise<UserInfo>;
}

export async function logout(): Promise<void> {
  const response = await apiFetch("/auth/logout/", { method: "POST" });
  if (!response.ok) {
    throw new Error("Đăng xuất thất bại.");
  }
}

export async function getMe(signal?: AbortSignal): Promise<UserInfo> {
  const response = await apiFetch("/auth/me/", { signal });
  if (!response.ok) {
    throw new Error("Chưa đăng nhập.");
  }
  return response.json() as Promise<UserInfo>;
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export async function getHealth(signal?: AbortSignal): Promise<HealthStatus> {
  const response = await fetch(`${API_URL}/health/`, {
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Health request failed with ${response.status}`);
  }

  return response.json() as Promise<HealthStatus>;
}
