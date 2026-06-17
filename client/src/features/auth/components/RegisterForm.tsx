import { useForm, Controller } from 'react-hook-form';
import { User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegister } from '@/features/auth/hooks/useAuth';
import { Form, Input, Button, message, Card, Typography, Divider } from 'antd';

// 1. Schema xác thực
const registerSchema = z.object({
  username: z.string().min(3, "Username phải có ít nhất 3 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải từ 6 ký tự"),
  confirmPassword: z.string().min(6, "Vui lòng xác nhận mật khẩu"),
  phonenumber: z.string().min(10, "Số điện thoại phải có ít nhất 10 số"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

// Cấu hình các trường để map hiển thị
const formFields = [
  { name: 'username', placeholder: 'Tên người dùng', icon: <User size={18} className="text-gray-400" /> },
  { name: 'email', placeholder: 'Email', icon: <Mail size={18} className="text-gray-400" /> },
  { name: 'password', placeholder: 'Mật khẩu', icon: <Lock size={18} className="text-gray-400" />, type: 'password' },
  { name: 'confirmPassword', placeholder: 'Xác nhận mật khẩu', icon: <Lock size={18} className="text-gray-400" />, type: 'password' },
  { name: 'phonenumber', placeholder: 'Số điện thoại', icon: <Phone size={18} className="text-gray-400" /> },
];

export const RegisterForm = () => {
  // Lấy thêm setError từ useForm
  const { control, handleSubmit, setError } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '', phonenumber: '' }
  });

  const { mutate: register, isPending } = useRegister();

  const onSubmit = (data: any) => {
    const { confirmPassword, ...registerData } = data;
    
    // Gọi mutation
    register(registerData, {
      onError: (error: any) => {
        if (error?.response?.data?.field === 'username') {
          setError('username', { 
            type: 'manual', 
            message: 'Username này đã được sử dụng!' 
          });
        }
        // Lưu ý: Không cần gọi toast.error ở đây nữa vì useRegister đã làm rồi
      }
    });
  };

  // ... phần render giữ nguyên

  return (
<div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <Card className="w-full max-w-md mx-auto shadow-2xl border-none rounded-3xl p-6 sm:p-8" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div className="text-center mb-6">
          <Typography.Title level={2} style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Tạo tài khoản
          </Typography.Title>
          <Typography.Text type="secondary">
            Chào mừng bạn gia nhập cộng đồng của chúng tôi!
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
            Đăng ký ngay <ArrowRight size={18} className="inline ml-2" />
          </Button>

          <Divider className="text-gray-400 text-sm">Hoặc</Divider>
          
          <div className="text-center mt-4">
            <span className="text-gray-600">Đã có tài khoản? </span>
            <a href="/login" className="text-blue-600 font-semibold hover:underline">
              Đăng nhập ngay
            </a>
          </div>
        </form>
      </Card>
    </div>
  );
};