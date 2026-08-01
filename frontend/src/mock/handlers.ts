/* ──────────────────────────────────────────────
 *  Mock API handlers – simulate TV1 auth backend
 *
 *  Session state is kept in sessionStorage so a
 *  page refresh preserves the logged-in user.
 * ────────────────────────────────────────────── */

import type { User } from "../lib/types";
import { MOCK_PASSWORD, MOCK_USERS } from "./data";

const SESSION_KEY = "mock_auth_user_id";

/* ── helpers ── */


function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function getCurrentUser(): User | null {
  const id = sessionStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return getUsers().find((u) => u.id === id) ?? null;
}

/** Get the mutable users array (original seed + runtime-created users). */
function getUsers(): User[] {
  const extra = sessionStorage.getItem("mock_extra_users");
  const extras: User[] = extra ? JSON.parse(extra) : [];
  return [...MOCK_USERS, ...extras];
}

function saveExtraUser(user: User) {
  const extra = sessionStorage.getItem("mock_extra_users");
  const extras: User[] = extra ? JSON.parse(extra) : [];
  extras.push(user);
  sessionStorage.setItem("mock_extra_users", JSON.stringify(extras));
}

function updateUserInStore(id: string, patch: Partial<User>): User | null {
  // Check seed users
  const seedIdx = MOCK_USERS.findIndex((u) => u.id === id);
  if (seedIdx !== -1) {
    // We can't mutate the import, so store overrides
    const overrides: Record<string, Partial<User>> = JSON.parse(
      sessionStorage.getItem("mock_user_overrides") ?? "{}",
    );
    overrides[id] = { ...(overrides[id] ?? {}), ...patch };
    sessionStorage.setItem("mock_user_overrides", JSON.stringify(overrides));
    return { ...MOCK_USERS[seedIdx], ...overrides[id] };
  }

  // Check extra users
  const extra = sessionStorage.getItem("mock_extra_users");
  const extras: User[] = extra ? JSON.parse(extra) : [];
  const extraIdx = extras.findIndex((u) => u.id === id);
  if (extraIdx !== -1) {
    extras[extraIdx] = { ...extras[extraIdx], ...patch };
    sessionStorage.setItem("mock_extra_users", JSON.stringify(extras));
    return extras[extraIdx];
  }
  return null;
}

/** Apply stored overrides to seed users */
function getUserWithOverrides(user: User): User {
  const overrides: Record<string, Partial<User>> = JSON.parse(
    sessionStorage.getItem("mock_user_overrides") ?? "{}",
  );
  return overrides[user.id] ? { ...user, ...overrides[user.id] } : user;
}

function getAllUsers(): User[] {
  const extra = sessionStorage.getItem("mock_extra_users");
  const extras: User[] = extra ? JSON.parse(extra) : [];
  return [...MOCK_USERS.map(getUserWithOverrides), ...extras];
}

function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/* ── Route type ── */

type MockRoute = {
  method: string;
  pattern: RegExp;
  handler: (
    match: RegExpMatchArray,
    body: unknown,
  ) => Response | Promise<Response>;
};

/* ── Route definitions ── */

export const routes: MockRoute[] = [
  /* POST /api/auth/login/ */
  {
    method: "POST",
    pattern: /\/api\/auth\/login\/$/,
    handler: (_match, body) => {
      const { email, password } = body as {
        email?: string;
        password?: string;
      };

      if (!email || !password) {
        return json(
          { code: "validation_error", detail: "Email and password are required." },
          400,
        );
      }

      const user = getAllUsers().find(
        (u) => u.email === email && u.is_active,
      );

      if (!user || password !== MOCK_PASSWORD) {
        return json(
          {
            code: "invalid_credentials",
            detail: "Invalid email or password.",
          },
          400,
        );
      }

      // Check if user is inactive
      const full = getAllUsers().find((u) => u.email === email);
      if (full && !full.is_active) {
        return json(
          { code: "account_disabled", detail: "This account has been disabled." },
          403,
        );
      }

      sessionStorage.setItem(SESSION_KEY, user.id);
      return json(user);
    },
  },

  /* POST /api/auth/logout/ */
  {
    method: "POST",
    pattern: /\/api\/auth\/logout\/$/,
    handler: () => {
      sessionStorage.removeItem(SESSION_KEY);
      return json({ detail: "Logged out." });
    },
  },

  /* GET /api/auth/me/ */
  {
    method: "GET",
    pattern: /\/api\/auth\/me\/$/,
    handler: () => {
      const user = getCurrentUser();
      if (!user) {
        return json({ code: "not_authenticated", detail: "Authentication required." }, 401);
      }
      // Return with any overrides applied
      return json(getUserWithOverrides(user));
    },
  },

  /* GET /api/users/ */
  {
    method: "GET",
    pattern: /\/api\/users\/$/,
    handler: () => {
      const me = getCurrentUser();
      if (!me) return json({ code: "not_authenticated", detail: "Authentication required." }, 401);
      if (me.role !== "admin") return json({ code: "forbidden", detail: "Admin access required." }, 403);

      const users = getAllUsers();
      return json({
        count: users.length,
        next: null,
        previous: null,
        results: users,
      });
    },
  },

  /* POST /api/users/ */
  {
    method: "POST",
    pattern: /\/api\/users\/$/,
    handler: (_match, body) => {
      const me = getCurrentUser();
      if (!me) return json({ code: "not_authenticated", detail: "Authentication required." }, 401);
      if (me.role !== "admin") return json({ code: "forbidden", detail: "Admin access required." }, 403);

      const data = body as Record<string, unknown>;
      const errors: Record<string, string[]> = {};

      if (!data.email) errors.email = ["This field is required."];
      if (!data.username) errors.username = ["This field is required."];
      if (!data.first_name) errors.first_name = ["This field is required."];
      if (!data.last_name) errors.last_name = ["This field is required."];
      if (!data.password) errors.password = ["This field is required."];
      if (!data.role) errors.role = ["This field is required."];

      if (Object.keys(errors).length > 0) return json(errors, 400);

      // Check unique email
      if (getAllUsers().some((u) => u.email === data.email)) {
        return json({ email: ["A user with this email already exists."] }, 400);
      }

      const newUser: User = {
        id: uuid(),
        email: data.email as string,
        username: data.username as string,
        first_name: data.first_name as string,
        last_name: data.last_name as string,
        role: data.role as User["role"],
        is_active: true,
      };

      saveExtraUser(newUser);
      return json(newUser, 201);
    },
  },

  /* PATCH /api/users/{id}/ */
  {
    method: "PATCH",
    pattern: /\/api\/users\/([0-9a-f-]+)\/$/,
    handler: (match, body) => {
      const me = getCurrentUser();
      if (!me) return json({ code: "not_authenticated", detail: "Authentication required." }, 401);
      if (me.role !== "admin") return json({ code: "forbidden", detail: "Admin access required." }, 403);

      const userId = match[1];
      const data = body as Partial<User>;

      const updated = updateUserInStore(userId, data);
      if (!updated) {
        return json({ code: "not_found", detail: "User not found." }, 404);
      }

      return json(updated);
    },
  },

  /* GET /api/health/ */
  {
    method: "GET",
    pattern: /\/api\/health\/$/,
    handler: () =>
      json({
        status: "ok",
        service: "mirai-api",
        database: "ok",
        version: "0.1.0",
      }),
  },
];
