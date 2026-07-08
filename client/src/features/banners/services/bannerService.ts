import axiosClient from '@/lib/api';
import { API_BASE_URL } from '@/config/constants';

export interface Banner {
  _id: string;
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  position: 'main' | 'sub1' | 'sub2';
  is_active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface BannerApiResponse {
  success: boolean;
  message: string;
  data: Banner[];
}

export const bannerService = {
  getAllBanners: async () => {
    const response = await axiosClient.get(`${API_BASE_URL}/banners`);
    return response.data;
  },

  getBannersByPosition: async (position: string) => {
    const response = await axiosClient.get(`${API_BASE_URL}/banners/position/${position}`);
    return response.data;
  },

  getBannerById: async (id: string) => {
    const response = await axiosClient.get(`${API_BASE_URL}/banners/${id}`);
    return response.data;
  }
};
