# ERATECH Website

Website công ty ERATECH - Công nghệ môi trường tiên tiến

## 🚀 Quick Start

### 1. Cài đặt
```bash
npm install
```

### 2. Chạy server
```bash
npm start
```

### 3. Mở trình duyệt
- Website: http://localhost:3000
- Admin Panel: http://localhost:3000/admin/admin.html
- Test API: http://localhost:3000/api/test-api.html

## 📁 Cấu trúc Project

```
eratech-website/
├── admin/                  # Admin panel
│   ├── admin.html
│   ├── admin.js
│   └── admin-*-module.js
├── api/                    # API files
│   └── test-api.html
├── css/                    # Stylesheets
├── data/                   # JSON data files
│   ├── hero-banner-data.json
│   ├── services-data.json
│   ├── projects-data.json
│   └── backups/           # Auto backups
├── images/                 # Images
├── js/                     # JavaScript files
├── includes/               # HTML includes
├── server.js              # Node.js server
├── package.json           # Dependencies
└── SETUP-GUIDE.md         # Chi tiết hướng dẫn
```

## 🎯 Tính năng

### Frontend
- ✅ Responsive design (Desktop, Tablet, Mobile)
- ✅ Hero banner với slideshow
- ✅ Sections: About, Services, Projects, News, Partners
- ✅ Multi-language support (VI/EN)
- ✅ Smooth animations (AOS)
- ✅ SEO friendly

### Admin Panel
- ✅ Quản lý Hero Banner
- ✅ Quản lý Services
- ✅ Quản lý Projects
- ✅ Quản lý News
- ✅ Quản lý Investment
- ✅ Quản lý Recruitment
- ✅ Upload images
- ✅ Auto backup
- ✅ Preview changes

### Backend (Node.js)
- ✅ RESTful API
- ✅ Save data to JSON files
- ✅ Auto backup (keep last 10)
- ✅ CORS enabled
- ✅ Error handling

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express
- **Data Storage**: JSON files
- **Animations**: AOS (Animate On Scroll)
- **Icons**: Font Awesome
- **Fonts**: Be Vietnam Pro

## 📝 Scripts

```bash
# Chạy server (production)
npm start

# Chạy server (development với auto-reload)
npm run dev

# Test API
npm test
```

## 🔧 Configuration

### Port
Mặc định: `3000`

Đổi port trong `server.js`:
```javascript
const PORT = process.env.PORT || 3000;
```

Hoặc dùng environment variable:
```bash
PORT=8080 npm start
```

### Data Types
Các loại dữ liệu được hỗ trợ:
- `hero-banner`
- `hero-media`
- `services`
- `projects`
- `news`
- `investment`
- `recruitment`
- `about-video`

## 📦 Deploy

### Deploy với PM2
```bash
npm install -g pm2
pm2 start server.js --name eratech
pm2 save
pm2 startup
```

### Deploy với Docker
```bash
docker build -t eratech-website .
docker run -p 3000:3000 eratech-website
```

## 🔐 Admin Login

Default credentials (đổi trong production):
- Username: `admin`
- Password: `admin123`

## 📚 Documentation

Xem chi tiết trong [SETUP-GUIDE.md](SETUP-GUIDE.md)

## 🐛 Troubleshooting

### Server không khởi động
```bash
# Kiểm tra Node.js version
node -v  # Cần >= 14.0

# Cài lại dependencies
rm -rf node_modules
npm install
```

### Port đã được sử dụng
```bash
# Đổi port hoặc kill process
lsof -ti:3000 | xargs kill  # Mac/Linux
netstat -ano | findstr :3000  # Windows
```

### Lỗi khi save data
```bash
# Kiểm tra quyền ghi
chmod -R 755 data/
```

## 📄 License

MIT License - ERATECH Group

## 👥 Contact

- Website: https://eratechgroup.com
- Email: info@eratechgroup.com
- Phone: 028.3938.3080

---

Made with ❤️ by ERATECH Team
