import { useEffect, useState } from "react";
import { Button } from "../../components/Button";
import { Dialog } from "../../components/Dialog";
import { FormField } from "../../components/FormField";
import { SelectInput } from "../../components/SelectInput";
import { TextInput } from "../../components/TextInput";
import { apiClient } from "../../lib/api-client";

type TaskFormDialogProps = {
  projectId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type UserItem = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

export function TaskFormDialog({
  projectId,
  open,
  onClose,
  onSuccess,
}: TaskFormDialogProps) {
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [status, setStatus] = useState("todo");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiClient
      .get<{ results: UserItem[] } | UserItem[]>("/api/users/")
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.results || [];
        setUsersList(list);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setIsSubmitting(true);

    const payload = {
      title: title.trim(),
      assignee: assignee || null,
      status,
      due_date: dueDate || null,
      description: description.trim(),
    };

    try {
      await apiClient.post(`/api/projects/${projectId}/tasks/`, payload);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errObj = err as { fields?: Record<string, string[]>; detail?: string };
      if (errObj.fields) {
        setFieldErrors(errObj.fields);
      }
      setError(errObj.detail || "Không thể tạo công việc.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Tạo công việc mới">
      <form onSubmit={handleSubmit} className="form-stack">
        {error && <div className="alert alert--error">{error}</div>}

        <FormField label="Tiêu đề công việc" htmlFor="task-title" required error={fieldErrors.title?.[0]}>
          <TextInput
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tên công việc cần thực hiện"
          />
        </FormField>

        <FormField label="Người thực hiện (Assignee)" htmlFor="task-assignee" error={fieldErrors.assignee?.[0]}>
          <SelectInput
            id="task-assignee"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            options={[
              { value: "", label: "-- Chưa phân công --" },
              ...usersList.map((u) => ({
                value: u.id,
                label: `${u.first_name} ${u.last_name} (${u.email})`,
              })),
            ]}
          />
        </FormField>

        <FormField label="Trạng thái" htmlFor="task-status" error={fieldErrors.status?.[0]}>
          <SelectInput
            id="task-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: "todo", label: "Cần làm (To Do)" },
              { value: "in_progress", label: "Đang làm (In Progress)" },
              { value: "done", label: "Hoàn thành (Done)" },
            ]}
          />
        </FormField>

        <FormField label="Hạn hoàn thành" htmlFor="task-due-date" error={fieldErrors.due_date?.[0]}>
          <TextInput
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </FormField>

        <FormField label="Mô tả" htmlFor="task-description" error={fieldErrors.description?.[0]}>
          <TextInput
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Chi tiết công việc"
          />
        </FormField>

        <div className="dialog__actions">
          <Button type="button" variant="quiet" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Tạo công việc
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
