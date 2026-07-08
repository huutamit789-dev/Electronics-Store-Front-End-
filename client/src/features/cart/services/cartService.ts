import axiosClient from '@/lib/api';
import { Order, CreateOrderRequest } from '@/types/order';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090';

export const cartService = {
  // Create order from cart
  createOrder: async (orderData: any): Promise<Order> => {
    const response = await axiosClient.post(`${API_BASE_URL}/orders`, orderData);
    return response.data;
  },

  // Get user orders
  getUserOrders: async (userId: string): Promise<Order[]> => {
    const response = await axiosClient.get(`${API_BASE_URL}/orders/user/${userId}`);
    return response.data;
  },

  // Get order by ID
  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await axiosClient.get(`${API_BASE_URL}/orders/${orderId}`);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: 'pending' | 'completed' | 'cancelled'): Promise<Order> => {
    const response = await axiosClient.put(`${API_BASE_URL}/orders/${orderId}`, { status });
    return response.data;
  },
};
