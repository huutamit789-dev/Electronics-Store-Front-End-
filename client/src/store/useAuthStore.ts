import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: !!localStorage.getItem('access_token'), // Kiểm tra token có sẵn không
  setIsLoggedIn: (status) => set({ isLoggedIn: status }),
}));