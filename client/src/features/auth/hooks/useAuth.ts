import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  role?: string;
  user?: {
    role?: string;
  };
}

export const useLogin = () => {
  const setIsLoggedIn = useAuthStore((state) => state.setIsLoggedIn);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data, variables, context) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.user.username);
      setIsLoggedIn(true);
      toast.success("Đăng nhập thành công!");

      // Decode token để lấy role
      try {
        const decoded = jwtDecode<DecodedToken>(data.token);
        const role = decoded?.role || decoded?.user?.role;
        
        // Store role in localStorage and auth store
        if (role) {
          localStorage.setItem('role', role);
          setUser({
            username: data.user.username,
            role: role
          });
        } else {
          setUser({
            username: data.user.username
          });
        }
        
        if (role?.toLowerCase() === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        setUser({
          username: data.user.username
        });
        navigate('/');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Đăng nhập thất bại");
    }
  });
};

export const useRegister = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate('/login');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Có lỗi xảy ra khi đăng ký";
      toast.error(errorMessage);
    }
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const setIsLoggedIn = useAuthStore((state) => state.setIsLoggedIn);
  const setUser = useAuthStore((state) => state.setUser);

  const logout = () => {
    // Xóa tất cả các key liên quan đến auth
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    
    setIsLoggedIn(false);
    setUser(null);
    toast.success("Đăng xuất thành công!");
    navigate('/');
  };

  return { logout };
};