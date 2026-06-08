# CRM Customer Management

Hệ thống quản lý khách hàng (CRM) được xây dựng bằng React, TypeScript và Vite nhằm hỗ trợ doanh nghiệp quản lý thông tin khách hàng một cách hiệu quả, trực quan và dễ sử dụng.

---

## 🚀 Tính năng chính

### Quản lý khách hàng

- Xem danh sách khách hàng
- Thêm khách hàng mới
- Chỉnh sửa thông tin khách hàng
- Xóa khách hàng
- Tìm kiếm khách hàng

### Xác thực dữ liệu

- Kiểm tra dữ liệu đầu vào bằng Zod
- Quản lý form với React Hook Form

### Quản lý API

- Gọi API bằng Axios
- Caching và quản lý trạng thái dữ liệu với React Query

### Điều hướng

- Routing với React Router DOM

### Kiểm thử

- Unit Test bằng Vitest
- Testing Library cho React Components

---

## 🛠️ Công nghệ sử dụng

| Công nghệ | Mục đích |
|------------|------------|
| React 19 | Xây dựng giao diện |
| TypeScript | Kiểm tra kiểu dữ liệu |
| Vite | Build & Development |
| React Router DOM | Điều hướng |
| React Hook Form | Quản lý form |
| Zod | Validate dữ liệu |
| Axios | Giao tiếp API |
| React Query | Quản lý dữ liệu bất đồng bộ |
| TailwindCSS | Styling |
| Vitest | Unit Testing |

---

## 📂 Cấu trúc dự án

```bash
crm-customer-management/
│
├── public/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── routes/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
│
├── server/
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## ⚙️ Cài đặt

### Clone repository

```bash
git clone https://github.com/nguyenvanhongphuc2211-dev/customer_management.git
```

### Di chuyển vào thư mục dự án

```bash
cd customer_management
```

### Cài đặt dependencies

```bash
npm install
```

---

## ▶️ Chạy ứng dụng

### Frontend

```bash
npm run dev
```

Mặc định:

```text
http://localhost:5173
```

### Backend Server

```bash
npm run dev:server
```

### Chạy đồng thời Frontend + Backend

```bash
npm run dev:all
```

---

## 🏗️ Build Production

```bash
npm run build
```

Kết quả build sẽ nằm trong:

```bash
dist/
```

---

## 🧪 Chạy kiểm thử

### Chạy toàn bộ test

```bash
npm run test
```

### Watch mode

```bash
npm run test:watch
```

---

## 📦 Scripts

| Lệnh | Chức năng |
|--------|------------|
| npm run dev | Chạy frontend |
| npm run dev:server | Chạy backend |
| npm run dev:all | Chạy toàn bộ hệ thống |
| npm run build | Build production |
| npm run preview | Preview bản build |
| npm run test | Chạy test |
| npm run test:watch | Test watch mode |

---

## 🎯 Mục tiêu dự án

- Áp dụng React + TypeScript vào dự án thực tế.
- Xây dựng hệ thống CRM cơ bản.
- Thực hành quản lý state và API.
- Áp dụng validation và testing trong dự án Frontend.

---

## 👨‍💻 Tác giả

**Nguyễn Văn Hồng Phúc**

GitHub:  
:contentReference[oaicite:0]{index=0}

---

## 📄 License

MIT License
