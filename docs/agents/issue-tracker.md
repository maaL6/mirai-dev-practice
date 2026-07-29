# Trình theo dõi công việc (Issue tracker): Local Markdown

Các issue và tài liệu yêu cầu (PRD) cho kho lưu trữ này được lưu dưới dạng file markdown trong thư mục `.scratch/`.

## Các quy ước

- Mỗi tính năng một thư mục: `.scratch/<feature-slug>/`
- PRD là file: `.scratch/<feature-slug>/PRD.md`
- Các issue triển khai là: `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, đánh số từ `01`.
- Trạng thái đánh giá (Triage state) được ghi ở dòng `Status:` gần đầu mỗi file (xem `triage-labels.md`).
- Lịch sử bình luận và trao đổi được thêm vào cuối file, dưới tiêu đề `## Comments`.

## Khi một kỹ năng nói "publish to the issue tracker"

Tạo một file mới trong `.scratch/<feature-slug>/` (tạo thư mục nếu cần).

## Khi một kỹ năng nói "fetch the relevant ticket"

Đọc file tại đường dẫn được tham chiếu. Mặc định user sẽ truyền vào đường dẫn trực tiếp.
