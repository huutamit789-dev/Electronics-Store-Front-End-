import axiosClient from '@/api/axiosClient';
import {
  CreateUserPayload,
  UpdateUserPayload,
  UserApiResponse,
  UsersApiResponse,
} from '@/types/user';

export const userService = {
  getUsers: async (page: number = 1, limit: number = 10): Promise<UsersApiResponse> => {
    const response = await axiosClient.get<UsersApiResponse>('/users', {
      params: { page, limit },
    });

    return response.data;
  },

  createUser: async (payload: CreateUserPayload): Promise<UserApiResponse> => {
    const response = await axiosClient.post<UserApiResponse>('/users', payload);
    return response.data;
  },

  updateUser: async (id: string, payload: UpdateUserPayload): Promise<UserApiResponse> => {
    const response = await axiosClient.put<UserApiResponse>(`/users/${id}`, payload);
    return response.data;
  },

  deleteUser: async (id: string): Promise<UserApiResponse> => {
    const response = await axiosClient.delete<UserApiResponse>(`/users/${id}`);
    return response.data;
  },
};
