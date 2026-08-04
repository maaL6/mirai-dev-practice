import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/AuthContext";

import { Button } from "../../components/Button";
import { Column, DataTable } from "../../components/DataTable";
import { FilterBar } from "../../components/FilterBar";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { apiClient } from "../../lib/api-client";
import { ProductData, ProductFormDialog } from "./ProductFormDialog";

export function ProductListPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("true");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);

  const canManage = user?.role === "admin" || user?.role === "manager";

  const { data, isLoading, isError, error } = useQuery<{ results: ProductData[] } | ProductData[]>({
    queryKey: ["products", search, activeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (activeFilter) params.append("active", activeFilter);
      return apiClient.get(`/api/products/?${params.toString()}`);
    },
  });

  const products: ProductData[] = Array.isArray(data) ? data : data?.results || [];

  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.post(`/api/products/${id}/deactivate/`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const columns: Column<ProductData>[] = [
    {
      key: "sku",
      header: "Mã SKU",
      render: (p: ProductData) => <strong>{p.sku}</strong>,
    },
    {
      key: "name",
      header: "Tên sản phẩm",
      render: (p: ProductData) => (
        <div>
          <div><strong>{p.name}</strong></div>
          {p.description && <small style={{ color: "var(--text-muted)" }}>{p.description}</small>}
        </div>
      ),
    },
    {
      key: "unit_price",
      header: "Đơn giá",
      render: (p: ProductData) => (
        <span>
          {Number(p.unit_price).toLocaleString("vi-VN")} VNĐ
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Trạng thái",
      render: (p: ProductData) => (
        <StatusBadge state={p.is_active ? "ready" : "offline"} />
      ),
    },
    ...(canManage
      ? [
          {
            key: "actions",
            header: "Thao tác",
            render: (p: ProductData) => (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Button
                  variant="quiet"
                  onClick={() => {
                    setEditingProduct(p);
                    setIsDialogOpen(true);
                  }}
                >
                  Sửa
                </Button>
                {p.is_active && (
                  <Button
                    variant="destructive"
                    onClick={() => deactivateMutation.mutate(p.id!)}
                  >
                    Tắt
                  </Button>
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <PageHeader
        title="Danh mục Sản phẩm"
        subtitle="Quản lý danh sách sản phẩm và đơn giá"
        actions={
          canManage ? (
            <Button
              variant="primary"
              onClick={() => {
                setEditingProduct(null);
                setIsDialogOpen(true);
              }}
            >
              + Tạo sản phẩm
            </Button>
          ) : undefined
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo SKU, tên sản phẩm..."
      >
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="select-input"
          style={{ width: "auto" }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang kinh doanh</option>
          <option value="false">Ngừng kinh doanh</option>
        </select>
      </FilterBar>

      {isError && (
        <div className="alert alert--error">
          {(error as { detail?: string })?.detail || "Không thể tải danh sách sản phẩm."}
        </div>
      )}

      {isLoading ? (
        <div style={{ padding: "2rem" }}>Đang tải danh sách sản phẩm...</div>
      ) : (
        <DataTable
          columns={columns}
          data={products}
          rowKey={(p) => p.id || p.sku}
          emptyMessage="Chưa có sản phẩm nào."
        />
      )}

      {isDialogOpen && (
        <ProductFormDialog
          product={editingProduct}
          open={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingProduct(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
          }}
        />
      )}
    </>
  );
}
