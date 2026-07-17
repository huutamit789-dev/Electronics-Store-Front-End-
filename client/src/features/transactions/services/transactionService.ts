import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface AccountInfo {
  user_id: string;
  username: string;
  balance: number;
  total_spent: number;
  vip_level: string;
  discount_percentage: number;
  next_level: string | null;
  amount_to_next_level: number;
}

export interface Transaction {
  _id: string;
  user_id: string;
  type: 'deposit' | 'purchase' | 'refund';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  order_id: string | null;
  created_at: string;
}

interface TransactionHistoryResponse {
  transactions: Transaction[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

interface DepositResponse {
  transaction_id: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  current_balance: number;
}

interface VipLevels {
  bronze: { min: number; max: number; discount: number };
  silver: { min: number; max: number; discount: number };
  gold: { min: number; max: number; discount: number };
  platinum: { min: number; max: number; discount: number };
  diamond: { min: number; max: number; discount: number };
}

export const transactionService = {
  /**
   * Get user account information (balance, VIP level)
   */
  getAccountInfo: async (): Promise<{ success: boolean; data: AccountInfo; message: string }> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/transactions/account`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  /**
   * Deposit money into account
   */
  depositMoney: async (amount: number, description?: string): Promise<{ success: boolean; data: DepositResponse; message: string }> => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_BASE_URL}/transactions/deposit`,
      { amount, description },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  /**
   * Get transaction history
   */
  getTransactionHistory: async (page: number = 1, limit: number = 10): Promise<{ success: boolean; data: TransactionHistoryResponse; message: string }> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/transactions/history`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * Get VIP levels information
   */
  getVipLevels: async (): Promise<{ success: boolean; data: VipLevels; message: string }> => {
    const response = await axios.get(`${API_BASE_URL}/transactions/vip-levels`);
    return response.data;
  }
};
