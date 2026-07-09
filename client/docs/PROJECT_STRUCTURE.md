# Hướng dẫn cấu trúc dự án Frontend

## Tổng quan

Đây là dự án Electronics Store Frontend được xây dựng với React + TypeScript + Vite. Dự án sử dụng architecture theo hướng feature-based với các utilities tái sử dụng được tách riêng.

## Cấu trúc thư mục

```
client/
├── src/
│   ├── api/                    # [DEPRECATED] API client cũ (đã chuyển sang lib/api)
│   ├── assets/                 # Static assets (images, templates)
│   │   ├── images/            # Hình ảnh
│   │   └── templateAdmin/     # Template cho admin dashboard
│   ├── components/             # UI Components tái sử dụng
│   │   ├── admin/             # Admin-specific components
│   │   ├── auth/              # Authentication components (LoginModal, RegisterModal)
│   │   ├── chatbox/           # Chatbot component
│   │   ├── layout/            # Layout components (Header, Footer, Sidebar)
│   │   │   ├── Admin/         # Admin layout
│   │   │   └── home/          # Home layout
│   │   ├── products/          # Product-related components
│   │   └── reviews/           # Review components
│   ├── config/                # Configuration files
│   │   └── constants.ts       # Constants cũ (đã chuyển sang constants/)
│   ├── constants/             # [NEW] Application constants
│   │   ├── storageKeys.ts     # localStorage keys
│   │   ├── apiEndpoints.ts    # API endpoints
│   │   ├── errorMessages.ts   # Error messages
│   │   └── index.ts           # Export all constants
│   ├── contexts/              # React Context providers
│   │   └── CartContext.tsx    # Cart state management context
│   ├── context/               # [DEPRECATED] Đã chuyển sang contexts/
│   ├── features/              # Feature modules (feature-based architecture)
│   │   ├── auth/              # Authentication feature
│   │   │   ├── components/    # Auth components
│   │   │   ├── hooks/         # Custom hooks (useLogin, useRegister, useLogout)
│   │   │   └── services/      # API services (authService)
│   │   ├── banners/           # Banner management
│   │   │   └── services/      # bannerService
│   │   ├── cart/              # Shopping cart
│   │   │   └── services/      # cartService
│   │   ├── components/        # Component management (admin)
│   │   │   └── services/      # componentService
│   │   ├── coupons/           # Coupon management
│   │   │   └── services/      # couponService
│   │   ├── dashboard/         # Admin dashboard
│   │   │   └── services/      # dashboardService
│   │   ├── footers/           # Footer management
│   │   │   └── services/      # footerService
│   │   ├── products/          # Product management
│   │   │   ├── hooks/         # useProducts hook
│   │   │   └── services/      # productService
│   │   ├── reviews/           # Review management
│   │   │   └── services/      # reviewService
│   │   └── users/             # User management
│   │       └── services/      # userService
│   ├── hooks/                 # Global custom hooks
│   │   └── useCountdown.ts    # Countdown timer hook
│   ├── lib/                   # [NEW] Reusable utilities library
│   │   ├── api/               # Axios client configuration
│   │   │   ├── axiosClient.ts # Configured axios instance
│   │   │   └── index.ts       # Export
│   │   ├── formatters/        # Data formatting functions
│   │   │   ├── currency.ts    # formatCurrency, parseCurrency, formatVND
│   │   │   ├── date.ts        # formatDate, formatDateTime, formatRelativeTime
│   │   │   └── index.ts       # Export all formatters
│   │   ├── storage/           # localStorage helpers
│   │   │   ├── localStorage.ts # getToken, setToken, clearAuthData, etc.
│   │   │   └── index.ts       # Export
│   │   ├── validators/        # Validation functions
│   │   │   ├── auth.ts        # isValidEmail, isValidPassword, etc.
│   │   │   ├── product.ts     # isValidPrice, isValidQuantity, etc.
│   │   │   └── index.ts       # Export
│   │   └── README.md          # Documentation for lib
│   ├── pages/                 # Page components (route-level)
│   │   ├── Admin/             # Admin pages
│   │   │   ├── AdminDashboardPage.tsx
│   │   │   ├── ProductManagementPage.tsx
│   │   │   ├── OrderManagementPage.tsx
│   │   │   ├── UserManagementPage.tsx
│   │   │   ├── ReviewManagementPage.tsx
│   │   │   ├── AdminBannerPage.tsx
│   │   │   ├── AdminComponentPage.tsx
│   │   │   └── AdminFooterPage.tsx
│   │   ├── CartPage.tsx       # Shopping cart page
│   │   ├── LoginPage.tsx      # Login page
│   │   ├── MyOrdersPage.tsx   # User orders history
│   │   ├── ProductDetailPage.tsx # Product detail page
│   │   ├── UserHomePage.tsx   # User home page
│   │   └── ...
│   ├── routes/                # Route configuration
│   │   └── index.tsx          # App routes setup
│   ├── store/                 # State management (Zustand)
│   │   ├── useAuthStore.ts    # Authentication state
│   │   ├── useCartStore.ts    # Cart state
│   │   ├── codeGateStore.ts  # Code gate state
│   │   └── useUIStore.ts      # UI state
│   ├── types/                 # TypeScript type definitions
│   │   ├── auth.ts            # Auth types
│   │   ├── component.ts       # Component types
│   │   ├── order.ts           # Order types
│   │   ├── product.ts         # Product types
│   │   ├── review.ts          # Review types
│   │   └── user.ts            # User types
│   ├── utils/                 # [DEPRECATED] Utilities cũ
│   │   └── axiosConfig.ts     # Đã chuyển sang lib/api
│   ├── App.tsx                # Root App component
│   ├── main.tsx               # Application entry point
│   └── index.css              # Global styles
├── .env                       # Environment variables
├── .env.example               # Environment variables template
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite configuration
└── README.md                  # Project README
```

## Luồng xử lý khi làm một chức năng mới

### Bước 1: Xác định loại chức năng

Trước khi bắt đầu, xác định chức năng bạn đang làm thuộc loại nào:

1. **UI Component mới** → Tạo trong `src/components/`
2. **Feature mới** → Tạo trong `src/features/[feature-name]/`
3. **Page mới** → Tạo trong `src/pages/`
4. **Utility function mới** → Tạo trong `src/lib/` nếu tái sử dụng được

### Bước 2: Đọc code từ đâu để hiểu luồng

#### Nếu làm chức năng liên quan đến **Authentication**:

1. **Đọc types**: `src/types/auth.ts` - hiểu data structure
2. **Đọc service**: `src/features/auth/services/authService.ts` - hiểu API calls
3. **Đọc hooks**: `src/features/auth/hooks/useAuth.ts` - hiểu logic xử lý
4. **Đọc store**: `src/store/useAuthStore.ts` - hiểu state management
5. **Đọc components**: `src/components/auth/` - xem UI components có sẵn
6. **Đọc storage helpers**: `src/lib/storage/localStorage.ts` - hiểu cách lưu token/user data

**Luồng**: User input → Component → Hook → Service → API → Store → Storage

#### Nếu làm chức năng liên quan đến **Products**:

1. **Đọc types**: `src/types/product.ts` - hiểu Product structure
2. **Đọc service**: `src/features/products/services/productService.ts` - hiểu API calls
3. **Đọc hooks**: `src/features/products/hooks/useProducts.ts` - hiểu logic
4. **Đọc components**: `src/components/products/` - xem UI components
5. **Đọc pages**: `src/pages/ProductDetailPage.tsx`, `src/pages/UserHomePage.tsx` - xem cách sử dụng

**Luồng**: Page → Hook → Service → API → Display

#### Nếu làm chức năng liên quan đến **Cart**:

1. **Đọc types**: `src/types/order.ts` - hiểu CartItem structure
2. **Đọc store**: `src/store/useCartStore.ts` - hiểu cart state management
3. **Đọc context**: `src/contexts/CartContext.tsx` - hiểu cart context
4. **Đọc service**: `src/features/cart/services/cartService.ts` - hiểu API calls
5. **Đọc page**: `src/pages/CartPage.tsx` - xem UI implementation

**Luồng**: User action → Store/Context → Service → API → Update UI

#### Nếu làm chức năng liên quan đến **Admin**:

1. **Đọc page tương ứng**: `src/pages/Admin/[Feature]ManagementPage.tsx`
2. **Đọc service**: `src/features/[feature]/services/[feature]Service.ts`
3. **Đọc types**: `src/types/[feature].ts`
4. **Đọc layout**: `src/components/layout/Admin/AdminLayout.tsx`

**Luồng**: Admin UI → Service → API → Update State

### Bước 3: Sử dụng utilities từ lib

**LUÔN kiểm tra `src/lib/` trước khi viết hàm mới:**

- **Format tiền tệ**: `import { formatVND, formatCurrency } from '@/lib/formatters'`
- **Format ngày tháng**: `import { formatDate, formatDateTime } from '@/lib/formatters'`
- **localStorage**: `import { getToken, setToken, clearAuthData } from '@/lib/storage'`
- **Validation**: `import { isValidEmail, isValidPrice } from '@/lib/validators'`
- **API calls**: `import axiosClient from '@/lib/api'`

### Bước 4: Tích hợp vào routes

Sau khi tạo page/component mới, thêm vào `src/routes/index.tsx`:

```typescript
import { YourNewPage } from '@/pages/YourNewPage';

// Thêm route
{
  path: '/your-new-route',
  element: <YourNewPage />,
}
```

## Ví dụ thực tế: Làm chức năng "Thêm sản phẩm vào giỏ hàng"

### 1. Đọc code để hiểu luồng hiện tại

**Bắt đầu từ UI component:**
```typescript
// src/components/products/CategoryProducts.tsx
// Tìm nút "Thêm vào giỏ" và xem onClick handler
```

**Theo dõi đến store:**
```typescript
// src/store/useCartStore.ts
// Xem addItem function
```

**Xem storage:**
```typescript
// src/lib/storage/localStorage.ts
// Xem setCartItems function
```

### 2. Implement chức năng mới

```typescript
// 1. Import utilities từ lib
import { formatVND } from '@/lib/formatters';
import { useCartStore } from '@/store/useCartStore';

// 2. Sử dụng store
const { addItem } = useCartStore();

// 3. Tạo CartItem theo type
const cartItem: CartItem = {
  productId: product._id,
  productName: product.name,
  price: product.price,
  quantity: 1,
  image_url: product.image_url,
  stock_quantity: product.stock_quantity,
};

// 4. Thêm vào cart
addItem(cartItem);
```

## Các quy tắc quan trọng

### 1. QUY TẮC IMPORT

```typescript
// ✅ ĐÚNG - Import từ lib
import { formatVND } from '@/lib/formatters';
import axiosClient from '@/lib/api';
import { getToken } from '@/lib/storage';

// ❌ SAI - Đừng định nghĩa lại
const formatCurrency = (value) => value.toLocaleString(); // Đã có trong lib
localStorage.getItem('token'); // Dùng getToken() từ lib thay thế
```

### 2. QUY TẮC TẠO FEATURE MỚI

```
features/
└── [feature-name]/
    ├── components/      # UI components riêng của feature
    ├── hooks/          # Custom hooks riêng của feature
    ├── services/       # API services
    └── types.ts        # Types riêng của feature (nếu phức tạp)
```

### 3. QUY TẮC TẠO PAGE MỚI

```typescript
// src/pages/YourNewPage.tsx
import React from 'react';
import { YourComponent } from '@/components/your-feature/YourComponent';
import { yourService } from '@/features/your-feature/services/yourService';

export const YourNewPage: React.FC = () => {
  // Logic ở đây
  return (
    <div>
      <YourComponent />
    </div>
  );
};
```

### 4. QUY TẮC SỬ DỤNG TYPES

```typescript
// ✅ ĐÚNG - Import từ types/
import { Product } from '@/types/product';
import { CartItem } from '@/types/order';

// ❌ SAI - Đừng define inline type nếu đã có
interface Product { _id: string; name: string; } // Đã có trong types/product.ts
```

## Debugging tips

### 1. Kiểm tra API call
```typescript
// Xem console logs từ lib/api/axiosClient.ts
// Development mode sẽ log tất cả request/response
```

### 2. Kiểm tra state
```typescript
// Sử dụng React DevTools để xem store state
// useAuthStore, useCartStore, etc.
```

### 3. Kiểm tra localStorage
```typescript
// Sử dụng storage helpers để debug
import { getToken, getCartItems } from '@/lib/storage';
console.log(getToken());
console.log(getCartItems());
```

## Resources tham khảo

- **Lib documentation**: `src/lib/README.md`
- **Type definitions**: `src/types/`
- **API services**: `src/features/*/services/`
- **State management**: `src/store/`
- **Route configuration**: `src/routes/index.tsx`

## Checklist khi hoàn thành chức năng

- [ ] Code đã sử dụng utilities từ `src/lib/` (formatCurrency, storage helpers, etc.)
- [ ] Types đã import từ `src/types/` (không define inline)
- [ ] API calls sử dụng `axiosClient` từ `src/lib/api`
- [ ] State management sử dụng store hoặc context phù hợp
- [ ] Route đã thêm vào `src/routes/index.tsx`
- [ ] Component đã đặt đúng thư mục (components, features, hoặc pages)
- [ ] Code đã clean, không có console.log thừa
- [ ] Đã test trên browser

## Liên hệ khi gặp vấn đề

Nếu bạn không tìm thấy hàm cần thiết trong `src/lib/`, hãy:
1. Kiểm tra xem có tương tự không
2. Nếu không, tạo mới trong thư mục phù hợp của `src/lib/`
3. Update documentation trong `src/lib/README.md`
