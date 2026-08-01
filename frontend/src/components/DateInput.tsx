/* ──────────────────────────────────────────────
 *  DateInput – YYYY-MM-DD format
 * ────────────────────────────────────────────── */

import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export function DateInput({ hasError, className = "", ...rest }: Props) {
  return (
    <input
      type="date"
      className={`text-input ${hasError ? "text-input--error" : ""} ${className}`.trim()}
      {...rest}
    />
  );
}
