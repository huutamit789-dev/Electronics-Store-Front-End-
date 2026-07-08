# Thư viện tái sử dụng (lib)

Thư mục này chứa các hàm và utilities tái sử dụng cho toàn bộ ứng dụng. Mục tiêu là tránh lặp code và giúp người mới dễ hiểu luồng xử lý.

## Cấu trúc thư mục

```
lib/
├── api/              # Cấu hình Axios và API client
├── formatters/       # Các hàm định dạng dữ liệu
├── storage/          # Các hàm thao tác với localStorage
└── validators/      # Các hàm validation
```

## 1. API (`lib/api/`)

### axiosClient.ts
Axios client đã cấu hình sẵn với:
- Base URL từ environment variable
- Request interceptor: tự động thêm token vào header
- Response interceptor: logging trong development mode

**Cách sử dụng:**
```typescript
import axiosClient from '@/lib/api';
// hoặc
import { axiosClient } from '@/lib/api';

// GET request
const response = await axiosClient.get('/products');

// POST request
const response = await axiosClient.post('/orders', orderData);
```

## 2. Formatters (`lib/formatters/`)

### currency.ts
Các hàm định dạng tiền tệ:

- `formatCurrency(value)` - Format số thành chuỗi với dấu phẩy (ví dụ: "1,234,567")
- `parseCurrency(str)` - Parse chuỗi tiền tệ về số (ví dụ: "1,234,567" → 1234567)
- `formatVND(value)` - Format với hậu tố "đ" (ví dụ: "1,234,567đ")
- `formatVNDFull(value)` - Format với hậu tố " VNĐ" (ví dụ: "1,234,567 VNĐ")

**Cách sử dụng:**
```typescript
import { formatVND, formatCurrency, parseCurrency } from '@/lib/formatters';

// Hiển thị giá
<span>{formatVND(product.price)}</span> {/* 1,234,567đ */}

// Input price
<input 
  value={formatCurrency(price)} 
  onChange={(e) => setPrice(parseCurrency(e.target.value))}
/>
```

### date.ts
Các hàm định dạng ngày tháng:

- `formatDate(date)` - Format date (ví dụ: "01/01/2024")
- `formatDateTime(date)` - Format datetime đầy đủ
- `formatTime(date)` - Format time
- `formatISODate(date)` - Format ISO date (YYYY-MM-DD)
- `formatRelativeTime(date)` - Format relative time (ví dụ: "2 giờ trước")

**Cách sử dụng:**
```typescript
import { formatDate, formatDateTime } from '@/lib/formatters';

<span>{formatDate(order.created_at)}</span>
<span>{formatDateTime(order.created_at)}</span>
```

## 3. Storage (`lib/storage/`)

### localStorage.ts
Các hàm thao tác với localStorage:

**Authentication:**
- `getToken()` / `setToken(token)` / `removeToken()`
- `getUsername()` / `setUsername(username)` / `removeUsername()`
- `getRole()` / `setRole(role)` / `removeRole()`
- `getUserData()` / `setUserData(data)` / `removeUserData()`

**Cart:**
- `getCartItems()` / `setCartItems(items)` / `removeCartItems()`

**Utilities:**
- `clearAuthData()` - Xóa tất cả auth data
- `clearAllData()` - Xóa tất cả data (logout hoàn toàn)
- `isAuthenticated()` - Kiểm tra user đã đăng nhập chưa

**Cách sử dụng:**
```typescript
import { 
  getToken, setToken, removeToken,
  clearAuthData, isAuthenticated 
} from '@/lib/storage';

// Login
setToken(data.token);

// Check auth
if (isAuthenticated()) {
  const token = getToken();
}

// Logout
clearAuthData();
```

## 4. Validators (`lib/validators/`)

### auth.ts
Validation cho authentication:
- `isValidEmail(email)` - Validate email format
- `isValidPassword(password)` - Validate password (tối thiểu 6 ký tự)
- `isValidUsername(username)` - Validate username
- `isValidPhone(phone)` - Validate phone number (Vietnam format)

### product.ts
Validation cho products:
- `isValidPrice(price)` - Validate price (số dương)
- `isValidQuantity(quantity)` - Validate quantity (số nguyên dương)
- `isValidDiscount(discount)` - Validate discount (0-100)
- `isValidProductName(name)` - Validate product name

**Cách sử dụng:**
```typescript
import { isValidEmail, isValidPrice } from '@/lib/validators';

if (!isValidEmail(email)) {
  setError('Email không hợp lệ');
}

if (!isValidPrice(price)) {
  setError('Giá phải là số dương');
}
```

## 5. Constants (`constants/`)

### storageKeys.ts
Các key constants cho localStorage:
```typescript
import { STORAGE_KEYS } from '@/constants';

console.log(STORAGE_KEYS.TOKEN); // 'token'
```

### apiEndpoints.ts
Các endpoint constants:
```typescript
import { API_ENDPOINTS } from '@/constants';

const url = API_ENDPOINTS.PRODUCTS;
```

### errorMessages.ts
Các error message constants:
```typescript
import { ERROR_MESSAGES } from '@/constants';

toast.error(ERROR_MESSAGES.LOGIN_FAILED);
```

## Quy tắc sử dụng

1. **Luôn import từ lib** khi cần sử dụng các hàm tái sử dụng
2. **Không định nghĩa lại** các hàm đã có trong lib (formatCurrency, localStorage operations, etc.)
3. **Thêm mới** vào lib khi phát hiện hàm được sử dụng ở nhiều nơi
4. **Document** rõ ràng khi thêm hàm mới vào lib

## Lợi ích

- **Tránh lặp code**: Các hàm common được định nghĩa 1 lần
- **Dễ bảo trì**: Khi thay đổi logic, chỉ cần sửa ở 1 nơi
- **Dễ test**: Các hàm độc lập, dễ viết unit test
- **Người mới dễ hiểu**: Cấu trúc rõ ràng, dễ tìm kiếm
- **Type-safe**: TypeScript support đầy đủ
