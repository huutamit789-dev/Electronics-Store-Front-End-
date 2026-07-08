import { create } from 'zustand';
import { getToken, getUsername, getRole } from '@/lib/storage';

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
  isLoggedIn: !!getToken(),
  user: getUsername() ? {
    username: getUsername() || '',
    role: getRole() || undefined
  } : null,
  setIsLoggedIn: (status) => set({ isLoggedIn: status }),
  setUser: (user) => set({ user }),
  checkAuth: () => {
    const token = getToken();
    const username = getUsername();
    const role = getRole();

    set({
      isLoggedIn: !!token,
      user: username ? {
        username: username || '',
        role: role || undefined
      } : null,
    });
  },
}));