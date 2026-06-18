import axiosClient from '@/api/axiosClient';
import { ProductApiResponse } from '@/types/product';

export const productService = {
  getAllProducts: async (page: number = 1, limit: number = 10): Promise<ProductApiResponse> => {
    const response = await axiosClient.get<ProductApiResponse>('/products/getAllProduct', {
      params: { page, limit }
    });
    return response.data;
  },

  getProductByCategoryId: async (
    categoryId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ProductApiResponse> => {
    const response = await axiosClient.get<ProductApiResponse>(`/products/getProductByCategoryId/${categoryId}`, {
      params: { page, limit }
    });
    return response.data;
  }
};
