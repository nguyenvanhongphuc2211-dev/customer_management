# CRM + Quản lý Nhà hàng

Hệ thống full-stack quản lý **khách hàng (CRM)** và **vận hành nhà hàng** (100 bàn), lưu trữ bằng **file JSON** (không cần cài database).

## Tính năng chính

### CRM
- Dashboard KH: tìm kiếm, lọc, sắp xếp, phân trang, thống kê
- CRUD khách hàng & nhóm (admin), soft delete, import/export CSV
- Lịch sử liên hệ, analytics, backup/khôi phục JSON, dark mode

### Nhà hàng
- Sơ đồ **100 bàn** (4 khu vực), mở/đóng bàn, đặt bàn trước
- **Order món** từ thực đơn → gửi xuống bếp (hủy order khi chưa làm)
- Gắn **khách CRM** khi mở bàn
- **Thực đơn** (admin/bếp trưởng: thêm, sửa, xóa món)
- **Yêu cầu bếp** — NV bếp xem, bếp trưởng đánh dấu xong
- **Thu ngân** — hóa đơn, in bill, lưu JSON; ghi chú bàn lưu kèm hóa đơn

### Phân quyền (5 vai trò)

| Vai trò | Quyền chính |
|---------|-------------|
| `admin` | Toàn quyền |
| `staff` | Phục vụ: sơ đồ bàn, order, đặt bàn, xem KH |
| `cashier` | Thu ngân: bàn thanh toán, hóa đơn |
| `kitchen` | Xem yêu cầu bếp |
| `head_chef` | Xem + hoàn thành yêu cầu, quản lý thực đơn |

## Tech stack

React · TypeScript · Vite · Tailwind · TanStack Query · React Hook Form · Zod · Axios · Express · Vitest

## Cài đặt & chạy

```bash
git clone https://github.com/nguyenvanhongphuc2211-dev/customer_management.git
cd customer_management
npm install
npm install --prefix server
npm run dev:all
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

## Tài khoản demo

| Email | Mật khẩu | Vai trò |
|-------|----------|---------|
| `admin@crm.vn` | `admin123` | Admin |
| `staff@crm.vn` | `staff123` | Nhân viên phục vụ |

Tạo thêm tài khoản (thu ngân, bếp, bếp trưởng) tại **Cài đặt → Quản lý tài khoản** (admin).

## Luồng vận hành

1. **Staff** mở bàn → order món từ thực đơn
2. **Bếp** nhận yêu cầu → **Bếp trưởng** đánh dấu xong
3. **Staff** chuyển bàn **Thanh toán**
4. **Thu ngân** lập hóa đơn → in bill → bàn tự **Dọn bàn**
5. **Staff** bấm **Bàn sẵn sàng** → **Trống** (xóa ghi chú/order cũ trên bàn)

## Scripts

| Lệnh | Chức năng |
|------|-----------|
| `npm run dev:all` | Chạy frontend + backend |
| `npm run build` | Build frontend |
| `npm run build --prefix server` | Build backend |
| `npm test` | Chạy unit test |

## Lưu ý deploy

- Đặt `JWT_SECRET` trong môi trường production
- Backup JSON trước khi import/restore hàng loạt
- Dữ liệu realtime: frontend tự refresh mỗi 5–10 giây (bếp, bàn, thu ngân)

## Tác giả

**Nguyễn Văn Hồng Phúc** — [GitHub](https://github.com/nguyenvanhongphuc2211-dev)

## License

MIT License
