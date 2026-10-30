# MoneyHistory

Bộ ứng dụng quản lý thu chi cá nhân với giao diện dark fintech, gồm web quản trị, ứng dụng Expo đa nền tảng và REST API Node.js.

## Tính năng

### Web quản trị

- Dashboard số dư, tổng thu, tổng chi và dòng tiền theo tháng.
- Biểu đồ tỷ trọng còn lại và chi tiêu theo danh mục.
- Bảng giao dịch có tìm kiếm và lọc theo khoản thu hoặc khoản chi.
- Tạo, chỉnh sửa và xóa giao dịch.
- Giao diện responsive cho desktop, tablet và điện thoại.

### Mobile

- Dashboard hiển thị số dư, tổng thu và tổng chi trong tháng.
- Thêm nhanh khoản thu hoặc khoản chi bằng bàn phím số tùy chỉnh.
- Chọn danh mục và nhập ghi chú cho giao dịch.
- Vuốt để lưu tương tự thao tác `swipe to send`.
- Tìm kiếm, lọc, xem, chỉnh sửa và xóa giao dịch.

### Backend

- REST API CRUD giao dịch.
- Danh mục khoản thu và khoản chi.
- Tổng hợp số dư và thống kê theo tháng.
- SQLite với migration và dữ liệu mẫu tiếng Việt.

## Công nghệ

- **Web:** React, Vite, TypeScript, Lucide Icons
- **Mobile:** Expo SDK 58, React Native, Expo Router
- **Backend:** Node.js, Express 5, TypeScript, Prisma, SQLite, Zod

## Cấu trúc

```text
MoneyHistory/
├── web/                     # Web quản trị React + Vite
│   └── src/
├── mobile/                  # Ứng dụng Expo
│   ├── app/
│   └── src/
├── server/                  # REST API Express
│   ├── prisma/              # Schema, migration và seed
│   └── src/
└── package.json
```

## Chạy project

### 1. Backend

```bash
cd server
npm install
npm run db:setup
npm run dev
```

API chạy tại `http://localhost:4000`. Lệnh `db:setup` áp dụng migration và thêm dữ liệu mẫu nếu database chưa có giao dịch.

### 2. Web quản trị

Mở terminal khác:

```bash
cd web
npm install
cp .env.example .env
npm run dev
```

Mở `http://localhost:5173`. Vite tự chuyển tiếp các request `/api` sang backend ở cổng `4000`.

Khi web và API được triển khai ở hai domain khác nhau, đặt URL API trong `web/.env`:

```env
VITE_API_URL=https://api.example.com/api
```

### 3. Mobile

```bash
cd mobile
npm install
cp .env.example .env
npm start
```

Giá trị mặc định:

```env
EXPO_PUBLIC_API_URL=http://localhost:4000/api
```

- iOS Simulator và web có thể dùng `localhost`.
- Android Emulator dùng `http://10.0.2.2:4000/api`.
- Điện thoại thật cần IP LAN hoặc URL công khai của backend.

## Lệnh ở thư mục gốc

```bash
npm run setup    # Cài dependencies và chuẩn bị database
npm run server   # Chạy backend
npm run web      # Chạy web quản trị
npm run mobile   # Chạy Expo
npm run build    # Build backend, kiểm tra mobile và build web
```

## REST API

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `GET` | `/health` | Kiểm tra server |
| `GET` | `/api/dashboard` | Số dư và thống kê tháng |
| `GET` | `/api/categories` | Danh sách danh mục |
| `GET` | `/api/transactions` | Danh sách, lọc và tìm kiếm |
| `GET` | `/api/transactions/:id` | Chi tiết giao dịch |
| `POST` | `/api/transactions` | Tạo giao dịch |
| `PATCH` | `/api/transactions/:id` | Cập nhật giao dịch |
| `DELETE` | `/api/transactions/:id` | Xóa giao dịch |

## Phạm vi hiện tại

Ứng dụng dùng một hồ sơ mặc định và chưa có đăng nhập. SQLite phù hợp cho phát triển cục bộ và triển khai một người dùng; có thể chuyển Prisma sang PostgreSQL khi cần nhiều người dùng.
