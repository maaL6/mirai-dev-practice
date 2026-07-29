# Tài liệu dự án (Domain Docs)

Cách các kỹ năng phân tích mã nguồn đọc tài liệu dự án.

## Trước khi khám phá, hãy đọc:

- **`CONTEXT.md`** tại thư mục gốc
- **`docs/adr/`** — chứa các quyết định thiết kế kiến trúc (ADR) có liên quan đến khu vực mã nguồn chuẩn bị thao tác.

Nếu các file này không tồn tại, AI sẽ tiếp tục bỏ qua mà không tự ý đề xuất tạo mới. Kỹ năng `/domain-modeling` sẽ tự tạo chúng sau khi các thuật ngữ được thống nhất.

## Cấu trúc thư mục

Kho lưu trữ Một-ngữ-cảnh (Single-context repo) - cấu trúc hiện tại của dự án:

```
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-modular-monolith.md
│   └── ...
└── src/
```

## Sử dụng từ vựng chung

Khi định danh khái niệm (tên issue, refactor, tên test), hãy sử dụng thuật ngữ được định nghĩa trong `CONTEXT.md`. Nếu khái niệm chưa có trong danh mục, hãy ghi chú lại cho kỹ năng `/domain-modeling`.
