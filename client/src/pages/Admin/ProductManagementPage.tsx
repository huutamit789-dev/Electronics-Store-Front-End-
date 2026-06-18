import React, { useEffect, useState } from 'react';
// Xóa các import Ant Design
// import { Table, Button, Space, Typography, Spin, Alert, Image } from 'antd';
// import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Product, ProductApiResponse } from '@/types/product';

// Không cần import AdminLayout ở đây nữa

// Định nghĩa kiểu dữ liệu cho Category (nếu cần)
interface Category {
  _id: string;
  name: string;
}

export const ProductManagementPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get<ProductApiResponse>('http://localhost:8090/api/products/getAllProduct');
        const fetchedProducts = response.data.data?.categories?.flatMap(category => category.products) || [];
        setProducts(fetchedProducts);
        console.log('Fetched products:', fetchedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    console.log('Event: Add new product button clicked');
    // Logic để mở form thêm sản phẩm
  };

  const handleEditProduct = (productId: string) => {
    console.log('Event: Edit product button clicked for product ID:', productId);
    // Logic để mở form chỉnh sửa sản phẩm với productId
  };

  const handleDeleteProduct = (productId: string) => {
    console.log('Event: Delete product button clicked for product ID:', productId);
    // Logic để xác nhận và xóa sản phẩm
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải sản phẩm...</span>
        </div>
        <span className="ms-2">Đang tải sản phẩm...</span>
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
      <h1 className="h3 mb-4 text-gray-800">Quản lý Sản phẩm</h1>
      <button type="button" className="btn btn-primary mb-3" onClick={handleAddProduct}>
        <i className="fas fa-plus me-2"></i> Thêm sản phẩm mới
      </button>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Danh sách Sản phẩm</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên sản phẩm</th>
                  <th>Giá</th>
                  <th>Số lượng tồn kho</th>
                  <th>Danh mục</th>
                  <th>Hình ảnh</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td><span className="d-inline-block text-truncate" style={{ maxWidth: '100px' }}>{product._id}</span></td>
                    <td>{product.name}</td>
                    <td>{product.price.toLocaleString()} VNĐ</td>
                    <td>{product.stock_quantity}</td>
                    <td>{product.category_id}</td>
                    <td>
                      <img src={product.image_url} alt={product.name} className="img-thumbnail" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                    </td>
                    <td>
                      <button type="button" className="btn btn-warning btn-sm me-2" onClick={() => handleEditProduct(product._id)}>
                        <i className="fas fa-edit"></i> Sửa
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDeleteProduct(product._id)}>
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