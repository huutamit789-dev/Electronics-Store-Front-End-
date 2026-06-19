// src/types/order.ts
export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image_url: string;
}

export interface Order {
  _id?: string;
  userId: string;
  username: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateOrderRequest {
  userId: string;
  username: string;
  items: CartItem[];
  totalAmount: number;
}
