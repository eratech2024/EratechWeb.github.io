# Hướng dẫn cài đặt hệ thống lưu dữ liệu (Node.js)

## Yêu cầu
- Node.js 14.0 trở lên
- npm (đi kèm với Node.js)

## Cài đặt

### 1. Kiểm tra Node.js
Mở terminal và chạy:
```bash
node -v
npm -v
```

Nếu chưa có Node.js, tải về tại: https://nodejs.org/

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Chạy server
```bash
npm start
```

Server sẽ chạy tại: `http://localhost:3000`

### 4. Test API
Mở trình duyệt: `http://localhost:3000/api/test-api.html`

Click "Check Server" để kiểm tra.

## Cách sử dụng

### Chạy server (Development)
```bash
npm run dev
```
Dùng nodemon để tự động restart khi có thay đổi.

### Chạy server (Production)
```bash
npm start
```

### Thêm/Sửa Banner trong Admin
1. Chạy server: `npm start`
2. Mở `http://localhost:3000/admin/admin.html`
3. Đăng nhập
4. Vào tab "Hero Banner"
5. Thêm/sửa banner
6. Click "Lưu" - dữ liệu sẽ được lưu vào `data/hero-banner-data.json`

### Chuyển source code sang máy khác
1. Copy toàn bộ project
2. Chạy `npm install` trên máy mới
3. File JSON trong `/data` sẽ được giữ nguyên
4. Không cần setup lại dữ liệu!

### Backup tự động
- Mỗi lần lưu, hệ thống tự động tạo backup
- Backup được lưu trong `/data/backups/`
- Giữ tối đa 10 backup gần nhất

## API Endpoints

### 1. Health Check
```
GET /api/health
```
Kiểm tra server có hoạt động không.

### 2. Save Data
```
POST /api/save-data
Content-Type: application/json

{
  "type": "hero-banner",
  "data": { ... }
}
```

### 3. Get Data
```
GET /api/get-data/:type
```
Ví dụ: `/api/get-data/hero-banner`

### 4. List Backups
```
GET /api/backups/:type
```
Ví dụ: `/api/backups/hero-banner`

## Supported Data Types
- `hero-banner` - Hero banner data
- `hero-media` - Hero media data
- `services` - Services data
- `projects` - Projects data
- `news` - News data
- `investment` - Investment data
- `recruitment` - Recruitment data
- `about-video` - About video data

## Cấu trúc thư mục
```
project/
├── server.js               # Node.js server
├── package.json            # Dependencies
├── data/
│   ├── hero-banner-data.json
│   ├── services-data.json
│   ├── projects-data.json
│   ├── news-data.json
│   └── backups/            # Backup tự động
├── admin/
│   └── admin-hero-banner-module.js
└── js/
    └── hero-banner.js
```

## Scripts

### npm start
Chạy server production mode

### npm run dev
Chạy server development mode với auto-reload

### npm test
Chạy test suite

## Troubleshooting

### Lỗi: "Cannot find module 'express'"
```bash
npm install
```

### Lỗi: "Port 3000 already in use"
Đổi port trong `server.js` hoặc kill process đang dùng port 3000:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

### Lỗi: "EACCES: permission denied"
```bash
sudo npm start
```
Hoặc đổi port sang > 1024

### Server không khởi động
1. Kiểm tra Node.js version: `node -v` (cần >= 14.0)
2. Xóa `node_modules` và cài lại: `rm -rf node_modules && npm install`
3. Kiểm tra log trong terminal

## Deploy lên Production

### 1. Dùng PM2 (khuyên dùng)
```bash
npm install -g pm2
pm2 start server.js --name eratech
pm2 save
pm2 startup
```

### 2. Dùng systemd (Linux)
Tạo file `/etc/systemd/system/eratech.service`:
```ini
[Unit]
Description=ERATECH Website
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/project
ExecStart=/usr/bin/node server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Chạy:
```bash
sudo systemctl enable eratech
sudo systemctl start eratech
```

### 3. Dùng Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Environment Variables

Tạo file `.env`:
```
PORT=3000
NODE_ENV=production
```

## Lưu ý quan trọng
- **Luôn backup dữ liệu** trước khi update code
- **Không xóa** thư mục `/data/backups/`
- **Chạy `npm install`** sau khi pull code mới
- **Dùng PM2** cho production để auto-restart

## Hỗ trợ
Nếu gặp vấn đề:
1. Kiểm tra console log trong terminal
2. Kiểm tra browser console (F12)
3. Test API tại `/api/test-api.html`
4. Xem log: `pm2 logs eratech` (nếu dùng PM2)
