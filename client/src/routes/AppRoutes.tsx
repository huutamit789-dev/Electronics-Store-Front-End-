// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom'; // Thêm Navigate vào import
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { UserHomePage } from '@/pages/UserHomePage';
import { CartPage } from '@/pages/CartPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { MyOrdersPage } from '@/pages/MyOrdersPage';
import { ProductManagementPage } from '@/pages/Admin/ProductManagementPage';
import { AdminDashboardPage } from '@/pages/Admin/AdminDashboardPage';
import { CategoryManagementPage } from '@/pages/Admin/CategoryManagementPage';
import { UserManagementPage } from '@/pages/Admin/UserManagementPage';
import { OrderManagementPage } from '@/pages/Admin/OrderManagementPage';
import { ReviewManagementPage } from '@/pages/Admin/ReviewManagementPage';
import { PaymentManagementPage } from '@/pages/Admin/PaymentManagementPage';
import { OrderHistoryPage } from '@/pages/Admin/OrderHistoryPage';
import { AdminLayout } from '@/components/layout/Admin/AdminLayout';
import { AdminProtectedRoute } from '@/components/layout/Admin/AdminProtectedRoute';

export const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<UserHomePage />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/my-orders" element={<MyOrdersPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={
                <AdminProtectedRoute>
                    <AdminLayout />
                </AdminProtectedRoute>
            }>
                {/* Tự động chuyển hướng /admin về /admin/dashboard */}
                <Route index element={<Navigate to="/admin/dashboard" replace />} />

                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="products" element={<ProductManagementPage />} />
                <Route path="categories" element={<CategoryManagementPage />} />
                <Route path="users" element={<UserManagementPage />} />
                <Route path="orders" element={<OrderManagementPage />} />
                <Route path="reviews" element={<ReviewManagementPage />} />
                <Route path="payments" element={<PaymentManagementPage />} />
                <Route path="order-history" element={<OrderHistoryPage />} />
            </Route>
        </Routes>
    );
};