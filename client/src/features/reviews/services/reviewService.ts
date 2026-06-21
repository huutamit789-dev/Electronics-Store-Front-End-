import axios from 'axios';
import { Review, ReviewApiResponse } from '@/types/review';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const reviewService = {
  // Get all reviews
  getAllReviews: async (page: number = 1, limit: number = 10): Promise<any> => {
    const response = await axios.get(`${API_BASE_URL}/reviews?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Create a new review
  createReview: async (reviewData: { author: string; rating: number; comment: string }): Promise<ReviewApiResponse> => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/reviews`, reviewData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Update review status
  updateReviewStatus: async (reviewId: string, status: string): Promise<ReviewApiResponse> => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_BASE_URL}/reviews/${reviewId}/status`, { status }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Delete review
  deleteReview: async (reviewId: string): Promise<ReviewApiResponse> => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_BASE_URL}/reviews/${reviewId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },
};
