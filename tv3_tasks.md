# Kế hoạch công việc - Thành viên 3 (TV3)

**Vai trò:** Frontend Customer/Contact và CRM foundation
**Người review:** TV6
**Mức ưu tiên:** P0 trước, P1 sau

---

## Tuần 2: Core Platform và Master Data

### 1. Mục tiêu chung
TV3 làm theo thứ tự: hoàn thành giao diện Customer/Contact trước, sau đó mới chuyển sang CRM.

### 2. Phần A — Frontend Customer/Contact (P0)

**Kết quả cần đạt:**
Người dùng có thể tạo, xem, sửa, tìm kiếm Customer và quản lý Contact trên giao diện.

**Công việc:**
- [ ] Bắt đầu bằng mock API theo contract của TV2.
- [ ] Làm trang `/contacts` hiển thị danh sách Customer.
- [ ] Làm tìm kiếm và bộ lọc active/kind.
- [ ] Làm trang tạo mới và chỉnh sửa bằng một form dùng chung.
- [ ] Làm trang chi tiết Customer và danh sách Contact.
- [ ] Làm form thêm/sửa Contact.
- [ ] Hiển thị rõ các trạng thái loading, không có dữ liệu, lỗi nhập liệu, 403 và lỗi chung.
- [ ] Khi API của TV2 sẵn sàng, thay mock bằng API thật và chạy lại test.

**Test tối thiểu (Checklist):**
- [ ] Danh sách hiển thị đúng dữ liệu.
- [ ] Form báo lỗi tại đúng field.
- [ ] Empty state và error state hiển thị đúng.
- [ ] Luồng tạo Customer và thêm Contact hoạt động với API thật.

---

### 3. Phần B — CRM foundation (P1)

**Kết quả cần đạt:**
Hệ thống có Stage và Opportunity cơ bản. Tuần này chỉ cần danh sách và form, chưa làm kanban.

**Công việc:**
- [ ] Tạo các Stage: New, Qualified, Proposal, Won và Lost.
- [ ] Tạo model/API `Opportunity` gồm Customer, Contact, Stage, owner và doanh thu dự kiến.
- [ ] Contact được chọn phải thuộc đúng Customer.
- [ ] Doanh thu dự kiến không được âm.
- [ ] Member không được tự đổi owner sang người khác.
- [ ] Làm giao diện `/crm` dạng bảng và form đơn giản.
- [ ] Hỗ trợ lọc theo Stage, owner và Customer.
- [ ] Không làm thao tác won/lost hoàn chỉnh trong tuần này.

**Test tối thiểu (Checklist):**
- [ ] Seed Stage chạy nhiều lần không tạo trùng.
- [ ] Contact khác Customer bị từ chối.
- [ ] Doanh thu âm bị từ chối.
- [ ] Member không đổi được owner.
- [ ] Không thể chuyển sang Won/Lost bằng PATCH thông thường.
- [ ] Danh sách chỉ trả Opportunity đúng quyền.

*(Ghi chú: Nếu tiến độ chậm, giữ lại model, API và test CRM; giao diện CRM có thể chuyển sang tuần sau.)*

---

### 4. Kế hoạch tích hợp & Pull Request (PR)

- **Ngày 1:** TV3 tạo mock API tương ứng dựa trên API contract, response mẫu và quy tắc lỗi từ TV2.
- **Ngày 2-3 (Làm song song):** Làm frontend bằng mock API. Mở PR nhỏ ngay khi có phần đầu tiên chạy được.
- **Ngày 4 (Tích hợp):** Thay mock Customer bằng API thật của TV2. Chạy test và sửa lỗi tích hợp.
- **Chia Pull Request:**
  - **PR đầu tiên:** Customer UI dùng mock API.
  - **PR tiếp theo:** Tích hợp API thật và CRM foundation.
- **Kịch bản Demo cuối tuần:** Trình bày việc tạo Customer, thêm Contact, tìm kiếm và tạo Opportunity.

---

## Tuần 3: (Dành cho việc mở rộng sau này)
*Các task của tuần tiếp theo sẽ được bổ sung tại đây khi có yêu cầu mới...*
