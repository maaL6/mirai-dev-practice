import { useEffect, useState } from "react";
import { Button } from "../../components/Button";
import { Dialog } from "../../components/Dialog";
import { FormField } from "../../components/FormField";
import { SelectInput } from "../../components/SelectInput";
import { TextInput } from "../../components/TextInput";
import { apiClient } from "../../lib/api-client";

export type ProjectData = {
  id?: string;
  name: string;
  customer: string;
  status: string;
  start_date: string;
  due_date: string;
  description?: string;
};

type ProjectFormDialogProps = {
  project?: ProjectData | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function ProjectFormDialog({
  project,
  open,
  onClose,
  onSuccess,
}: ProjectFormDialogProps) {
  const [name, setName] = useState(project?.name || "");
  const [customer, setCustomer] = useState(project?.customer || "");
  const [status, setStatus] = useState(project?.status || "planning");
  const [startDate, setStartDate] = useState(
    () => project?.start_date || new Date().toISOString().slice(0, 10)
  );
  const [dueDate, setDueDate] = useState(
    () => project?.due_date || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  );
  const [description, setDescription] = useState(project?.description || "");

  const [customersList, setCustomersList] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiClient
      .get<{ results: { id: string; name: string }[] } | { id: string; name: string }[]>("/api/customers/")
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.results || [];
        setCustomersList(list);
        if (list.length > 0) {
          setCustomer((prev) => prev || list[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setIsSubmitting(true);

    const payload = {
      name: name.trim(),
      customer,
      status,
      start_date: startDate,
      due_date: dueDate,
      description: description.trim(),
    };

    try {
      if (project?.id) {
        await apiClient.patch(`/api/projects/${project.id}/`, payload);
      } else {
        await apiClient.post("/api/projects/", payload);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errObj = err as { fields?: Record<string, string[]>; detail?: string };
      if (errObj.fields) {
        setFieldErrors(errObj.fields);
      }
      setError(errObj.detail || "Không thể lưu thông tin dự án.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={project ? "Sửa dự án" : "Tạo dự án mới"}
    >
      <form onSubmit={handleSubmit} className="form-stack">
        {error && <div className="alert alert--error">{error}</div>}

        <FormField label="Tên dự án" htmlFor="proj-name" required error={fieldErrors.name?.[0]}>
          <TextInput
            id="proj-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên dự án"
          />
        </FormField>

        <FormField label="Khách hàng" htmlFor="proj-customer" required error={fieldErrors.customer?.[0]}>
          <SelectInput
            id="proj-customer"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            options={customersList.map((c) => ({ value: c.id, label: c.name }))}
          />
        </FormField>

        <FormField label="Trạng thái" htmlFor="proj-status" error={fieldErrors.status?.[0]}>
          <SelectInput
            id="proj-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: "planning", label: "Lập kế hoạch (Planning)" },
              { value: "in_progress", label: "Đang thực hiện (In Progress)" },
              { value: "completed", label: "Hoàn thành (Completed)" },
              { value: "on_hold", label: "Tạm dừng (On Hold)" },
              { value: "cancelled", label: "Đã hủy (Cancelled)" },
            ]}
          />
        </FormField>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <FormField label="Ngày bắt đầu" htmlFor="proj-start-date" required error={fieldErrors.start_date?.[0]}>
            <TextInput
              id="proj-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </FormField>

          <FormField label="Ngày kết thúc" htmlFor="proj-due-date" required error={fieldErrors.due_date?.[0]}>
            <TextInput
              id="proj-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Mô tả" htmlFor="proj-description" error={fieldErrors.description?.[0]}>
          <TextInput
            id="proj-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả ngắn gọn về dự án"
          />
        </FormField>

        <div className="dialog__actions">
          <Button type="button" variant="quiet" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {project ? "Lưu thay đổi" : "Tạo dự án"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
