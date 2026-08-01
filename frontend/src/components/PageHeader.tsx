/* ──────────────────────────────────────────────
 *  PageHeader – breadcrumb + title + actions
 * ────────────────────────────────────────────── */

import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumb?: { label: string; href?: string }[];
};

export function PageHeader({ title, subtitle, actions, breadcrumb }: Props) {
  return (
    <header className="page-header">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="page-header__breadcrumb" aria-label="Breadcrumb">
          {breadcrumb.map((item, i) => (
            <span key={i}>
              {item.href ? (
                <a href={item.href}>{item.label}</a>
              ) : (
                <span>{item.label}</span>
              )}
              {i < breadcrumb.length - 1 && (
                <span className="page-header__separator" aria-hidden="true">
                  /
                </span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="page-header__row">
        <div>
          <h1 className="page-header__title">{title}</h1>
          {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-header__actions">{actions}</div>}
      </div>
    </header>
  );
}
