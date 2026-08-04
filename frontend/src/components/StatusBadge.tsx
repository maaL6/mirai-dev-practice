import type { ReactNode } from "react";

type StatusBadgeProps = {
  state: "checking" | "ready" | "offline" | string;
  label?: string;
  children?: ReactNode;
};

const defaultLabels: Record<string, string> = {
  checking: "Checking API",
  ready: "System ready",
  offline: "API offline",
};

export function StatusBadge({ state, label, children }: StatusBadgeProps) {
  const displayText = label ?? children ?? defaultLabels[state] ?? state;
  return (
    <span className={`status-badge status-badge--${state}`} role="status">
      <span className="status-badge__dot" aria-hidden="true" />
      {displayText}
    </span>
  );
}

