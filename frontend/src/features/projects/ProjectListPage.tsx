import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/AuthContext";

import { Button } from "../../components/Button";
import { Column, DataTable } from "../../components/DataTable";
import { FilterBar } from "../../components/FilterBar";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { apiClient } from "../../lib/api-client";
import { ProjectData, ProjectFormDialog } from "./ProjectFormDialog";

export type ProjectItem = {
  id: string;
  name: string;
  customer: string;
  customer_detail?: { id: string; name: string };
  manager: string;
  manager_detail?: { id: string; first_name: string; last_name: string };
  status: string;
  start_date: string;
  due_date: string;
  description?: string;
};

export function ProjectListPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);

  const canManage = user?.role === "admin" || user?.role === "manager";

  const { data, isLoading, isError, error } = useQuery<{ results: ProjectItem[] } | ProjectItem[]>({
    queryKey: ["projects", search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      return apiClient.get(`/api/projects/?${params.toString()}`);
    },
  });

  const projects: ProjectItem[] = Array.isArray(data) ? data : data?.results || [];

  const columns: Column<ProjectItem>[] = [
    {
      key: "name",
      header: "Tên dự án",
      render: (p: ProjectItem) => (
        <a href={`#/projects/${p.id}`} style={{ fontWeight: 600, color: "var(--brand-color, #2563eb)" }}>
          {p.name}
        </a>
      ),
    },
    {
      key: "customer",
      header: "Khách hàng",
      render: (p: ProjectItem) => <span>{p.customer_detail?.name || p.customer}</span>,
    },
    {
      key: "manager",
      header: "Quản lý dự án",
      render: (p: ProjectItem) => (
        <span>
          {p.manager_detail
            ? `${p.manager_detail.first_name} ${p.manager_detail.last_name}`
            : p.manager}
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (p: ProjectItem) => {
        const stateMap: Record<string, "ready" | "checking" | "offline"> = {
          planning: "checking",
          in_progress: "ready",
          completed: "ready",
          on_hold: "offline",
          cancelled: "offline",
        };
        return (
          <StatusBadge state={stateMap[p.status] || "checking"} />
        );
      },
    },
    {
      key: "dates",
      header: "Thời gian",
      render: (p: ProjectItem) => (
        <small style={{ color: "var(--text-muted)" }}>
          {p.start_date} → {p.due_date}
        </small>
      ),
    },
    ...(canManage
      ? [
          {
            key: "actions",
            header: "Thao tác",
            render: (p: ProjectItem) => (
              <Button
                variant="quiet"
                onClick={() => {
                  setEditingProject({
                    id: p.id,
                    name: p.name,
                    customer: p.customer,
                    status: p.status,
                    start_date: p.start_date,
                    due_date: p.due_date,
                    description: p.description,
                  });
                  setIsDialogOpen(true);
                }}
              >
                Sửa
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <PageHeader
        title="Danh sách Dự án"
        subtitle="Quản lý dự án và công việc phân công"
        actions={
          canManage ? (
            <Button
              variant="primary"
              onClick={() => {
                setEditingProject(null);
                setIsDialogOpen(true);
              }}
            >
              + Tạo dự án
            </Button>
          ) : undefined
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm tên dự án..."
      >
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="select-input"
          style={{ width: "auto" }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="planning">Planning</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </FilterBar>

      {isError && (
        <div className="alert alert--error">
          {(error as { detail?: string })?.detail || "Không thể tải danh sách dự án."}
        </div>
      )}

      {isLoading ? (
        <div style={{ padding: "2rem" }}>Đang tải danh sách dự án...</div>
      ) : (
        <DataTable
          columns={columns}
          data={projects}
          rowKey={(p) => p.id}
          emptyMessage="Chưa có dự án nào."
        />
      )}

      {isDialogOpen && (
        <ProjectFormDialog
          project={editingProject}
          open={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingProject(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
          }}
        />
      )}
    </>
  );
}
