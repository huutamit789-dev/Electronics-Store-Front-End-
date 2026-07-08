/**
 * LocalStorage helpers
 * Các hàm tiện ích cho localStorage operations
 */

const STORAGE_KEYS = {
  TOKEN: 'token',
  USERNAME: 'username',
  ROLE: 'role',
  CART_ITEMS: 'cartItems',
  USER_DATA: 'userData',
} as const;

/**
 * Lấy token từ localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
};

/**
 * Lưu token vào localStorage
 */
export const setToken = (token: string): void => {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
};

/**
 * Xóa token từ localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
};

/**
 * Lấy username từ localStorage
 */
export const getUsername = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.USERNAME);
};

/**
 * Lưu username vào localStorage
 */
export const setUsername = (username: string): void => {
  localStorage.setItem(STORAGE_KEYS.USERNAME, username);
};

/**
 * Xóa username từ localStorage
 */
export const removeUsername = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USERNAME);
};

/**
 * Lấy role từ localStorage
 */
export const getRole = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.ROLE);
};

/**
 * Lưu role vào localStorage
 */
export const setRole = (role: string): void => {
  localStorage.setItem(STORAGE_KEYS.ROLE, role);
};

/**
 * Xóa role từ localStorage
 */
export const removeRole = (): void => {
  localStorage.removeItem(STORAGE_KEYS.ROLE);
};

/**
 * Lấy cart items từ localStorage
 */
export const getCartItems = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.CART_ITEMS);
};

/**
 * Lưu cart items vào localStorage
 */
export const setCartItems = (items: string): void => {
  localStorage.setItem(STORAGE_KEYS.CART_ITEMS, items);
};

/**
 * Xóa cart items từ localStorage
 */
export const removeCartItems = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CART_ITEMS);
};

/**
 * Lấy user data từ localStorage
 */
export const getUserData = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.USER_DATA);
};

/**
 * Lưu user data vào localStorage
 */
export const setUserData = (data: string): void => {
  localStorage.setItem(STORAGE_KEYS.USER_DATA, data);
};

/**
 * Xóa user data từ localStorage
 */
export const removeUserData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
};

/**
 * Xóa tất cả authentication data
 */
export const clearAuthData = (): void => {
  removeToken();
  removeUsername();
  removeRole();
  removeUserData();
};

/**
 * Xóa tất cả data (logout hoàn toàn)
 */
export const clearAllData = (): void => {
  clearAuthData();
  removeCartItems();
};

/**
 * Kiểm tra user đã đăng nhập chưa
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};
