import { Form, Input, Button, Card, Typography, Divider } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, User, Lock, ArrowRight } from 'lucide-react';
import { useLogin } from '@/features/auth/hooks/useAuth';

// 1. Schema xác thực
const loginSchema = z.object({
  username: z.string().min(3, "Username phải có ít nhất 3 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải từ 6 ký tự"),
});

// Cấu hình các trường hiển thị
const formFields = [
  { name: 'username', placeholder: 'Tên người dùng', icon: <User size={18} className="text-gray-400" /> },
  { name: 'email', placeholder: 'Email', icon: <Mail size={18} className="text-gray-400" /> },
  { name: 'password', placeholder: 'Mật khẩu', icon: <Lock size={18} className="text-gray-400" />, type: 'password' },
];

export const LoginForm = () => {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', email: '', password: '' }
  });

  const { mutate: login, isPending } = useLogin();

  const onSubmit = (data: any) => {
    login(data);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl border-none rounded-3xl p-6 sm:p-8"  style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div className="text-center mb-6">
          <Typography.Title level={2} style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Đăng nhập
          </Typography.Title>
          <Typography.Text type="secondary">
            Chào mừng bạn quay trở lại!
          </Typography.Text>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
          {formFields.map((field) => (
            <Controller
              key={field.name}
              name={field.name as any}
              control={control}
              render={({ field: inputProps, fieldState: { error } }) => (
                <Form.Item 
                  validateStatus={error ? 'error' : ''} 
                  help={error?.message}
                  className="mb-5"
                >
                  {field.type === 'password' ? (
                    <Input.Password 
                      {...inputProps} 
                      size="large" 
                      prefix={field.icon} 
                      placeholder={field.placeholder}
                      className="rounded-xl py-2.5"
                    />
                  ) : (
                    <Input 
                      {...inputProps} 
                      size="large" 
                      prefix={field.icon} 
                      placeholder={field.placeholder}
                      className="rounded-xl py-2.5"
                    />
                  )}
                </Form.Item>
              )}
            />
          ))}

          <Button 
            type="primary" 
            htmlType="submit" 
            size="large" 
            block 
            loading={isPending}
            className="h-12 text-lg font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 mt-2 shadow-md shadow-blue-200 transition-all"
          >
            Đăng nhập <ArrowRight size={18} className="inline ml-2" />
          </Button>

          <Divider className="text-gray-400 text-sm">Hoặc</Divider>
          
          <div className="text-center mt-4">
            <span className="text-gray-600">Chưa có tài khoản? </span>
            <a href="/register" className="text-blue-600 font-semibold hover:underline">
              Đăng ký ngay
            </a>
          </div>
        </form>
      </Card>
    </div>
  );
};