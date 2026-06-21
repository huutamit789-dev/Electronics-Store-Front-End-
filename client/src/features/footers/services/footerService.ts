import axiosClient from '@/api/axiosClient';
import { API_BASE_URL } from '@/config/constants';

export interface Footer {
  _id: string;
  company_name: string;
  company_description?: string;
  policy_title?: string;
  policies?: Array<{ title: string; link: string }>;
  contact_title?: string;
  contacts?: Array<{ icon: string; text: string }>;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FooterApiResponse {
  success: boolean;
  message: string;
  data: Footer;
}

interface FootersApiResponse {
  success: boolean;
  message: string;
  data: Footer[];
}

export const footerService = {
  getActiveFooter: async () => {
    const response = await axiosClient.get(`${API_BASE_URL}/footers/active`);
    return response.data;
  },

  getAllFooters: async () => {
    const response = await axiosClient.get(`${API_BASE_URL}/footers`);
    return response.data;
  },

  getFooterById: async (id: string) => {
    const response = await axiosClient.get(`${API_BASE_URL}/footers/${id}`);
    return response.data;
  }
};
