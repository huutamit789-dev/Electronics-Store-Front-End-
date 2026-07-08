import axiosClient from '@/lib/api';
import { API_BASE_URL } from '@/config/constants';
import { ComponentItem, ComponentApiResponse } from '@/types/component';

export type { ComponentItem, ComponentApiResponse };

export const componentService = {
  getAllComponents: async (): Promise<ComponentApiResponse> => {
    const response = await axiosClient.get(`${API_BASE_URL}/components`);
    return response.data;
  },

  getComponentsByType: async (type: string): Promise<ComponentApiResponse> => {
    const response = await axiosClient.get(`${API_BASE_URL}/components/type/${type}`);
    return response.data;
  },

  getComponentsByPosition: async (position: string): Promise<ComponentApiResponse> => {
    const response = await axiosClient.get(`${API_BASE_URL}/components/position/${position}`);
    return response.data;
  },

  getActiveComponents: async (): Promise<ComponentApiResponse> => {
    const response = await axiosClient.get(`${API_BASE_URL}/components/active`);
    return response.data;
  },

  getComponentById: async (id: string): Promise<{ success: boolean; data: ComponentItem }> => {
    const response = await axiosClient.get(`${API_BASE_URL}/components/${id}`);
    return response.data;
  }
};
