# BÁO CÁO ĐỒ ÁN

# XÂY DỰNG HỆ THỐNG QUẢN LÝ KHO VÀ ĐƠN HÀNG ELECTROSTORE

---

# MỤC LỤC

1. Giới thiệu đề tài
2. Mục tiêu dự án
3. Công nghệ sử dụng
4. Phân tích yêu cầu hệ thống
5. Phân tích nghiệp vụ
6. Kiến trúc hệ thống
7. Thiết kế cơ sở dữ liệu
8. Thiết kế API
9. Các chức năng chính
10. Luồng hoạt động hệ thống
11. Cấu hình và triển khai
12. Kết quả đạt được


---

# CHƯƠNG 1. GIỚI THIỆU ĐỀ TÀI

## 1.1 Tên đề tài

**ElectroStore – Inventory & Order Management System**

## 1.2 Mô tả đề tài

Trong quá trình kinh doanh các sản phẩm điện tử, việc quản lý hàng hóa, tồn kho
* Quản lý sản phẩm.
* Quản lý danh mục sản phẩm.
* Theo dõi tồn kho.
* Quản lý đơn hàng.
* Phân quyền người dùng.
* Hỗ trợ khách hàng mua sắm trực tuyến.

Hệ thống được xây dựng theo mô hình Client – Server với ReactJS ở phía Frontend và NodeJS ở phía Backend.

---

# CHƯƠNG 2. MỤC TIÊU DỰ ÁN

## 2.1 Mục tiêu chung

Xây dựng hệ thống quản lý kho và đơn hàng cho cửa hàng điện tử với giao diện thân thiện, dễ sử dụng và có khả năng mở rộng.

## 2.2 Mục tiêu cụ thể

* Quản lý sản phẩm bằng giao diện trực quan.
* Quản lý tồn kho theo thời gian thực.
* Hỗ trợ đặt hàng trực tuyến.
* Quản lý lịch sử đơn hàng.
* Phân quyền Admin và User.
* Tăng tính bảo mật bằng JWT Authentication.
* Lưu trữ hình ảnh sản phẩm trên Cloudinary.

---

# CHƯƠNG 3. CÔNG NGHỆ SỬ DỤNG

## 3.1 Frontend

* ReactJS
* TypeScript
* Vite
* Bootstrap 5
* Axios
* Zustand
* React Router DOM

## 3.2 Backend

* NodeJS
* ExpressJS
* JWT Authentication
* Bcrypt

## 3.3 Database

* MongoDB Atlas
* Mongoose ODM

## 3.4 Dịch vụ bên thứ ba

### Cloudinary

Dùng để lưu trữ hình ảnh sản phẩm.

### JWT

Dùng để xác thực và phân quyền người dùng.

---

# CHƯƠNG 4. PHÂN TÍCH YÊU CẦU HỆ THỐNG

## 4.1 Đối tượng sử dụng

### Admin

Có quyền:

* Quản lý sản phẩm.
* Quản lý danh mục.
* Quản lý người dùng.
* Quản lý đơn hàng.
* Cập nhật trạng thái đơn hàng.

### User

Có quyền:

* Đăng ký tài khoản.
* Đăng nhập.
* Xem sản phẩm.
* Thêm vào giỏ hàng.
* Đặt hàng.
* Xem lịch sử mua hàng.

---

## 4.2 Yêu cầu chức năng

### Quản lý tài khoản

* Đăng ký.
* Đăng nhập.
* Đăng xuất.
* Phân quyền.

### Quản lý sản phẩm

* Thêm sản phẩm.
* Sửa sản phẩm.
* Xóa sản phẩm.
* Xem danh sách sản phẩm.

### Quản lý kho

* Theo dõi tồn kho.
* Tự động cập nhật sau khi đặt hàng.

### Quản lý đơn hàng

* Tạo đơn hàng.
* Hủy đơn hàng.
* Cập nhật trạng thái đơn hàng.

---

# CHƯƠNG 5. PHÂN TÍCH NGHIỆP VỤ

## 5.1 Luồng đăng ký

Người dùng nhập:

* Tên đăng nhập
* Mật khẩu
* Xác nhận mật khẩu

Hệ thống kiểm tra:

* Tài khoản đã tồn tại hay chưa.
* Mật khẩu có tối thiểu 6 ký tự.

Nếu hợp lệ:

* Tạo tài khoản mới.
* Lưu mật khẩu đã mã hóa bằng Bcrypt.

---

## 5.2 Luồng đăng nhập

1. Người dùng nhập thông tin.
2. Backend xác thực tài khoản.
3. Sinh JWT Token.
4. Trả Token về Frontend.
5. Frontend lưu Token.
6. Điều hướng giao diện theo quyền người dùng.

---

## 5.3 Luồng mua hàng

1. Chọn sản phẩm.
2. Thêm vào giỏ hàng.
3. Kiểm tra số lượng tồn kho.
4. Thanh toán.
5. Tạo đơn hàng.
6. Trừ số lượng tồn kho.
7. Điều hướng đến trang lịch sử đơn hàng.

---

## 5.4 Luồng quản lý tồn kho

Khi khách hàng đặt hàng:

* Kiểm tra số lượng sản phẩm.
* Trừ kho tự động.
* Ngăn đặt hàng vượt quá số lượng tồn kho.

---

# CHƯƠNG 6. KIẾN TRÚC HỆ THỐNG

Hệ thống được xây dựng theo mô hình Layered Architecture.

## 6.1 Models Layer

Định nghĩa dữ liệu:

* User
* Product
* Category
* Order

## 6.2 Repository Layer

Thực hiện:

* CRUD Database.
* Truy vấn MongoDB.

## 6.3 Service Layer

Chứa logic nghiệp vụ:

* Kiểm tra tồn kho.
* Tạo đơn hàng.
* Tính tổng tiền.

## 6.4 Controller Layer

Xử lý:

* Request.
* Response.
* Validation.

## 6.5 Route Layer

Định nghĩa API Endpoint.

---

# CHƯƠNG 7. THIẾT KẾ CƠ SỞ DỮ LIỆU

## Collection User

```json
{
  "_id": "ObjectId",
  "username": "string",
  "password": "string",
  "role": "admin | user",
  "createdAt": "date"
}
```

## Collection Category

```json
{
  "_id": "ObjectId",
  "name": "string"
}
```

## Collection Product

```json
{
  "_id": "ObjectId",
  "name": "string",
  "description": "string",
  "price": 1000,
  "stock_quantity": 100,
  "image": "url",
  "categoryId": "ObjectId"
}
```

## Collection Order

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "products": [],
  "totalAmount": 0,
  "status": "Pending",
  "createdAt": "date"
}
```

---

# CHƯƠNG 8. THIẾT KẾ API

## User API

### Đăng ký

POST /users/register

### Đăng nhập

POST /users/login

---

## Product API

### Lấy danh sách sản phẩm

GET /products

### Thêm sản phẩm

POST /products

### Cập nhật sản phẩm

PUT /products/:id

### Xóa sản phẩm

DELETE /products/:id

---

## Order API

### Tạo đơn hàng

POST /orders

### Cập nhật trạng thái

PUT /orders/:id/status

---

## Cart API

### Lấy giỏ hàng

GET /cart

---

# CHƯƠNG 9. CÁC CHỨC NĂNG CHÍNH

## Chức năng Admin

* Quản lý sản phẩm.
* Quản lý đơn hàng.
* Quản lý danh mục.
* Quản lý người dùng.

## Chức năng User

* Xem sản phẩm.
* Mua hàng.
* Quản lý giỏ hàng.
* Xem lịch sử đơn hàng.

---

# CHƯƠNG 10. LUỒNG HOẠT ĐỘNG HỆ THỐNG

## Upload ảnh sản phẩm

1. Chọn ảnh.
2. Frontend tạo FormData.
3. Gửi đến Cloudinary.
4. Nhận URL ảnh.
5. Lưu URL vào MongoDB.

```javascript
const formData = new FormData();
formData.append("file", file);
formData.append("upload_preset", "tamit789");

const uploadResponse = await axios.post(
    "https://api.cloudinary.com/v1_1/ds51sgdnl/image/upload",
    formData
);
```

## Kiến trúc triển khai

```text
ReactJS Frontend
        |
        |
ExpressJS Backend API
        |
        |
MongoDB Atlas
        |
        |
Cloudinary
```

---

# CHƯƠNG 11. CẤU HÌNH VÀ TRIỂN KHAI

## Backend Environment

```env
PORT=8090

DB_STRING=<MongoDB Connection String>

JWT_SECRET=<JWT Secret>

SALT_ROUNDS=10
```

## Frontend Environment

```env
VITE_API_URL=http://localhost:8090/api
```

## Cài đặt

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
npm install
npm start
```

---

# CHƯƠNG 12. KẾT QUẢ ĐẠT ĐƯỢC

Hệ thống đã hoàn thành:

✅ Đăng ký tài khoản

✅ Đăng nhập bằng JWT

✅ Phân quyền Admin/User

✅ Quản lý sản phẩm

✅ Quản lý danh mục

✅ Quản lý tồn kho

✅ Giỏ hàng

✅ Đặt hàng

✅ Lịch sử đơn hàng

✅ Upload ảnh Cloudinary

✅ MongoDB Atlas

---


