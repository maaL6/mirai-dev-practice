/* ──────────────────────────────────────────────
 *  Mock seed data – matches TV1 API contract
 *
 *  Password for ALL users: "local-demo-password"
 *  These are NEVER exposed in frontend code at runtime;
 *  they live only in the mock handler.
 * ────────────────────────────────────────────── */

import type { User } from "../lib/types";

export const MOCK_PASSWORD = "local-demo-password";

export const MOCK_USERS: User[] = [
  {
    id: "6b7b75e4-5798-48b7-bddb-cf097ee93e65",
    email: "admin@example.test",
    username: "admin",
    first_name: "System",
    last_name: "Admin",
    role: "admin",
    is_active: true,
  },
  {
    id: "a1c2d3e4-1111-2222-3333-444455556666",
    email: "manager@example.test",
    username: "manager",
    first_name: "Team",
    last_name: "Manager",
    role: "manager",
    is_active: true,
  },
  {
    id: "b2c3d4e5-2222-3333-4444-555566667777",
    email: "minh@example.test",
    username: "minh",
    first_name: "Minh",
    last_name: "Nguyen",
    role: "member",
    is_active: true,
  },
  {
    id: "c3d4e5f6-3333-4444-5555-666677778888",
    email: "lan@example.test",
    username: "lan",
    first_name: "Lan",
    last_name: "Tran",
    role: "member",
    is_active: true,
  },
  {
    id: "d4e5f6a7-4444-5555-6666-777788889999",
    email: "outsider@example.test",
    username: "outsider",
    first_name: "Out",
    last_name: "Sider",
    role: "member",
    is_active: true,
  },
];
