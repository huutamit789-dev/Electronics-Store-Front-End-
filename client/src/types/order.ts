// src/types/order.ts
export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image_url: string;
  stock_quantity: number;
}

export interface Order {
  _id?: string;
  user_id: string; // Changed from userId to user_id
  username: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateOrderRequest {
  user_id: string;
  username: string;
  items: CartItem[];
  totalAmount: number;
}