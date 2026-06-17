// src/features/auth/components/LoginForm.tsx
import { Form, Input, Button, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { loginUser } from '@/features/auth/services/authService';

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải từ 6 ký tự"),
});

export const LoginForm = () => {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await loginUser(data);
      message.success("Đăng nhập thành công!");
      console.log(response);
    } catch (error) {
      message.error("Đăng nhập thất bại, vui lòng kiểm tra lại tài khoản.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #f0f0f0', borderRadius: 8 }}>
      <h2 style={{ textAlign: 'center' }}>Đăng nhập</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Email Field */}
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Form.Item validateStatus={error ? 'error' : ''} help={error?.message}>
              <Input {...field} size="large" placeholder="Email" />
            </Form.Item>
          )}
        />

        {/* Password Field */}
        <Controller
          name="password"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Form.Item validateStatus={error ? 'error' : ''} help={error?.message}>
              <Input.Password {...field} size="large" placeholder="Mật khẩu" />
            </Form.Item>
          )}
        />

        <Button type="primary" htmlType="submit" size="large" block>
          Đăng nhập
        </Button>
      </form>
    </div>
  );
};