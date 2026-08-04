/* ──────────────────────────────────────────────
 *  User form dialog – create / edit user
 * ────────────────────────────────────────────── */

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Dialog } from "../../components/Dialog";
import { FormField } from "../../components/FormField";
import { SelectInput } from "../../components/SelectInput";
import { TextInput } from "../../components/TextInput";
import { isApiRequestError } from "../../lib/api-error";
import * as authApi from "../../lib/auth-api";
import type { User } from "../../lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** If provided, the dialog is in edit mode */
  user?: User | null;
};

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "member", label: "Member" },
];

export function UserFormDialog({ open, onClose, onSaved, user }: Props) {
  const isEdit = !!user;

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("member");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Populate form for edit
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmail(user.email);
       
      setUsername(user.username);
       
      setFirstName(user.first_name);
       
      setLastName(user.last_name);
       
      setRole(user.role);
       
      setPassword("");
    } else {
       
      setEmail("");
       
      setUsername("");
       
      setFirstName("");
       
      setLastName("");
       
      setRole("member");
       
      setPassword("");
    }
     
    setError(null);
     
    setFieldErrors({});
  }, [user, open]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      setFieldErrors({});

      // Client-side validation
      const errs: Record<string, string[]> = {};
      if (!email.trim()) errs.email = ["This field is required."];
      if (!username.trim()) errs.username = ["This field is required."];
      if (!firstName.trim()) errs.first_name = ["This field is required."];
      if (!lastName.trim()) errs.last_name = ["This field is required."];
      if (!isEdit && !password) errs.password = ["This field is required."];

      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        return;
      }

      setLoading(true);
      try {
        if (isEdit && user) {
          await authApi.updateUser(user.id, {
            email: email.trim(),
            username: username.trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            role: role as User["role"],
          });
        } else {
          await authApi.createUser({
            email: email.trim(),
            username: username.trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            role: role as User["role"],
            password,
          });
        }
        onSaved();
        onClose();
      } catch (err: unknown) {
        if (isApiRequestError(err)) {
          if (err.error.fields) setFieldErrors(err.error.fields);
          setError(err.error.detail);
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    },
    [email, username, firstName, lastName, role, password, isEdit, user, onSaved, onClose],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit User" : "Create User"}
      size="md"
      actions={
        <>
          <Button variant="quiet" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={(e) => handleSubmit(e as unknown as FormEvent)}
            loading={loading}
          >
            {isEdit ? "Save changes" : "Create user"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate id="user-form">
        {error && (
          <Alert variant="error" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 var(--space-4)" }}>
          <FormField
            label="First name"
            htmlFor="user-first-name"
            error={fieldErrors.first_name}
            required
          >
            <TextInput
              id="user-first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="System"
              hasError={!!fieldErrors.first_name}
            />
          </FormField>

          <FormField
            label="Last name"
            htmlFor="user-last-name"
            error={fieldErrors.last_name}
            required
          >
            <TextInput
              id="user-last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Admin"
              hasError={!!fieldErrors.last_name}
            />
          </FormField>
        </div>

        <FormField
          label="Email"
          htmlFor="user-email"
          error={fieldErrors.email}
          required
        >
          <TextInput
            id="user-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.test"
            hasError={!!fieldErrors.email}
          />
        </FormField>

        <FormField
          label="Username"
          htmlFor="user-username"
          error={fieldErrors.username}
          required
        >
          <TextInput
            id="user-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            hasError={!!fieldErrors.username}
          />
        </FormField>

        <FormField label="Role" htmlFor="user-role" error={fieldErrors.role} required>
          <SelectInput
            id="user-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={ROLE_OPTIONS}
            hasError={!!fieldErrors.role}
          />
        </FormField>

        {!isEdit && (
          <FormField
            label="Password"
            htmlFor="user-password"
            error={fieldErrors.password}
            required
          >
            <TextInput
              id="user-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              hasError={!!fieldErrors.password}
            />
          </FormField>
        )}
      </form>
    </Dialog>
  );
}
