# Sổ Thu Chi

Ứng dụng quản lý thu chi cá nhân với giao diện dark fintech lấy cảm hứng từ mẫu Transfer. Project gồm ứng dụng Expo đa nền tảng và REST API Node.js.

## Tính năng

- Dashboard hiển thị số dư, tổng thu và tổng chi trong tháng.
- Thêm nhanh khoản thu hoặc khoản chi bằng bàn phím số tùy chỉnh.
- Chọn danh mục và nhập ghi chú cho giao dịch.
- Vuốt để lưu, tương tự thao tác `swipe to send` trong thiết kế tham khảo.
- Tìm kiếm và lọc lịch sử theo khoản thu hoặc khoản chi.
- Xem, chỉnh sửa và xóa giao dịch.
- Thống kê chi tiêu theo danh mục.
- Dữ liệu mẫu tiếng Việt và định dạng tiền VND.

## Công nghệ

### Mobile

- Expo SDK 58
- React Native và TypeScript
- Expo Router
- Expo Linear Gradient
- Ionicons

### Backend

- Node.js và Express 5
- TypeScript
- Prisma ORM
- SQLite
- Zod

## Cấu trúc

```text
personal-finance/
├── mobile/
│   ├── app/                 # Màn hình và điều hướng Expo Router
│   └── src/
│       ├── components/      # Component giao diện dùng chung
│       ├── constants/       # Theme
│       ├── lib/             # API client
│       ├── types/           # TypeScript types
│       └── utils/           # Định dạng tiền và ngày
├── server/
│   ├── prisma/              # Schema, migration và seed
│   └── src/
│       ├── lib/
│       └── routes/          # REST API
└── package.json
```

## Yêu cầu

- Node.js 20 trở lên
- npm 10 trở lên
- Expo Go hoặc Android/iOS simulator

## Cài đặt backend

```bash
cd server
npm install
npm run db:setup
npm run dev
```

API chạy tại `http://localhost:4000`. Lệnh `db:setup` tạo SQLite database, chạy migration và thêm dữ liệu mẫu.

## Cài đặt mobile

```bash
cd mobile
npm install
cp .env.example .env
npm start
```

Giá trị mặc định trong `.env.example`:

```env
EXPO_PUBLIC_API_URL=http://localhost:4000/api
```

- iOS Simulator và web có thể dùng `localhost`.
- Android Emulator dùng `http://10.0.2.2:4000/api`.
- Điện thoại thật chạy Expo Go phải dùng IP LAN của máy chạy backend, ví dụ `http://192.168.1.10:4000/api`.

Sau khi đổi biến môi trường, hãy khởi động lại Expo.

## Lệnh hữu ích

```bash
# Từ thư mục gốc
npm run server       # Chạy backend
npm run mobile       # Chạy Expo
npm run build        # Build backend và kiểm tra TypeScript mobile

# Backend
cd server
npm run typecheck
npm run build
npm run db:seed

# Mobile
cd mobile
npm run typecheck
npm run export:web
```

## REST API

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| `GET` | `/health` | Kiểm tra trạng thái server |
| `GET` | `/api/dashboard` | Số dư, tổng tháng, giao dịch gần đây |
| `GET` | `/api/categories` | Danh sách danh mục |
| `GET` | `/api/transactions` | Danh sách, lọc và tìm kiếm giao dịch |
| `GET` | `/api/transactions/:id` | Chi tiết giao dịch |
| `POST` | `/api/transactions` | Tạo giao dịch |
| `PATCH` | `/api/transactions/:id` | Cập nhật giao dịch |
| `DELETE` | `/api/transactions/:id` | Xóa giao dịch |

## Phạm vi hiện tại

Phiên bản đầu tiên dùng một hồ sơ mặc định và chưa có đăng nhập. SQLite phù hợp cho phát triển cục bộ. Có thể chuyển datasource Prisma sang PostgreSQL và bổ sung xác thực JWT khi triển khai nhiều người dùng.
