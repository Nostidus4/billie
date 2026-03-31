# 📱 Billie - Smart Receipt Management & Financial Tracker

## 🌟 Giới thiệu

**Billie** là một ứng dụng thông minh được phát triển bởi **BKU-SciNova** nhằm số hóa hóa đơn giấy và quản lý tài chính cá nhân một cách hiệu quả. Ứng dụng không chỉ giúp người dùng theo dõi chi tiêu mà còn bảo vệ sức khỏe bằng cách giảm thiểu tiếp xúc với hóa đơn in nhiệt chứa chất BPS độc hại.

### ⚠️ Vấn đề BPS trong hóa đơn

Hầu hết hóa đơn in nhiệt hiện nay chứa **BPS (Bisphenol S)** - chất gây rối loạn nội tiết tố nguy hiểm. Theo nghiên cứu của CEH (Center for Environmental Health), chỉ cần cầm hóa đơn trong **10 giây** đã có thể khiến da hấp thụ lượng BPS vượt mức cho phép, ảnh hưởng đến trao đổi chất, sinh sản và tăng nguy cơ ung thư.

## ✨ Tính năng chính

### 💰 Quản lý Tài chính
- **Theo dõi chi tiêu**: Phân tích và phân loại các khoản chi tự động
- **Quản lý thu nhập**: Ghi nhận và theo dõi các nguồn income
- **Phân tích báo cáo**: Hiển thị biểu đồ chi tiêu theo thời gian

### 📋 Thêm hóa đơn đa dạng
- **📱 Quét hóa đơn**: Sử dụng AI OCR để trích xuất thông tin từ ảnh chụp
- **✏️ Nhập thủ công**: Thêm thông tin chi tiêu bằng cách nhập số liệu
- **🎤 Nhập bằng giọng nói**: Sử dụng voice recognition để ghi nhận giao dịch

### 🤖 AI Chatbot Hỗ trợ
- **Tư vấn chi tiêu**: Đưa ra gợi ý dựa trên thói quen cá nhân
- **Tạo mục tiêu tài chính**: Hỗ trợ thiết lập và theo dõi các mục tiêu tiết kiệm
- **Trả lời thắc mắc**: Tư vấn về quản lý tài chính

## 🏗️ Cấu trúc Dự án

```
billie/
├── frontend/          # Frontend application
├── backend/           # Backend API
├── requirements.txt   # Dependencies
└── README.md
```

## 🚀 Cài đặt và Chạy

### Yêu cầu hệ thống
- Node.js >= 16.0.0
- Python >= 3.8

### 1. Clone Repository
```bash
git clone https://github.com/Nostidus4/billie.git
cd billie
```

### 2. Cài đặt Backend
```bash
cd backend
pip install -r requirements.txt
npm run dev
```

### 3. Cài đặt Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Truy cập ứng dụng
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

### 5. Test Account 
- Email: billie01@gmail.com
- Password: billie01

## 🛠️ Công nghệ Sử dụng

### Frontend
- **React/Next.js** - Thư viện JavaScript chính để xây dựng giao diện người dùng.
- **Tailwind CSS** - Framework CSS tiện ích, giúp thiết kế giao diện nhanh chóng và nhất quán.
- **MUI** - Bộ component UI hỗ trợ xây dựng giao diện hiện đại.

### Backend
-**Node.js** - Môi trường chạy JavaScript phía máy chủ.
-**Express.js - Framework web backend, quản lý API và định tuyến
-**JWT (JSON Web Token)** - Giải pháp xác thực và bảo mật phiên đăng nhập.

### AI Features
- **Prophet (Python)** - Thư viện dự báo chuỗi thời gian, sử dụng cho chức năng dự đoán chi tiêu/tài chính.
- **Whisper (OpenAI)** - Mô hình chuyển đổi giọng nói thành văn bản, phục vụ nhập liệu bằng giọng nói.
- **Gemini (Google)** - Mô hình xử lý hình ảnh, dùng cho chức năng trích xuất dữ liệu từ hóa đơn (Scan Bill).
- **OpenAI API** - Cung cấp năng lực xử lý ngôn ngữ tự nhiên cho Chatbot.
- **LlamaIndex** - Framework xây dựng index, cho phép AI Agent truy cập và xử lý dữ liệu tài chính người dùng.

## 📱 Hướng dẫn Sử dụng

1. **Đăng ký/Đăng nhập** tài khoản
2. **Thêm hóa đơn** bằng một trong các cách:
   - Chụp ảnh hóa đơn
   - Nói thông tin giao dịch
   - Nhập thủ công
3. **Xem báo cáo** chi tiêu trên dashboard
4. **Chat với AI** để được tư vấn và tạo mục tiêu tài chính

## 📞 Thông tin Liên hệ

**SciNova Team**
- 📱 GitHub: https://github.com/Nostidus4/billie
---

*Billie - Bảo vệ sức khỏe, quản lý tài chính thông minh* 💚
