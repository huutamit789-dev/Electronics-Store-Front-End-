import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '@/features/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

const loginSchema = z.object({
  username: z.string().min(1, "Username không được để trống"),
  password: z.string().min(6, "Mật khẩu phải từ 6 ký tự"),
});

export const LoginPage: React.FC = () => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' }
  });

  const { mutate: login, isPending } = useLogin();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in as admin
  React.useEffect(() => {
    if (isLoggedIn && user?.role?.toLowerCase() === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isLoggedIn, user, navigate]);

  const onSubmit = (data: any) => {
    setIsLoading(true);
    login(data, {
      onSuccess: async () => {
        setIsLoading(false);
        // After successful login, check role and redirect accordingly
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const { jwtDecode } = await import('jwt-decode');
            const decoded: any = jwtDecode(token);
            const role = (decoded?.role || decoded?.user?.role || '').toLowerCase();
            if (role === 'admin') {
              navigate('/admin/dashboard', { replace: true });
            } else {
              navigate('/', { replace: true });
            }
          } catch (e) {
            navigate('/', { replace: true });
          }
        }
      },
      onError: () => {
        setIsLoading(false);
        alert("Đăng nhập thất bại");
      }
    });
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: '#f0f0f0' }}>
      <div className="login-card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '2rem',
        borderRadius: '30px',
        background: 'white',
        boxShadow: '0 0 20px rgba(0,0,0,0.1)'
      }}>
        <h2 className="text-center fw-bold mb-2">Electro Store - Admin</h2>
        <p className="text-center text-muted mb-4">Đăng nhập để truy cập trang quản trị</p>

        {/* Thanh loading */}
        {isLoading && (
          <div className="progress mb-3" style={{ height: '4px' }}>
            <div className="progress-bar progress-bar-striped progress-bar-animated bg-danger" style={{ width: '100%' }}></div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label text-muted small">Tên người dùng</label>
            <Controller
              name="username"
              control={control}
              render={({ field }) => <input {...field} className={`form-control ${errors.username ? 'is-invalid' : ''}`} placeholder="Username" />}
            />
            {errors.username && <div className="invalid-feedback">{errors.username.message}</div>}
          </div>

          <div className="mb-3 position-relative">
            <label className="form-label text-muted small">Mật khẩu</label>
            <div className="input-group">
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <input {...field} type={showPassword ? 'text' : 'password'} className={`form-control ${errors.password ? 'is-invalid' : ''}`} placeholder="Mật khẩu" />
                )}
              />
              <button className="btn btn-outline-secondary" type="button" onClick={() => setShowPassword(!showPassword)}>
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
            {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
          </div>

          <button
            type="submit"
            className="btn w-100 mb-3"
            disabled={isPending || isLoading}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              fontWeight: '600',
              padding: '0.75rem',
              borderRadius: '25px',
              border: 'none',
              boxShadow: '0 4px 6px rgba(220, 53, 69, 0.3)',
              transition: 'all 0.3s ease',
              opacity: isPending || isLoading ? 0.6 : 1
            }}
            onMouseEnter={(e) => !isPending && !isLoading && (e.currentTarget.style.backgroundColor = '#c82333')}
            onMouseLeave={(e) => !isPending && !isLoading && (e.currentTarget.style.backgroundColor = '#dc3545')}
          >
            {isPending || isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="text-center mt-3">
          <span className="text-muted small">Bạn chưa có tài khoản? </span>
          <button
            type="button"
            className="btn btn-link p-0 text-danger small text-decoration-none fw-bold"
            onClick={() => navigate('/register')}
          >
            Đăng ký ngay
          </button>
        </div>
      </div>
    </div>
  );
};
