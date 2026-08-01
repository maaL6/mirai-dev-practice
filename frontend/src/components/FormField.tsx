/* ──────────────────────────────────────────────
 *  FormField – label + input slot + inline error
 * ────────────────────────────────────────────── */

import type { ReactNode } from "react";

type Props = {
  label: string;
  htmlFor: string;
  error?: string | string[];
  required?: boolean;
  children: ReactNode;
};

export function FormField({ label, htmlFor, error, required, children }: Props) {
  const errorId = `${htmlFor}-error`;
  const errors = error
    ? Array.isArray(error)
      ? error
      : [error]
    : [];

  return (
    <div className={`form-field ${errors.length ? "form-field--error" : ""}`}>
      <label className="form-field__label" htmlFor={htmlFor}>
        {label}
        {required && <span className="form-field__required" aria-hidden="true"> *</span>}
      </label>
      {children}
      {errors.length > 0 && (
        <p className="form-field__error" id={errorId} role="alert">
          {errors.join(" ")}
        </p>
      )}
    </div>
  );
}
