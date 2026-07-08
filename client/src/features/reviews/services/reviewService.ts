import axiosClient from '@/lib/api';
import { Review, ReviewApiResponse } from '@/types/review';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const reviewService = {
  // Get all reviews
  getAllReviews: async (page: number = 1, limit: number = 10): Promise<any> => {
    const response = await axiosClient.get(`${API_BASE_URL}/reviews?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Create a new review
  createReview: async (reviewData: { author: string; rating: number; comment: string }): Promise<ReviewApiResponse> => {
    const response = await axiosClient.post(`${API_BASE_URL}/reviews`, reviewData);
    return response.data;
  },

  // Update review status
  updateReviewStatus: async (reviewId: string, status: string): Promise<ReviewApiResponse> => {
    const response = await axiosClient.put(`${API_BASE_URL}/reviews/${reviewId}/status`, { status });
    return response.data;
  },

  // Delete review
  deleteReview: async (reviewId: string): Promise<ReviewApiResponse> => {
    const response = await axiosClient.delete(`${API_BASE_URL}/reviews/${reviewId}`);
    return response.data;
  },
};
