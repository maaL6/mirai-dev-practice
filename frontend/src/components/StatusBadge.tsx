type StatusBadgeProps = {
  state: "checking" | "ready" | "offline";
};

const labels: Record<StatusBadgeProps["state"], string> = {
  checking: "Checking API",
  ready: "System ready",
  offline: "API offline",
};

export function StatusBadge({ state }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${state}`} role="status">
      <span className="status-badge__dot" aria-hidden="true" />
      {labels[state]}
    </span>
  );
}
