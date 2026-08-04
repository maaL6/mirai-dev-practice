/* ──────────────────────────────────────────────
 *  Button – primary, secondary, quiet, destructive
 * ────────────────────────────────────────────── */

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "quiet" | "destructive";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: ReactNode;
};

export function Button({
  variant = "primary",
  loading = false,
  icon,
  children,
  disabled,
  className = "",
  ...rest
}: Props) {
  return (
    <button
      className={`btn btn--${variant} ${loading ? "btn--loading" : ""} ${className}`.trim()}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {icon && !loading && <span className="btn__icon">{icon}</span>}
      {children}
    </button>
  );
}
