import { BrowserRouter, Routes, Route } from 'react-router-dom';
// Import LoginForm từ đường dẫn bạn đã tạo (sử dụng alias @/ cho gọn)
import { LoginForm } from '@/features/auth/components/LoginForm';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { HomePage } from '@/pages/HomePage';

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
      </Routes>
    </BrowserRouter>
  );
};