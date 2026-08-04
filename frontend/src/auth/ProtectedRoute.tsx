/* ──────────────────────────────────────────────
 *  ProtectedRoute – redirects to login when
 *  the user is not authenticated.
 * ────────────────────────────────────────────── */

import type { ReactNode } from "react";

import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { useAuth } from "./AuthContext";

type Props = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="protected-loading">
        <LoadingSkeleton lines={6} />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Will be handled by the router in App.tsx
    return null;
  }

  return <>{children}</>;
}
