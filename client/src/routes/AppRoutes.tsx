// src/routes/AppRoutes.tsx
import { Routes, Route } from 'react-router-dom'; // Bỏ BrowserRouter ở đây
import { LoginForm } from '@/features/auth/components/LoginForm';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { HomePage } from '@/pages/HomePage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
    </Routes>
  );
};