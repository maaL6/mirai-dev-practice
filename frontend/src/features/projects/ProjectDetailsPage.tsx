import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/AuthContext";

import { Button } from "../../components/Button";
import { Column, DataTable } from "../../components/DataTable";
import { PageHeader } from "../../components/PageHeader";
import { SelectInput } from "../../components/SelectInput";
import { StatusBadge } from "../../components/StatusBadge";
import { apiClient } from "../../lib/api-client";
import { TaskFormDialog } from "./TaskFormDialog";

type ProjectDetailsPageProps = {
  id?: string;
};

type TaskItem = {
  id: string;
  title: string;
  description?: string;
  status: string;
  completed_at?: string | null;
  assignee_detail?: { id: string; first_name: string; last_name: string };
};

type ProjectDetail = {
  id: string;
  name: string;
  status: string;
  start_date: string;
  due_date: string;
  description?: string;
  customer: string;
  customer_detail?: { id: string; name: string };
  manager: string;
  manager_detail?: { id: string; first_name: string; last_name: string };
  tasks?: TaskItem[];
};

export function ProjectDetailsPage({ id }: ProjectDetailsPageProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);

  const canManage = user?.role === "admin" || user?.role === "manager";

  const { data: project, isLoading, isError, error } = useQuery<ProjectDetail>({
    queryKey: ["project", id],
    queryFn: async () => {
      return apiClient.get<ProjectDetail>(`/api/projects/${id}/`);
    },
    enabled: !!id,
  });

  const { data: tasksData, isLoading: isTasksLoading } = useQuery<{ results: TaskItem[] } | TaskItem[]>({
    queryKey: ["project-tasks", id],
    queryFn: async () => {
      return apiClient.get<{ results: TaskItem[] } | TaskItem[]>(`/api/projects/${id}/tasks/`);
    },
    enabled: !!id,
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      return apiClient.patch(`/api/tasks/${taskId}/`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-tasks", id] });
      queryClient.invalidateQueries({ queryKey: ["project", id] });
    },
  });

  const tasks: TaskItem[] = Array.isArray(tasksData) ? tasksData : tasksData?.results || project?.tasks || [];

  const taskColumns: Column<TaskItem>[] = [
    {
      key: "title",
      header: "Công việc",
      render: (t: TaskItem) => (
        <div>
          <strong>{t.title}</strong>
          {t.description && (
            <div>
              <small style={{ color: "var(--text-muted)" }}>{t.description}</small>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "assignee",
      header: "Người thực hiện",
      render: (t: TaskItem) => (
        <span>
          {t.assignee_detail
            ? `${t.assignee_detail.first_name} ${t.assignee_detail.last_name}`
            : "-- Chưa gán --"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (t: TaskItem) => (
        <SelectInput
          value={t.status}
          onChange={(e) =>
            updateTaskStatusMutation.mutate({
              taskId: t.id,
              status: e.target.value,
            })
          }
          options={[
            { value: "todo", label: "To Do" },
            { value: "in_progress", label: "In Progress" },
            { value: "done", label: "Done" },
          ]}
          style={{ width: "130px", padding: "0.25rem 0.5rem" }}
        />
      ),
    },
    {
      key: "completed_at",
      header: "Thời gian hoàn thành",
      render: (t: TaskItem) => (
        <small style={{ color: "var(--text-muted)" }}>
          {t.completed_at
            ? new Date(t.completed_at).toLocaleString("vi-VN")
            : "--"}
        </small>
      ),
    },
  ];

  if (isLoading) {
    return <div style={{ padding: "2rem" }}>Đang tải chi tiết dự án...</div>;
  }

  if (isError || !project) {
    return (
      <div style={{ padding: "2rem" }}>
        <div className="alert alert--error">
          {(error as { detail?: string })?.detail || "Không tìm thấy dự án."}
        </div>
        <a href="#/projects" className="button button--quiet" style={{ marginTop: "1rem" }}>
          ← Quay lại danh sách
        </a>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={project.name}
        subtitle={`Dự án / Khách hàng: ${project.customer_detail?.name || ""}`}
        actions={
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <a href="#/projects" className="button button--quiet">
              ← Danh sách dự án
            </a>
            {canManage && (
              <Button variant="primary" onClick={() => setIsTaskDialogOpen(true)}>
                + Thêm công việc
              </Button>
            )}
          </div>
        }
      />

      <section className="section" style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            padding: "1.5rem",
            background: "var(--surface-color, #ffffff)",
            border: "1px solid var(--border-color, #e5e7eb)",
            borderRadius: "8px",
          }}
        >
          <div>
            <small style={{ color: "var(--text-muted)" }}>Trạng thái</small>
            <div>
              <StatusBadge state={project.status === "completed" ? "ready" : "checking"} />
            </div>
          </div>
          <div>
            <small style={{ color: "var(--text-muted)" }}>Quản lý dự án</small>
            <div>
              <strong>
                {project.manager_detail
                  ? `${project.manager_detail.first_name} ${project.manager_detail.last_name}`
                  : project.manager}
              </strong>
            </div>
          </div>
          <div>
            <small style={{ color: "var(--text-muted)" }}>Thời hạn</small>
            <div>
              <strong>
                {project.start_date} → {project.due_date}
              </strong>
            </div>
          </div>
        </div>

        {project.description && (
          <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>
            {project.description}
          </p>
        )}
      </section>

      <section className="section">
        <h3>Danh sách công việc (Tasks)</h3>
        {isTasksLoading ? (
          <div style={{ padding: "1rem" }}>Đang tải công việc...</div>
        ) : (
          <DataTable
            columns={taskColumns}
            data={tasks}
            rowKey={(t) => t.id}
            emptyMessage="Dự án này chưa có công việc nào."
          />
        )}
      </section>

      {isTaskDialogOpen && id && (
        <TaskFormDialog
          projectId={id}
          open={isTaskDialogOpen}
          onClose={() => setIsTaskDialogOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["project-tasks", id] });
            queryClient.invalidateQueries({ queryKey: ["project", id] });
          }}
        />
      )}
    </>
  );
}
