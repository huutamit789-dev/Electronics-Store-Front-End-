import axiosClient from '@/api/axiosClient';
import { LoginCredentials, AuthResponse, User } from '@/types/auth'; // Import types

export const authService = {
  // Gán kiểu dữ liệu cụ thể cho credentials và response
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosClient.post<{
      success: boolean;
      message: string;
      data: AuthResponse;
    }>('/users/login', credentials);
    return response.data.data;
  },
  
  register: async (userData: any): Promise<User> => {
    const response = await axiosClient.post<User>('/users', userData);
    console.log("Register response:", response.data); // Debug log
    return response.data;
  },
  
  logout: async (): Promise<void> => {
    await axiosClient.post('/logout');
  }
};