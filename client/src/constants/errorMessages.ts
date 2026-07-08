/**
 * Error Messages Constants
 * Các error message constants cho ứng dụng
 */

export const ERROR_MESSAGES = {
  // Auth
  LOGIN_FAILED: 'Đăng nhập thất bại',
  REGISTER_FAILED: 'Đăng ký thất bại',
  LOGOUT_FAILED: 'Đăng xuất thất bại',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
  TOKEN_EXPIRED: 'Phiên đăng nhập đã hết hạn',
  UNAUTHORIZED: 'Bạn không có quyền truy cập',
  
  // Network
  NETWORK_ERROR: 'Lỗi kết nối mạng',
  SERVER_ERROR: 'Lỗi server',
  TIMEOUT_ERROR: 'Yêu cầu hết thời gian',
  
  // Validation
  REQUIRED_FIELD: 'Trường này là bắt buộc',
  INVALID_EMAIL: 'Email không hợp lệ',
  INVALID_PHONE: 'Số điện thoại không hợp lệ',
  INVALID_PASSWORD: 'Mật khẩu không hợp lệ',
  PASSWORD_TOO_SHORT: 'Mật khẩu phải có ít nhất 6 ký tự',
  
  // Products
  PRODUCT_NOT_FOUND: 'Không tìm thấy sản phẩm',
  OUT_OF_STOCK: 'Sản phẩm đã hết hàng',
  
  // Cart
  CART_EMPTY: 'Giỏ hàng trống',
  INVALID_QUANTITY: 'Số lượng không hợp lệ',
  
  // Orders
  ORDER_NOT_FOUND: 'Không tìm thấy đơn hàng',
  ORDER_FAILED: 'Đặt hàng thất bại',
  
  // General
  SOMETHING_WENT_WRONG: 'Có lỗi xảy ra',
  UNKNOWN_ERROR: 'Lỗi không xác định',
} as const;
