/* ──────────────────────────────────────────────
 *  FilterBar – search + filter dropdowns
 * ────────────────────────────────────────────── */

import type { ReactNode } from "react";

type Props = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
};

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  children,
}: Props) {
  return (
    <div className="filter-bar">
      <div className="filter-bar__search">
        <span className="filter-bar__search-icon" aria-hidden="true">
          ⌕
        </span>
        <input
          type="search"
          className="filter-bar__search-input"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label="Search"
        />
      </div>
      {children && <div className="filter-bar__filters">{children}</div>}
    </div>
  );
}
