/* ──────────────────────────────────────────────
 *  Login page
 *
 *  Displays email + password form with:
 *  • Inline validation (required fields)
 *  • API error display (wrong password, disabled)
 *  • Demo account quick-fill buttons
 *  • Keyboard accessible (Enter to submit)
 * ────────────────────────────────────────────── */

import { useCallback, useState } from "react";
import type { FormEvent } from "react";

import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { FormField } from "../../components/FormField";
import { TextInput } from "../../components/TextInput";
import { isApiRequestError } from "../../lib/api-error";
import { useAuth } from "../../auth/AuthContext";

import "./LoginPage.css";

const DEMO_ACCOUNTS = [
  { email: "admin@example.test", label: "Admin", role: "admin" },
  { email: "manager@example.test", label: "Manager", role: "manager" },
  { email: "minh@example.test", label: "Minh", role: "member" },
  { email: "lan@example.test", label: "Lan", role: "member" },
  { email: "outsider@example.test", label: "Outsider", role: "member" },
];

export function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      setFieldErrors({});

      // Client-side validation
      const errs: Record<string, string[]> = {};
      if (!email.trim()) errs.email = ["Email is required."];
      if (!password) errs.password = ["Password is required."];

      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        return;
      }

      setLoading(true);
      try {
        await login({ email: email.trim(), password });
      } catch (err: unknown) {
        console.error("Login error:", err);
        if (isApiRequestError(err)) {
          if (err.error.fields) {
            setFieldErrors(err.error.fields);
          }
          setError(err.error.detail);
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    [email, password, login],
  );

  const fillDemo = useCallback((demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("local-demo-password");
    setError(null);
    setFieldErrors({});
  }, []);

  return (
    <div className="login-page">
      {/* ── Hero panel ── */}
      <div className="login-hero">
        <div className="login-hero__brand">
          <span className="login-hero__mark">M</span>
          <span>
            <strong>Mirai</strong>
            <small>Mini ERP</small>
          </span>
        </div>
        <h1>Built for teams that move fast.</h1>
        <p>
          A focused ERP platform for contacts, sales, projects and reporting
          — designed for learning, built for integration.
        </p>
      </div>

      {/* ── Form panel ── */}
      <div className="login-form-panel">
        <h2>Sign in</h2>
        <p>Enter your credentials to access the workspace.</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <Alert variant="error" onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}

          <FormField
            label="Email"
            htmlFor="login-email"
            error={fieldErrors.email}
            required
          >
            <TextInput
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.test"
              autoComplete="email"
              hasError={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
            />
          </FormField>

          <FormField
            label="Password"
            htmlFor="login-password"
            error={fieldErrors.password}
            required
          >
            <TextInput
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              hasError={!!fieldErrors.password}
              aria-describedby={
                fieldErrors.password ? "login-password-error" : undefined
              }
            />
          </FormField>

          <Button type="submit" variant="primary" loading={loading}>
            Sign in
          </Button>
        </form>

        {/* Demo quick-fill */}
        <div className="login-demo-hint">
          <span className="login-demo-hint__title">Quick demo access</span>
          <div className="login-demo-accounts">
            {DEMO_ACCOUNTS.map((acct) => (
              <button
                key={acct.email}
                type="button"
                className="login-demo-btn"
                onClick={() => fillDemo(acct.email)}
              >
                {acct.label}
                <span>{acct.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
