import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosClient from '@/api/axiosClient';
import { jwtDecode } from 'jwt-decode';
import {API_BASE_URL} from "@/config/constants";
import { useAuthStore } from '@/store/useAuthStore';

// Định nghĩa kiểu dữ liệu cho một item trong giỏ hàng
interface CartItem {
  product_id: {
    _id: string;
    name: string;
    image_url: string;
    price: number;
  };
  quantity: number;
  price: number; // Giá tại thời điểm thêm vào giỏ
}

// Định nghĩa kiểu dữ liệu cho giỏ hàng
interface Cart {
  _id?: string;
  user_id: string;
  items: CartItem[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface AuthUser {
  _id: string;
  username: string;
  role: string;
}

// Định nghĩa kiểu dữ liệu cho Cart Context
interface CartContextType {
  cart: Cart | null;
  loadingCart: boolean;
  errorCart: string | null;
  fetchCart: (userId: string) => Promise<void>;
  addToCartContext: (userId: string, productId: string, quantity: number, price: number) => Promise<boolean>;
  removeFromCartContext: (userId: string, productId: string) => Promise<boolean>;
  updateCartItemQuantityContext: (userId: string, productId: string, quantity: number) => Promise<boolean>;
  clearCartContext: (userId: string) => Promise<boolean>;
  user: AuthUser | null; // Đã thêm user vào CartContextType
}

// Tạo Cart Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Custom hook để sử dụng Cart Context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Cart Provider Component
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loadingCart, setLoadingCart] = useState<boolean>(true);
  const [errorCart, setErrorCart] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const { isLoggedIn, checkAuth } = useAuthStore(); // Lấy trạng thái đăng nhập từ useAuthStore

  // Lấy user từ token khi component mount hoặc khi isLoggedIn thay đổi
  useEffect(() => {
    // Check auth state from localStorage
    checkAuth();

    const token = localStorage.getItem('token');

    if (!token) {
      setUser(null);
      setLoadingCart(false);
      return;
    }

    try {
      const decodedToken: any = jwtDecode(token);

      if (decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        setUser(null);
        setLoadingCart(false);
        return;
      }

      const authUser: AuthUser = {
        _id: decodedToken.id,
        username: decodedToken.username,
        role: decodedToken.role,
      };
      setUser(authUser);
    } catch (e) {
      setUser(null);
    } finally {
      setLoadingCart(false);
    }
  }, [isLoggedIn, checkAuth]);

  // Hàm để lấy giỏ hàng từ API
  const fetchCart = async (userId: string) => {
    setLoadingCart(true);
    setErrorCart(null);
    try {
      // Đã sửa: Truyền userId dưới dạng path parameter
      const response = await axiosClient.get(`${API_BASE_URL}/cart/${userId}`);
      if (response.data.success) {
        setCart(response.data.data);
      } else {
        setErrorCart(response.data.message || 'Failed to fetch cart');
        setCart(null);
      }
    } catch (err: any) {
      setErrorCart(err.response?.data?.message || 'Failed to fetch cart');
      setCart(null);
    } finally {
      setLoadingCart(false);
    }
  };

  // Nếu có giỏ hàng local khi user đăng nhập, merge vào backend
  const mergeLocalCartIntoBackend = async (userId: string) => {
    try {
      const stored = localStorage.getItem('cartItems');
      if (!stored) return;
      const localItems = JSON.parse(stored) as any[];
      if (!Array.isArray(localItems) || localItems.length === 0) return;

      // iterate sequentially to avoid overwhelming backend and to preserve order
      for (const li of localItems) {
        const prodId = li.productId || li.product_id || (li._id && li._id.productId) || null;
        const qty = li.quantity || li.qty || 1;
        const price = li.price || li.unitPrice || 0;
        if (!prodId) continue;
        try {
          await addToCartContext(userId, prodId, qty, price);
        } catch (e) {
          // Silent fail on individual items
        }
      }

      // Clear local storage cart after merging
      localStorage.removeItem('cartItems');
    } catch (e) {
      // Silent fail on merge error
    }
  };

  // Hàm thêm sản phẩm vào giỏ hàng qua API và cập nhật context
  const addToCartContext = async (userId: string, productId: string, quantity: number, price: number): Promise<boolean> => {
    try {
      // 1. Check product stock first
      const productResponse = await axiosClient.get(`${API_BASE_URL}/products/${productId}`);
      const product = productResponse.data.data;

      if (!product || product.stock_quantity <= 0) {
        setErrorCart('Sản phẩm đã hết hàng hoặc không tồn tại.');
        return false;
      }

      // 2. If in stock, proceed to add to cart
      const response = await axiosClient.post(`${API_BASE_URL}/cart/add`, {
        user_id: userId,
        product_id: productId,
        quantity: quantity,
        price: price,
      });
      if (response.data.success) {
        await fetchCart(userId);
        return true;
      } else {
        setErrorCart(response.data.message || 'Failed to add to cart');
        return false;
      }
    } catch (err: any) {
      setErrorCart(err.response?.data?.message || 'Failed to add to cart');
      return false;
    }
  };

  // Hàm xóa sản phẩm khỏi giỏ hàng qua API và cập nhật context
  const removeFromCartContext = async (userId: string, productId: string): Promise<boolean> => {
    try {
      const response = await axiosClient.delete(`${API_BASE_URL}/cart/remove`, {
        data: {
          user_id: userId,
          product_id: productId,
        }
      });
      if (response.data.success) {
        await fetchCart(userId);
        return true;
      } else {
        setErrorCart(response.data.message || 'Failed to remove from cart');
        return false;
      }
    } catch (err: any) {
      console.error('Error removing from cart:', err);
      setErrorCart(err.response?.data?.message || 'Failed to remove from cart');
      return false;
    }
  };

  // Hàm cập nhật số lượng sản phẩm trong giỏ hàng qua API và cập nhật context
  const updateCartItemQuantityContext = async (userId: string, productId: string, quantity: number): Promise<boolean> => {
    try {
      const response = await axiosClient.put(`${API_BASE_URL}/cart/update-quantity`, {
        user_id: userId,
        product_id: productId,
        quantity: quantity,
      });
      if (response.data.success) {
        await fetchCart(userId);
        return true;
      } else {
        setErrorCart(response.data.message || 'Failed to update cart item quantity');
        return false;
      }
    } catch (err: any) {
      setErrorCart(err.response?.data?.message || 'Failed to update cart item quantity');
      return false;
    }
  };

  // Hàm xóa toàn bộ giỏ hàng qua API và cập nhật context
  const clearCartContext = async (userId: string): Promise<boolean> => {
    try {
      const response = await axiosClient.delete(`${API_BASE_URL}/cart/clear/${userId}`);
      if (response.data.success) {
        await fetchCart(userId);
        return true;
      } else {
        setErrorCart(response.data.message || 'Failed to clear cart');
        return false;
      }
    } catch (err: any) {
      setErrorCart(err.response?.data?.message || 'Failed to clear cart');
      return false;
    }
  };


  // Fetch cart when user changes or on component mount
  useEffect(() => {
    if (user?._id) {
      // First merge any local cart (from non-logged sessions) into backend
      (async () => {
        await mergeLocalCartIntoBackend(user._id);
        await fetchCart(user._id);
      })();
    } else {
      setCart(null); // Clear cart if no user
      setLoadingCart(false);
    }
  }, [user?._id]);

  return (
    <CartContext.Provider value={{
      cart,
      loadingCart,
      errorCart,
      fetchCart,
      addToCartContext,
      removeFromCartContext,
      updateCartItemQuantityContext,
      clearCartContext,
      user // Expose user through the context
    }}>
      {children}
    </CartContext.Provider>
  );
};