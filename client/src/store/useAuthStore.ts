import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  user: {
    username: string;
    role?: string;
  } | null;
  setIsLoggedIn: (status: boolean) => void;
  setUser: (user: { username: string; role?: string } | null) => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: !!localStorage.getItem('token'),
  user: localStorage.getItem('username') ? {
    username: localStorage.getItem('username') || '',
    role: localStorage.getItem('role') || undefined
  } : null,
  setIsLoggedIn: (status) => set({ isLoggedIn: status }),
  setUser: (user) => set({ user }),
  checkAuth: () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');

    set({
      isLoggedIn: !!token,
      user: username ? {
        username: username || '',
        role: role || undefined
      } : null,
    });
  },
}));