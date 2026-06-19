import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '@/features/auth/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

interface LoginFormProps {
  isModal?: boolean;
  onSwitchToRegister?: () => void;
  onLoginSuccess?: () => void;
}

const customStyles = `
    body { background-color: #f0f0f0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    .login-card { width: 100%; max-width: 440px; padding: 2rem; border-radius: 30px; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
    .form-control { border-radius: 12px; padding: 0.75rem 1rem; border: 1px solid #ced4da; }
    .btn-pinterest { background-color: #E60023; color: white; border-radius: 25px; font-weight: 600; padding: 0.75rem; }
`;

const loginSchema = z.object({
  username: z.string().min(1, "Username không được để trống"),
  password: z.string().min(6, "Mật khẩu phải từ 6 ký tự"),
});

export const LoginForm: React.FC<LoginFormProps> = ({ isModal = false, onSwitchToRegister, onLoginSuccess }) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' }
  });

  const { mutate: login, isPending } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // @ts-ignore
  useEffect(() => {
    if (!isModal) {
      const styleSheet = document.createElement("style");
      styleSheet.innerText = customStyles;
      document.head.appendChild(styleSheet);
      return () => document.head.removeChild(styleSheet);
    }
  }, [isModal]);

  const onSubmit = (data: any) => {
    setIsLoading(true);
    login(data, {
      onSuccess: async (response: any) => {
        // Lưu token
        const token = response?.data?.access_token || response?.access_token;
        if (token) {
          localStorage.setItem('access_token', token);
        }

        // Chờ 2 giây
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setIsLoading(false);
        onLoginSuccess?.();
        window.location.reload();
      },
      onError: () => {
        setIsLoading(false);
        alert("Đăng nhập thất bại");
      }
    });
  };

  const formContent = (
      <div className="login-card">
        <h2 className="text-center fw-bold mb-2">Electro Store</h2>

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

          <button type="submit" className="btn btn-pinterest w-100 mb-3 bg-danger" disabled={isPending || isLoading}>
            {isPending || isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
  );

  return isModal ? formContent : (
      <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: '#f0f0f0' }}>
        {formContent}
      </div>
  );
};