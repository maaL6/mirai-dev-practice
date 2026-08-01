/* ──────────────────────────────────────────────
 *  RequireRole – renders children only when the
 *  current user has one of the allowed roles.
 *  Otherwise shows a 403 Forbidden page.
 * ────────────────────────────────────────────── */

import type { ReactNode } from "react";

import { Alert } from "../components/Alert";
import type { UserRole } from "../lib/types";
import { useAuth } from "./AuthContext";

type Props = {
  roles: UserRole[];
  children: ReactNode;
};

export function RequireRole({ roles, children }: Props) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return (
      <div className="forbidden-page">
        <Alert variant="error" title="Access denied">
          You do not have permission to view this page. This area is restricted
          to {roles.join(" or ")} users.
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
