import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  user: {
    username: string;
    role?: string;
  } | null;
  setIsLoggedIn: (status: boolean) => void;
  setUser: (user: { username: string; role?: string } | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: !!localStorage.getItem('token'),
  user: localStorage.getItem('username') ? {
    username: localStorage.getItem('username') || '',
    role: localStorage.getItem('role') || undefined
  } : null,
  setIsLoggedIn: (status) => set({ isLoggedIn: status }),
  setUser: (user) => set({ user }),
}));