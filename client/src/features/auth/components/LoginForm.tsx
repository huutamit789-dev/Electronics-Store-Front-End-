import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '@/features/auth/hooks/useAuth';
import { Link } from 'react-router-dom';

// Định nghĩa props cho LoginForm
interface LoginFormProps {
  isModal?: boolean; // True nếu form được render trong modal
  onSwitchToRegister?: () => void; // Hàm để chuyển sang modal đăng ký
  onLoginSuccess?: () => void; // Hàm để đóng modal sau khi đăng nhập thành công
}

// CSS tùy chỉnh từ Login.html
const customStyles = `
    body {
        background-color: #f0f0f0;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
    .login-card {
        width: 100%;
        max-width: 440px;
        padding: 2rem;
        border-radius: 30px;
        background: white;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
    }

    .form-control {
        border-radius: 12px;
        padding: 0.75rem 1rem;
        border: 1px solid #ced4da;
    }
    .form-control:focus {
        border-color: #007bff;
        box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
    }
    .btn-pinterest {
        background-color: #E60023;
        color: white;
        border-radius: 25px;
        font-weight: 600;
        padding: 0.75rem;
    }
    .btn-pinterest:hover {
        background-color: #ad001a;
        color: white;
    }
    .btn-google {
        border-radius: 25px;
        padding: 0.75rem;
        font-weight: 600;
        border: 1px solid #ced4da;
        background: white;
    }
    .btn-google:hover {
        background-color: #f8f9fa;
    }
    .or-divider {
        text-align: center;
        margin: 1rem 0;
        color: #6c757d;
    }
`;

// Schema xác thực
const loginSchema = z.object({
  identifier: z.string().min(1, "Tên người dùng hoặc Email không được để trống"),
  password: z.string().min(6, "Mật khẩu phải từ 6 ký tự"),
});

export const LoginForm: React.FC<LoginFormProps> = ({ isModal = false, onSwitchToRegister, onLoginSuccess }) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' }
  });

  const { mutate: login, isPending } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  // Inject custom styles chỉ khi không phải là modal
  useEffect(() => {
    if (!isModal) {
      const styleSheet = document.createElement("style");
      styleSheet.type = "text/css";
      styleSheet.innerText = customStyles;
      document.head.appendChild(styleSheet);

      return () => {
        document.head.removeChild(styleSheet);
      };
    }
  }, [isModal]);

  const onSubmit = (data: any) => {
    login(data, {
      onSuccess: () => {
        onLoginSuccess?.(); // Gọi hàm đóng modal nếu có
      }
    });
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const formContent = (
    <div className="login-card">
      <h2 className="text-center fw-bold mb-2">Chào mừng đến với Electric Store</h2>
      <p className="text-center text-muted mb-4">Đăng nhập để mua hàng có ưu đãi dành cho bạn</p>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Identifier Input */}
        <div className="mb-3">
          <label htmlFor="identifier" className="form-label text-muted small">Tên người dùng hoặc Email</label>
          <Controller
            name="identifier"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className={`form-control ${errors.identifier ? 'is-invalid' : ''}`}
                id="identifier"
                placeholder="Tên người dùng hoặc Email"
              />
            )}
          />
          {errors.identifier && <div className="invalid-feedback">{errors.identifier.message}</div>}
        </div>

        {/* Password Input */}
        <div className="mb-3 position-relative">
          <label htmlFor="password" className="form-label text-muted small">Mật khẩu</label>
          <div className="input-group">
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  id="password"
                  placeholder="Mật khẩu"
                />
              )}
            />
            <button
              className="btn btn-outline-secondary border-start-0"
              type="button"
              onClick={togglePassword}
            >
              <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
            </button>
            {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
          </div>
        </div>

        <div className="mb-3">
          <Link to="#" className="text-decoration-none fw-bold text-dark">Quên mật khẩu?</Link>
        </div>

        <button type="submit" className="btn btn-pinterest w-100 mb-3" disabled={isPending}>
          {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <div className="text-center">
        <p className="mb-2">Bạn mới sử dụng Pinterest? <a href="#" onClick={onSwitchToRegister} className="text-decoration-none fw-bold text-danger">Đăng ký ngay</a></p> {/* Đã thêm text-danger */}
        <p className="text-muted small">
          Điều khoản dịch vụ · Chính sách bảo mật · Thông báo thu thập
        </p>
      </div>
    </div>
  );

  return isModal ? formContent : (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: '#f0f0f0' }}>
      {formContent}
    </div>
  );
};