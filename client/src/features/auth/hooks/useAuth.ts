import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate

export const useLogin = () => {
  const setIsLoggedIn = useAuthStore((state) => state.setIsLoggedIn);
  const navigate = useNavigate(); // 2. Khởi tạo hook

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.token);
      setIsLoggedIn(true);
      toast.success("Đăng nhập thành công!"); 
      
      // 3. Thêm lệnh điều hướng ở đây
      // Chuyển hướng về trang chủ hoặc trang dashboard sau khi đăng nhập
      navigate('/'); 
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
      toast.success("Đăng ký thành công! Chào mừng bạn.");
      navigate('/login'); // Cái này đã hoạt động đúng
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Có lỗi xảy ra khi đăng ký";
      toast.error(errorMessage);
    }
  });
};