import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    role?: string;
    user?: {
        role?: string;
    };
    exp?: number; // Thời gian hết hạn
}

interface AdminProtectedRouteProps {
    children: React.ReactNode;
}

export const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const decoded = jwtDecode<DecodedToken>(token);

        // 1. Kiểm tra token có hết hạn hay không (exp tính bằng giây)
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
            localStorage.removeItem('access_token');
            return <Navigate to="/login" replace />;
        }

        // 2. Kiểm tra role
        const role = decoded?.role || decoded?.user?.role;

        if (role?.toLowerCase() === 'admin') {
            return <>{children}</>;
        }

        // Nếu đã đăng nhập nhưng không phải admin thì về trang chủ
        return <Navigate to="/" replace />;

    } catch (error) {
        localStorage.removeItem('access_token');
        return <Navigate to="/login" replace />;
    }
};