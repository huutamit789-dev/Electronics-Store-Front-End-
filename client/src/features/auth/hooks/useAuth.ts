import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
  const setIsLoggedIn = useAuthStore((state) => state.setIsLoggedIn);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data, variables, context) => { // Thêm context để truy cập onSuccess từ useMutation
      localStorage.setItem('token', data.token); // Lưu token
      localStorage.setItem('username', data.user.username); // LƯU USERNAME VÀO LOCALSTORAGE
      setIsLoggedIn(true);
      toast.success("Đăng nhập thành công!"); 
      
      // Gọi callback onSuccess được truyền từ component (nếu có)
      // Đây là nơi onLoginSuccess từ UserHomePage sẽ được gọi
      if (context?.onSuccess) { // Kiểm tra nếu có context.onSuccess
        context.onSuccess();
      } else {
        navigate('/'); // Điều hướng về trang chủ nếu không có callback
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
    onSuccess: (data, variables, context) => { // Thêm context để truy cập onSuccess từ useMutation
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");

      // Gọi callback onSuccess được truyền từ component (nếu có)
      // Đây là nơi onRegisterSuccess từ UserHomePage sẽ được gọi
      if (context?.onSuccess) { // Kiểm tra nếu có context.onSuccess
        context.onSuccess();
      } else {
        navigate('/login'); // Điều hướng về trang login nếu không có callback
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Có lỗi xảy ra khi đăng ký";
      toast.error(errorMessage);
    }
  });
};