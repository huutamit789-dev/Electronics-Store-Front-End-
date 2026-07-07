/**
 * @file dashboardService.ts
 * @description Frontend service to fetch dashboard statistical data from backend.
 * Provides TypeScript interfaces and API handler functions.
 */

import axiosClient from '@/api/axiosClient';

export interface DashboardOverviewStats {
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalUsers: number;
  totalProducts: number;
  lowStockProducts: number;
}

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
}

export interface TopProduct {
  _id: string;
  soldQuantity: number;
  name: string;
  price: number;
  image_url?: string;
  stock_quantity: number;
}

export interface DashboardStatsData {
  stats: DashboardOverviewStats;
  revenueChart: MonthlyRevenueData[];
  topProducts: TopProduct[];
}

export interface DashboardStatsApiResponse {
  success: boolean;
  message: string;
  data: DashboardStatsData;
}

export const dashboardService = {
  /**
   * @function getDashboardStats
   * @description Fetches all statistics for the admin dashboard including summaries, monthly revenues, and best-selling products.
   * @returns {Promise<DashboardStatsApiResponse>} API response containing dashboard data.
   */
  getDashboardStats: async (): Promise<DashboardStatsApiResponse> => {
    const response = await axiosClient.get<DashboardStatsApiResponse>('/dashboard/stats');
    return response.data;
  },
};
