import React, { useEffect, useState } from 'react';
// Xóa các import Ant Design
// import { Table, Button, Space, Typography, Spin, Alert } from 'antd';
// import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

// Định nghĩa kiểu dữ liệu cho Category
interface Category {
  _id: string;
  name: string;
  description: string;
  __v: number;
}

// Định nghĩa kiểu dữ liệu cho Category API Response
interface CategoryApiResponse {
    success: boolean;
    message: string;
    data: {
        categories: Category[];
    };
}

export const CategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get<CategoryApiResponse>('http://localhost:8090/api/categories');
        const fetchedCategories = response.data.data?.categories || [];
        setCategories(fetchedCategories);
        console.log('Fetched categories:', fetchedCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    console.log('Event: Add new category button clicked');
    // Logic để mở form thêm danh mục
  };

  const handleEditCategory = (categoryId: string) => {
    console.log('Event: Edit category button clicked for category ID:', categoryId);
    // Logic để mở form chỉnh sửa danh mục với categoryId
  };

  const handleDeleteCategory = (categoryId: string) => {
    console.log('Event: Delete category button clicked for category ID:', categoryId);
    // Logic để xác nhận và xóa danh mục
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải danh mục...</span>
        </div>
        <span className="ms-2">Đang tải danh mục...</span>
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
      <h1 className="h3 mb-4 text-gray-800">Quản lý Danh mục</h1>
      <button type="button" className="btn btn-primary mb-3" onClick={handleAddCategory}>
        <i className="fas fa-plus me-2"></i> Thêm danh mục mới
      </button>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Danh sách Danh mục</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên danh mục</th>
                  <th>Mô tả</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category._id}>
                    <td><span className="d-inline-block text-truncate" style={{ maxWidth: '100px' }}>{category._id}</span></td>
                    <td>{category.name}</td>
                    <td><span className="d-inline-block text-truncate" style={{ maxWidth: '200px' }}>{category.description}</span></td>
                    <td>
                      <button type="button" className="btn btn-warning btn-sm me-2" onClick={() => handleEditCategory(category._id)}>
                        <i className="fas fa-edit"></i> Sửa
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDeleteCategory(category._id)}>
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