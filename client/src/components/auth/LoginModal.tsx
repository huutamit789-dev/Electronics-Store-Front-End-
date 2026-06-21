import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '@/features/auth/hooks/useAuth';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { useAuthStore } from '@/store/useAuthStore';

interface LoginModalProps {
  show: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onLoginSuccess: () => void;
}

const loginSchema = z.object({
  username: z.string().min(1, "Username không được để trống"),
  password: z.string().min(6, "Mật khẩu phải từ 6 ký tự"),
});

export const LoginModal: React.FC<LoginModalProps> = ({ show, onClose, onSwitchToRegister, onLoginSuccess }) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' }
  });

  const { mutate: login, isPending } = useLogin();
  const { logout } = useLogout();
  const { isLoggedIn, user } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = (data: any) => {
    setIsLoading(true);
    login(data, {
      onSuccess: async () => {
        setIsLoading(false);
        onLoginSuccess?.();
      },
      onError: () => {
        setIsLoading(false);
        alert("Đăng nhập thất bại");
      }
    });
  };

  // Check if user is logged in with non-admin role
  const isNonAdminLoggedIn = isLoggedIn && user && user.role?.toLowerCase() !== 'admin';

  return (
    <div className={`modal fade ${show ? 'show d-block' : ''}`} tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-xxl">
        <div className="modal-content">
          <div className="modal-header border-0 pb-0">
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body pt-0">
            <div className="login-card">
              <h2 className="text-center fw-bold mb-2">Electro Store</h2>

              {/* Show logout + greeting for non-admin logged-in users */}
              {isNonAdminLoggedIn ? (
                <div className="text-center">
                  <h3 className="mb-3">Chào {user?.username}!</h3>
                  <p className="text-muted mb-4">Bạn đã đăng nhập thành công</p>
                  <button
                    onClick={logout}
                    className="btn btn-pinterest w-100 mb-3"
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      fontWeight: '600',
                      padding: '0.75rem',
                      borderRadius: '25px',
                      border: 'none',
                      boxShadow: '0 4px 6px rgba(220, 53, 69, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <>
                  {/* Thanh loading */}
                  {isLoading && (
                    <div className="progress mb-3" style={{ height: '4px' }}>
                      <div className="progress-bar progress-bar-striped progress-bar-animated bg-danger" style={{ width: '100%' }}></div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-3">
                      <label className="form-label text-muted small">Tên người dùng hoặc Email</label>
                      <Controller
                        name="username"
                        control={control}
                        render={({ field }) => <input {...field} className={`form-control ${errors.username ? 'is-invalid' : ''}`} placeholder="Username/Email" />}
                      />
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
                    <span className="text-muted">Bạn chưa có tài khoản? </span>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-danger small text-decoration-none fw-bold"
                      onClick={onSwitchToRegister}
                    >
                      Đăng ký ngay
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};