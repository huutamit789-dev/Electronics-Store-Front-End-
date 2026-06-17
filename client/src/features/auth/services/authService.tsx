import axiosClient from '../../../api/axiosClient';

export const loginUser = async (credentials: any) => {
  const response = await axiosClient.post('/auth/login', credentials);
  return response.data; // Lưu token vào localStorage hoặc Context ở đây
};
export const registerUser = async (userData: any) => {
  const response = await axiosClient.post('/auth/register', userData);
  return response.data;
};