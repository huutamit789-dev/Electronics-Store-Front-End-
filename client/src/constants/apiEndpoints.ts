/**
 * API Endpoints Constants
 * Các endpoint constants cho API calls
 */

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  
  // Products
  PRODUCTS: '/products',
  GET_ALL_PRODUCTS: '/products/getAllProduct',
  GET_PRODUCT_BY_ID: '/products/:id',
  GET_PRODUCT_BY_CATEGORY: '/products/getProductByCategoryId/:categoryId',
  SEARCH_PRODUCTS: '/products/search',
  
  // Cart
  CART: '/cart',
  CART_ITEMS: '/cart/items',
  
  // Orders
  ORDERS: '/orders',
  ORDER_BY_ID: '/orders/:id',
  
  // Users
  USERS: '/users',
  USER_BY_ID: '/users/:id',
  
  // Reviews
  REVIEWS: '/reviews',
  REVIEW_BY_ID: '/reviews/:id',
  
  // Banners
  BANNERS: '/banners',
  BANNER_BY_ID: '/banners/:id',
  
  // Components
  COMPONENTS: '/components',
  COMPONENT_BY_ID: '/components/:id',
  
  // Footers
  FOOTERS: '/footers',
  FOOTER_BY_ID: '/footers/:id',
  
  // Coupons
  COUPONS: '/coupons',
  COUPON_BY_ID: '/coupons/:id',
  VALIDATE_COUPON: '/coupons/validate',
  
  // Dashboard
  DASHBOARD: '/dashboard',
  DASHBOARD_STATS: '/dashboard/stats',
} as const;
