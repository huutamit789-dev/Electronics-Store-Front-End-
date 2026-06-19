import { create } from 'zustand';
import { CartItem } from '@/types/order';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: JSON.parse(localStorage.getItem('cartItems') || '[]'),
  
  addItem: (item) => {
    const items = get().items;
    const existingItem = items.find(i => i.productId === item.productId);
    
    let newItems;
    if (existingItem) {
      newItems = items.map(i =>
        i.productId === item.productId
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      );
    } else {
      newItems = [...items, item];
    }
    
    set({ items: newItems });
    localStorage.setItem('cartItems', JSON.stringify(newItems));
  },
  
  removeItem: (productId) => {
    const newItems = get().items.filter(i => i.productId !== productId);
    set({ items: newItems });
    localStorage.setItem('cartItems', JSON.stringify(newItems));
  },
  
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    
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
}));
