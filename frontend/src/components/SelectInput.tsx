/* ──────────────────────────────────────────────
 *  SelectInput – native select wrapper
 * ────────────────────────────────────────────── */

import type { SelectHTMLAttributes } from "react";

export type SelectOption = {
  value: string;
  label: string;
};

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  options: SelectOption[];
  placeholder?: string;
  hasError?: boolean;
};

export function SelectInput({
  options,
  placeholder,
  hasError,
  className = "",
  ...rest
}: Props) {
  return (
    <select
      className={`select-input ${hasError ? "select-input--error" : ""} ${className}`.trim()}
      {...rest}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
