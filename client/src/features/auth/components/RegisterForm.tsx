import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegister } from '@/features/auth/hooks/useAuth';
import { Link } from 'react-router-dom';

// Định nghĩa props cho RegisterForm
interface RegisterFormProps {
  isModal?: boolean; // True nếu form được render trong modal
  onSwitchToLogin?: () => void; // Hàm để chuyển sang modal đăng nhập
  onRegisterSuccess?: () => void; // Hàm để đóng modal sau khi đăng ký thành công
}

// CSS tùy chỉnh từ Login.html (tái sử dụng hoặc đưa vào file riêng)
const customStyles = `
    body {
        background-color: #f0f0f0;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
    .login-card { /* Tái sử dụng login-card style */
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
const registerSchema = z.object({
  username: z.string().min(3, "Tên người dùng phải có ít nhất 3 ký tự"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal('')),
  password: z.string().min(6, "Mật khẩu phải từ 6 ký tự"),
  confirmPassword: z.string().min(6, "Vui lòng xác nhận mật khẩu"),
  phonenumber: z.string().min(10, "Số điện thoại phải có ít nhất 10 số"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

export const RegisterForm: React.FC<RegisterFormProps> = ({ isModal = false, onSwitchToLogin, onRegisterSuccess }) => {
  const { control, handleSubmit, setError, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '', phonenumber: '' }
  });

  const { mutate: register, isPending } = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    const { confirmPassword, ...registerData } = data;
    
    if (registerData.email === '') {
      registerData.email = undefined;
    }

    register(registerData, {
      onSuccess: () => {
        onRegisterSuccess?.(); // Gọi hàm đóng modal nếu có
      },
      onError: (error: any) => {
        if (error?.response?.data?.field === 'username') {
          setError('username', { 
            type: 'manual', 
            message: 'Username này đã được sử dụng!' 
          });
        } else if (error?.response?.data?.field === 'email') {
          setError('email', {
            type: 'manual',
            message: 'Email này đã được sử dụng!'
          });
        }
      }
    });
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const formContent = (
    <div className="login-card">
      <h2 className="text-center fw-bold mb-2">Tạo tài khoản</h2>
      <p className="text-center text-muted mb-4">Chào mừng bạn gia nhập cộng đồng của chúng tôi!</p>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Username Input */}
        <div className="mb-3">
          <label htmlFor="username" className="form-label text-muted small">Tên người dùng</label>
          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                id="username"
                placeholder="Tên người dùng"
              />
            )}
          />
          {errors.username && <div className="invalid-feedback">{errors.username.message}</div>}
        </div>

        {/* Email Input */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label text-muted small">Email (Tùy chọn)</label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                id="email"
                placeholder="Email (Tùy chọn)"
              />
            )}
          />
          {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
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

        {/* Confirm Password Input */}
        <div className="mb-3 position-relative">
          <label htmlFor="confirmPassword" className="form-label text-muted small">Xác nhận mật khẩu</label>
          <div className="input-group">
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  id="confirmPassword"
                  placeholder="Xác nhận mật khẩu"
                />
              )}
            />
            <button
              className="btn btn-outline-secondary border-start-0"
              type="button"
              onClick={toggleConfirmPassword}
            >
              <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
            </button>
            {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
          </div>
        </div>

        {/* Phone Number Input */}
        <div className="mb-3">
          <label htmlFor="phonenumber" className="form-label text-muted small">Số điện thoại</label>
          <Controller
            name="phonenumber"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className={`form-control ${errors.phonenumber ? 'is-invalid' : ''}`}
                id="phonenumber"
                placeholder="Số điện thoại"
              />
            )}
          />
          {errors.phonenumber && <div className="invalid-feedback">{errors.phonenumber.message}</div>}
        </div>

        <button type="submit" className="btn btn-pinterest w-100 mb-3" disabled={isPending}>
          {isPending ? 'Đang đăng ký...' : 'Đăng ký ngay'}
        </button>
      </form>

      <div className="text-center">
        <p className="mb-2">Đã có tài khoản? <a href="#" onClick={onSwitchToLogin} className="text-decoration-none fw-bold text-danger">Đăng nhập ngay</a></p> {/* Đã thêm text-danger */}
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