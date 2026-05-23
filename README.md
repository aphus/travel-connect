# 🧳 Travel Connect

> Nền tảng mạng xã hội kết nối và ghép nhóm du lịch — tìm bạn đồng hành, xây dựng niềm tin, khám phá thế giới.

---

## 📌 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tech Stack](#tech-stack)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Tính năng chính](#tính-năng-chính)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Hướng dẫn cài đặt](#hướng-dẫn-cài-đặt)
- [Biến môi trường](#biến-môi-trường)
- [API Endpoints](#api-endpoints)
- [Git Flow](#git-flow)
- [Phân công thành viên](#phân-công-thành-viên)
- [Lộ trình dự án](#lộ-trình-dự-án)

---

## Giới thiệu

**Travel Connect** giải quyết bài toán: người muốn đi du lịch nhưng không có bạn đồng hành, không cùng lịch với bạn bè, hoặc e ngại đi cùng người lạ không uy tín.

Nền tảng cho phép:
- 🗺️ Tạo & tìm kiếm chuyến đi theo địa điểm, ngày, ngân sách
- 👥 Ghép nhóm với người lạ qua hệ thống duyệt thành viên
- 💬 Chat realtime trong nhóm chuyến đi
- ⭐ Đánh giá độ uy tín lẫn nhau sau mỗi chuyến đi
- 🚩 Báo cáo hành vi xấu

---

## Tech Stack

| Layer | Công nghệ | Lý do chọn |
|---|---|---|
| **Frontend** | Next.js 14 + Tailwind CSS | File-based routing, SSR/CSR linh hoạt, TypeScript native |
| **Backend** | NestJS + TypeORM | Guard/Decorator cho phân quyền, WebSocket Gateway sẵn có |
| **Database** | PostgreSQL | Quan hệ dữ liệu chặt chẽ, JSON support, production-ready |
| **Realtime** | Socket.io | Room theo Trip ID, auto reconnect, fallback HTTP |
| **Auth** | JWT + Passport.js | Stateless, dễ scale |
| **DevOps** | Docker Compose | Môi trường đồng nhất cho cả nhóm |

---

## Kiến trúc hệ thống

```
┌─────────────────┐        HTTP/REST        ┌─────────────────┐
│                 │ ──────────────────────► │                 │
│   Next.js 14    │                         │    NestJS API   │
│   (Port 3000)   │ ◄────────────────────── │   (Port 8000)   │
│                 │        Socket.io         │                 │
└─────────────────┘ ◄───────────────────── └────────┬────────┘
                                                     │ TypeORM
                                                     ▼
                                           ┌─────────────────┐
                                           │   PostgreSQL    │
                                           │   (Port 5433)   │
                                           └─────────────────┘
```

---

## Tính năng chính

### 🔐 Core & Identity
- Đăng ký / Đăng nhập / Logout (JWT)
- Hồ sơ cá nhân: Trust Score, lịch sử chuyến đi, nhận xét
- Tạo / Sửa / Hủy chuyến đi (Leader)

### 🔍 Discovery & Workflow
- Feed chuyến đi mới nhất
- Tìm kiếm & lọc theo địa điểm, ngày, ngân sách
- Luồng xin gia nhập: Request → Approve/Reject → Join
- Quản lý thành viên: Kick / Leave

### 💬 Interaction & Trust
- Chat realtime theo phòng Trip
- Vòng đời chuyến đi: Upcoming → Ongoing → Completed → Cancelled
- Đánh giá & nhận xét sau chuyến đi (1-5 sao)
- Báo cáo hành vi xấu (Spam / Scam / Toxic / Cancel last minute)

### 🛡️ Admin
- Quản lý người dùng & ban tài khoản
- Hủy chuyến đi
- Xem & xử lý báo cáo
- Thống kê hệ thống

---

## Cấu trúc thư mục

```
travel-connect/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── auth/               # JWT Authentication
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── jwt.strategy.ts
│   │   ├── users/              # User profile
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   ├── users.module.ts
│   │   │   └── users.service.ts
│   │   ├── trips/              # Trip CRUD
│   │   │   ├── entities/
│   │   │   │   └── trip.entity.ts
│   │   │   ├── dto/
│   │   │   ├── trips.module.ts
│   │   │   ├── trips.controller.ts
│   │   │   └── trips.service.ts
│   │   ├── admin/              # Admin panel APIs
│   │   ├── reports/            # Report system
│   │   │   └── entities/
│   │   │       └── report.entity.ts
│   │   ├── common/
│   │   │   ├── guards/         # JWT Guard, Roles Guard
│   │   │   └── decorators/     # @CurrentUser, @Roles
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env                    # Biến môi trường (không commit)
│   ├── .env.example            # Mẫu biến môi trường
│   └── package.json
│
├── frontend/                   # Next.js 14
│   ├── src/
│   │   ├── app/                # App Router
│   │   ├── components/         # UI Components
│   │   ├── services/           # API calls
│   │   └── hooks/              # Custom hooks
│   └── package.json
│
├── docs/                       # Tài liệu dự án
│   ├── ERD.png
│   ├── UseCase.png
│   ├── ActivityDiagram.png
│   └── API-Spec.md
│
├── docker-compose.yml          # PostgreSQL + pgAdmin
└── README.md
```

---

## Hướng dẫn cài đặt

### Yêu cầu
- Node.js >= 18
- Docker Desktop
- Git

### 1. Clone repository

```bash
git clone https://github.com/YOUR_USERNAME/travel-connect.git
cd travel-connect
```

### 2. Khởi động Database

```bash
# Chạy PostgreSQL + pgAdmin bằng Docker
docker compose up -d

# Kiểm tra container đang chạy
docker ps
# Phải thấy: travel_db đang Up
```

Truy cập pgAdmin tại `http://localhost:5050`
```
Email:    admin@admin.com
Password: admin
```

### 3. Cài đặt và chạy Backend

```bash
cd backend

# Copy file môi trường
cp .env.example .env
# Chỉnh sửa .env cho phù hợp

# Cài dependencies
npm install

# Chạy development server
npm run start:dev
```

Backend chạy tại `http://localhost:8000`

> TypeORM sẽ tự động tạo các bảng trong database khi khởi động lần đầu.

### 4. Cài đặt và chạy Frontend

```bash
cd frontend

# Cài dependencies
npm install

# Chạy development server
npm run dev
```

Frontend chạy tại `http://localhost:3000`

---

## Biến môi trường

### Backend (`backend/.env`)

Tạo file `.env` từ file mẫu:

```bash
cp backend/.env.example backend/.env
```

Nội dung `.env.example`:

```env
# Database
DB_HOST=localhost
DB_PORT=5433
DB_USER=travel_user
DB_PASS=travel_pass
DB_NAME=travel_connect

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
```

---

## API Endpoints

### Auth
```
POST  /api/auth/register     Đăng ký tài khoản mới
POST  /api/auth/login        Đăng nhập, trả về JWT token
POST  /api/auth/logout       Đăng xuất
```

### Users
```
GET   /api/users/:id         Xem profile người dùng
PATCH /api/users/me          Cập nhật profile của mình
```

### Trips
```
GET   /api/trips             Lấy danh sách chuyến đi (Feed)
POST  /api/trips             Tạo chuyến đi mới
GET   /api/trips/:id         Xem chi tiết chuyến đi
PATCH /api/trips/:id         Sửa chuyến đi (Leader only)
DELETE /api/trips/:id        Hủy chuyến đi (Leader/Admin)
```

### Admin
```
GET   /api/admin/users            Danh sách tất cả user
PATCH /api/admin/users/:id/ban    Ban tài khoản
GET   /api/admin/reports          Danh sách báo cáo
GET   /api/admin/trips            Danh sách chuyến đi
```

---

## Git Flow

### Cấu trúc nhánh

```
main          ← Production, chỉ merge từ develop khi hoàn thiện
└── develop   ← Nhánh tích hợp chung, mọi feature merge vào đây
    ├── feature/auth-login
    ├── feature/trip-feed
    └── feature/realtime-chat
```

### Quy trình làm việc hàng ngày

```bash
# 1. Luôn pull code mới nhất trước khi làm
git checkout develop
git pull origin develop

# 2. Tạo nhánh mới cho tính năng đang làm
git checkout -b feature/ten-tinh-nang

# 3. Code xong thì commit
git add .
git commit -m "feat: mô tả ngắn gọn tính năng"

# 4. Push lên GitHub
git push origin feature/ten-tinh-nang

# 5. Vào GitHub tạo Pull Request vào develop
```

### Quy tắc đặt tên commit

```
feat:     Tính năng mới
fix:      Sửa bug
chore:    Config, cài đặt, không liên quan logic
docs:     Cập nhật tài liệu
style:    Sửa UI/CSS
refactor: Tái cấu trúc code

# Ví dụ:
feat: add JWT authentication
fix: correct password hashing in register
docs: add API specification
chore: setup docker-compose for PostgreSQL
```

---

## Phân công thành viên

| Thành viên | Phụ trách | Module |
|---|---|---|
| **Thành viên 1** | Backend Core, Database, Admin | Auth, User, Trip CRUD, Admin Panel |
| **Thành viên 2** | Frontend, UI/UX, Discovery | Feed, Filter, Join Workflow, Responsive |
| **Thành viên 3** | Realtime, Trust System | Socket.io Chat, Rating, Review, Report |

---

## Lộ trình dự án

- [x] **Phase 1** — Phân tích & Thiết kế (ERD, Use Case, API Spec, Mockup)
- [x] **Phase 2** — Khởi tạo nền tảng (Git, Docker, NestJS, Next.js, Socket.io)
- [ ] **Phase 3** — Phát triển tính năng theo module
- [ ] **Phase 4** — Kiểm thử & Ghép nối
- [ ] **Phase 5** — Đóng gói & Nghiệm thu

---

> Đồ án môn Nhập môn Công nghệ Phần mềm