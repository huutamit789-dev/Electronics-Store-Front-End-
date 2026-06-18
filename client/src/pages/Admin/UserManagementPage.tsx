import React, { useEffect, useState } from 'react';
// Xóa các import Ant Design
// import { Table, Button, Space, Typography, Spin, Alert } from 'antd';
// import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

// Định nghĩa kiểu dữ liệu cho User
interface User {
  _id: string;
  username: string;
  email: string;
  role: string; // Ví dụ: 'admin', 'user'
  // Thêm các trường khác nếu có
}

// Định nghĩa kiểu dữ liệu cho User API Response
interface UserApiResponse {
    success: boolean;
    message: string;
    data: User[]; // Giả định API trả về trực tiếp mảng User
}

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Endpoint: GET /api/users
        const response = await axios.get<UserApiResponse>('http://localhost:8090/api/users');
        setUsers(response.data.data || []); // Giả định data là mảng users
        console.log('Fetched users:', response.data.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = () => {
    console.log('Event: Add new user button clicked');
    // Logic để mở form thêm người dùng
  };

  const handleEditUser = (userId: string) => {
    console.log('Event: Edit user button clicked for user ID:', userId);
    // Logic để mở form chỉnh sửa người dùng với userId
  };

  const handleDeleteUser = (userId: string) => {
    console.log('Event: Delete user button clicked for user ID:', userId);
    // Logic để xác nhận và xóa người dùng
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải người dùng...</span>
        </div>
        <span className="ms-2">Đang tải người dùng...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Lỗi!</h4>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="h3 mb-4 text-gray-800">Quản lý Người dùng</h1>
      <button type="button" className="btn btn-primary mb-3" onClick={handleAddUser}>
        <i className="fas fa-plus me-2"></i> Thêm người dùng mới
      </button>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Danh sách Người dùng</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên đăng nhập</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td><span className="d-inline-block text-truncate" style={{ maxWidth: '100px' }}>{user._id}</span></td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <button type="button" className="btn btn-warning btn-sm me-2" onClick={() => handleEditUser(user._id)}>
                        <i className="fas fa-edit"></i> Sửa
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(user._id)}>
                        <i className="fas fa-trash"></i> Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};