import { useState } from "react";
import { Button } from "../../components/Button";
import { Dialog } from "../../components/Dialog";
import { FormField } from "../../components/FormField";
import { MoneyInput } from "../../components/MoneyInput";
import { TextInput } from "../../components/TextInput";
import { apiClient } from "../../lib/api-client";

export type ProductData = {
  id?: string;
  sku: string;
  name: string;
  description?: string;
  unit_price: string | number;
  is_active?: boolean;
};

type ProductFormDialogProps = {
  product?: ProductData | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function ProductFormDialog({
  product,
  open,
  onClose,
  onSuccess,
}: ProductFormDialogProps) {
  const [sku, setSku] = useState(product?.sku || "");
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [unitPrice, setUnitPrice] = useState<string | number>(
    product?.unit_price ?? "0.00"
  );
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setIsSubmitting(true);

    const payload = {
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim(),
      unit_price: String(unitPrice),
    };

    try {
      if (product?.id) {
        await apiClient.patch(`/api/products/${product.id}/`, payload);
      } else {
        await apiClient.post("/api/products/", payload);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errObj = err as { fields?: Record<string, string[]>; detail?: string };
      if (errObj.fields) {
        setFieldErrors(errObj.fields);
      }
      setError(errObj.detail || "Không thể lưu thông tin sản phẩm.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={product ? "Sửa sản phẩm" : "Tạo sản phẩm mới"}
    >
      <form onSubmit={handleSubmit} className="form-stack">
        {error && <div className="alert alert--error">{error}</div>}

        <FormField
          label="Mã SKU (Tự động in hoa)"
          htmlFor="sku"
          required
          error={fieldErrors.sku?.[0]}
        >
          <TextInput
            id="sku"
            value={sku}
            onChange={(e) => setSku(e.target.value.toUpperCase())}
            placeholder="VD: SRV-001"
            disabled={!!product}
          />
        </FormField>

        <FormField
          label="Tên sản phẩm"
          htmlFor="name"
          required
          error={fieldErrors.name?.[0]}
        >
          <TextInput
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên sản phẩm / dịch vụ"
          />
        </FormField>

        <FormField label="Mô tả" htmlFor="description" error={fieldErrors.description?.[0]}>
          <TextInput
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả ngắn gọn"
          />
        </FormField>

        <FormField
          label="Đơn giá (VNĐ)"
          htmlFor="unitPrice"
          required
          error={fieldErrors.unit_price?.[0]}
        >
          <MoneyInput
            id="unitPrice"
            value={String(unitPrice)}
            onValueChange={(val) => setUnitPrice(val)}
          />
        </FormField>

        <div className="dialog__actions">
          <Button type="button" variant="quiet" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {product ? "Lưu thay đổi" : "Tạo sản phẩm"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
