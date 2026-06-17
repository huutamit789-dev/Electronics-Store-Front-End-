// src/features/auth/components/RegisterForm.tsx
import { Form, Input, Button, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registerUser } from '@/features/auth/services/authService';

const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải từ 6 ký tự"),
  confirmPassword: z.string().min(6, "Vui lòng xác nhận mật khẩu"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

export const RegisterForm = () => {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      await registerUser(data);
      message.success("Đăng ký thành công! Hãy đăng nhập.");
    } catch (error) {
      message.error("Đăng ký thất bại, email có thể đã tồn tại.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20 }}>
      <h2>Đăng ký tài khoản</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller name="email" control={control} render={({ field, fieldState: { error } }) => (
          <Form.Item validateStatus={error ? 'error' : ''} help={error?.message}>
            <Input {...field} size="large" placeholder="Email" />
          </Form.Item>
        )} />
        
        <Controller name="password" control={control} render={({ field, fieldState: { error } }) => (
          <Form.Item validateStatus={error ? 'error' : ''} help={error?.message}>
            <Input.Password {...field} size="large" placeholder="Mật khẩu" />
          </Form.Item>
        )} />

        <Controller name="confirmPassword" control={control} render={({ field, fieldState: { error } }) => (
          <Form.Item validateStatus={error ? 'error' : ''} help={error?.message}>
            <Input.Password {...field} size="large" placeholder="Xác nhận mật khẩu" />
          </Form.Item>
        )} />

        <Button type="primary" htmlType="submit" size="large" block>Đăng ký</Button>
      </form>
    </div>
  );
};