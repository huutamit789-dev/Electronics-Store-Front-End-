import { create } from 'zustand';
import { CartItem } from '@/types/order';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;      // Tổng số lượng đơn vị sản phẩm
  getItemQuantity: (productId: string) => number; // Số lượng của 1 loại sản phẩm
  getCountUniqueItems: () => number; // SỐ LOẠI sản phẩm (dùng .length)

}

export const useCartStore = create<CartState>((set, get) => ({
  // Khởi tạo an toàn với try-catch để tránh crash nếu localStorage bị lỗi dữ liệu
  items: (() => {
    try {
      const stored = localStorage.getItem('cartItems');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Lỗi khi đọc giỏ hàng từ localStorage:", e);
      return [];
    }
  })(),

  addItem: (item) => {
    const items = get().items;
    const existingItem = items.find(i => i.productId === item.productId);

    const newItems = existingItem
        ? items.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i)
        : [...items, item];

    set({ items: newItems });
    localStorage.setItem('cartItems', JSON.stringify(newItems));
  },

  removeItem: (productId) => {
    const newItems = get().items.filter(i => i.productId !== productId);
    set({ items: newItems });
    localStorage.setItem('cartItems', JSON.stringify(newItems));
  },

  updateQuantity: (productId, quantity) => {
    // 1. Tìm sản phẩm hiện tại trong giỏ để biết giới hạn tồn kho (stock_quantity)
    const item = get().items.find(i => i.productId === productId);
    if (!item) return;

    const maxStock = item.stock_quantity || 0;

    // 2. Kiểm tra nếu số lượng mới vượt quá tồn kho
    if (quantity > maxStock) {
      console.warn("Số lượng vượt quá tồn kho, chặn update!");
      return; // Dừng lại, không thực hiện set state
    }

    // 3. Nếu số lượng <= 0 thì xóa
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    // 4. Chỉ khi hợp lệ mới update
    const newItems = get().items.map(i =>
        i.productId === productId ? { ...i, quantity } : i
    );

    set({ items: newItems });
    localStorage.setItem('cartItems', JSON.stringify(newItems));
  },

  clearCart: () => {
    set({ items: [] });
    localStorage.removeItem('cartItems');
  },

  getTotalAmount: () => {
    return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getItemQuantity: (productId) => {
    const item = get().items.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  },

  // Hàm bạn mong muốn để lấy số loại sản phẩm (không quan tâm số lượng)
  getCountUniqueItems: () => {
    return get().items.length;
  },
}));