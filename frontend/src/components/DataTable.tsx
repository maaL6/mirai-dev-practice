/* ──────────────────────────────────────────────
 *  DataTable – sortable table with pagination
 * ────────────────────────────────────────────── */

import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** column width CSS value */
  width?: string;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  /** total count for pagination display */
  totalCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  emptyMessage?: string;
};

export function DataTable<T>({
  columns,
  data,
  rowKey,
  totalCount,
  currentPage = 1,
  onPageChange,
  pageSize = 20,
  emptyMessage = "No data to display.",
}: Props<T>) {
  const total = totalCount ?? data.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="data-table__empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((col) => (
                  <td key={col.key}>{col.render(row)}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && onPageChange && (
        <div className="data-table__pagination">
          <button
            className="btn btn--quiet btn--sm"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            ← Previous
          </button>
          <span className="data-table__page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn--quiet btn--sm"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
