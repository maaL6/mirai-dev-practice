/* ──────────────────────────────────────────────
 *  EmptyState – icon + message + CTA
 * ────────────────────────────────────────────── */

import type { ReactNode } from "react";

type Props = {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ icon = "◇", title, description, action }: Props) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">
        {icon}
      </span>
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__desc">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
