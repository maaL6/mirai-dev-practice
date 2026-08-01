/* ──────────────────────────────────────────────
 *  TextInput – text / email / password
 * ────────────────────────────────────────────── */

import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export function TextInput({ hasError, className = "", ...rest }: Props) {
  return (
    <input
      className={`text-input ${hasError ? "text-input--error" : ""} ${className}`.trim()}
      {...rest}
    />
  );
}
