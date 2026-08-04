/* ──────────────────────────────────────────────
 *  User Management page — Admin only
 *
 *  Lists all users, allows create/edit.
 *  Wrapped in RequireRole(["admin"]) by the router.
 * ────────────────────────────────────────────── */

import { useCallback, useEffect, useState } from "react";

import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { DataTable } from "../../components/DataTable";
import type { Column } from "../../components/DataTable";
import { FilterBar } from "../../components/FilterBar";
import { LoadingSkeleton } from "../../components/LoadingSkeleton";
import { PageHeader } from "../../components/PageHeader";
import { isApiRequestError } from "../../lib/api-error";
import * as authApi from "../../lib/auth-api";
import type { User } from "../../lib/types";
import { UserFormDialog } from "./UserFormDialog";

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.listUsers();
      const list = Array.isArray(res) ? res : (res as any)?.results || [];
      setUsers(list);
    } catch (err: unknown) {
      if (isApiRequestError(err)) {
        setError(err.error.detail);
      } else {
        setError("Failed to load users.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.first_name.toLowerCase().includes(q) ||
      u.last_name.toLowerCase().includes(q)
    );
  });

  const openCreate = useCallback(() => {
    setEditingUser(null);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  }, []);

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Name",
      render: (u) => (
        <span style={{ fontWeight: 550 }}>
          {u.first_name} {u.last_name}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (u) => <span style={{ color: "var(--color-ink-muted)" }}>{u.email}</span>,
    },
    {
      key: "username",
      header: "Username",
      render: (u) => u.username,
    },
    {
      key: "role",
      header: "Role",
      width: "7rem",
      render: (u) => <span className={`role-badge role-badge--${u.role}`}>{u.role}</span>,
    },
    {
      key: "status",
      header: "Status",
      width: "6rem",
      render: (u) => (
        <span className={`active-badge active-badge--${u.is_active ? "yes" : "no"}`}>
          <span className="active-badge__dot" />
          {u.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "5rem",
      render: (u) => (
        <Button variant="quiet" className="btn--sm" onClick={() => openEdit(u)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Users"
        subtitle={`${users.length} user${users.length !== 1 ? "s" : ""} in the system`}
        actions={
          <Button variant="primary" onClick={openCreate}>
            + New user
          </Button>
        }
      />

      {error && (
        <Alert variant="error" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search users by name, email…"
      />

      {loading ? (
        <LoadingSkeleton variant="table-row" lines={5} />
      ) : (
        <DataTable
          columns={columns}
          data={filteredUsers}
          rowKey={(u) => u.id}
          emptyMessage="No users found."
        />
      )}

      <UserFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={fetchUsers}
        user={editingUser}
      />
    </>
  );
}
