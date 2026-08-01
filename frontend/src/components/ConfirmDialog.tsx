/* ──────────────────────────────────────────────
 *  ConfirmDialog – yes / cancel confirmation
 * ────────────────────────────────────────────── */

import { Button } from "./Button";
import { Dialog } from "./Dialog";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: "primary" | "destructive";
  loading?: boolean;
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  confirmVariant = "primary",
  loading = false,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      actions={
        <>
          <Button variant="quiet" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="confirm-dialog__message">{message}</p>
    </Dialog>
  );
}
