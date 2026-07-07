import axiosClient from '@/api/axiosClient';
import { ProductApiResponse, Product } from '@/types/product';

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
  },

  createProduct: async (productData: Omit<Product, '_id'>): Promise<Product> => {
    console.log('Dữ liệu sản phẩm gửi đi (createProduct):', productData); // Log dữ liệu gửi đi
    const response = await axiosClient.post<Product>('/products', productData);
    return response.data;
  },

  updateProduct: async (id: string, productData: Partial<Product>): Promise<Product> => {
    console.log(`Dữ liệu sản phẩm gửi đi (updateProduct) cho ID ${id}:`, productData); // Log dữ liệu gửi đi
    const response = await axiosClient.put<Product>(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await axiosClient.delete<void>(`/products/${id}`);
  },

  /**
   * @function searchProducts
   * @description Fetches filtered and paginated product list from backend search API.
   * @param {Object} params - Search parameters (keyword, cate_id, priceMin, priceMax, sortBy, ram, storage, os, page, limit).
   * @returns {Promise<ProductApiResponse>} The API response with product lists and pagination.
   */
  searchProducts: async (params: {
    keyword?: string;
    cate_id?: string;
    priceMin?: number;
    priceMax?: number;
    sortBy?: string;
    ram?: string;
    storage?: string;
    os?: string;
    page?: number;
    limit?: number;
  }): Promise<ProductApiResponse> => {
    const response = await axiosClient.get<ProductApiResponse>('/products/search', {
      params
    });
    return response.data;
  }
};