/* ──────────────────────────────────────────────
 *  Alert – info, success, warning, error
 * ────────────────────────────────────────────── */

import type { ReactNode } from "react";

type AlertVariant = "info" | "success" | "warning" | "error";

const icons: Record<AlertVariant, string> = {
  info: "ℹ",
  success: "✓",
  warning: "⚠",
  error: "✕",
};

type Props = {
  variant: AlertVariant;
  title?: string;
  children?: ReactNode;
  onDismiss?: () => void;
};

export function Alert({ variant, title, children, onDismiss }: Props) {
  return (
    <div className={`alert alert--${variant}`} role="alert">
      <span className="alert__icon" aria-hidden="true">
        {icons[variant]}
      </span>
      <div className="alert__body">
        {title && <strong className="alert__title">{title}</strong>}
        {children && <p className="alert__message">{children}</p>}
      </div>
      {onDismiss && (
        <button
          className="alert__dismiss"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}
