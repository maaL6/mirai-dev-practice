/* ──────────────────────────────────────────────
 *  MoneyInput – decimal string input
 *  API sends/receives money as string "1250.00"
 * ────────────────────────────────────────────── */

import { useCallback } from "react";
import type { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  hasError?: boolean;
  onValueChange?: (value: string) => void;
};

export function MoneyInput({
  hasError,
  onValueChange,
  className = "",
  ...rest
}: Props) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Allow only digits, one dot, and up to 2 decimal places
      if (/^\d*\.?\d{0,2}$/.test(raw)) {
        onValueChange?.(raw);
      }
    },
    [onValueChange],
  );

  return (
    <div className="money-input-wrap">
      <span className="money-input-wrap__symbol" aria-hidden="true">
        $
      </span>
      <input
        type="text"
        inputMode="decimal"
        className={`text-input money-input ${hasError ? "text-input--error" : ""} ${className}`.trim()}
        onChange={handleChange}
        {...rest}
      />
    </div>
  );
}
