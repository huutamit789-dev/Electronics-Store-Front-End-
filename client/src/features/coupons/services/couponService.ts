/**
 * @file couponService.ts
 * @description Frontend service to communicate with backend coupon validation API.
 */

import axiosClient from '@/api/axiosClient';

export interface CouponVerifyData {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  discountAmount: number;
}

export interface CouponVerifyResponse {
  success: boolean;
  message: string;
  data: CouponVerifyData;
}

export const couponService = {
  /**
   * @function verifyCoupon
   * @description Sends a validation request to verify the coupon code against the order amount.
   * @param {string} code - Coupon code.
   * @param {number} orderAmount - Total price of items in order.
   * @returns {Promise<CouponVerifyResponse>} API validation response.
   */
  verifyCoupon: async (code: string, orderAmount: number): Promise<CouponVerifyResponse> => {
    const response = await axiosClient.post<CouponVerifyResponse>('/coupons/verify', {
      code,
      orderAmount
    });
    return response.data;
  }
};
