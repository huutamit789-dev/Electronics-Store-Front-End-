import React, { useEffect, useState } from 'react';
// Xóa các import Ant Design
// import { Table, Button, Space, Typography, Spin, Alert, Tag } from 'antd';
// import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';

// Định nghĩa kiểu dữ liệu cho Order Product
interface OrderProduct {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
}

// Định nghĩa kiểu dữ liệu cho Order
interface Order {
  _id: string;
  user_id: string; // Hoặc có thể là object user đầy đủ
  products: OrderProduct[];
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  // Thêm các trường khác nếu có
}

// Định nghĩa kiểu dữ liệu cho Order API Response
interface OrderApiResponse {
    success: boolean;
    message: string;
    data: Order[]; // Giả định API trả về trực tiếp mảng Order
}

export const OrderManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Endpoint: GET /api/orders
        const response = await axios.get<OrderApiResponse>('http://localhost:8090/api/orders');
        setOrders(response.data.data || []);
        console.log('Fetched orders:', response.data.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleViewOrder = (orderId: string) => {
    console.log('Event: View order button clicked for order ID:', orderId);
    // Logic để xem chi tiết đơn hàng
  };

  const handleUpdateStatus = (orderId: string) => {
    console.log('Event: Update status button clicked for order ID:', orderId);
    // Logic để mở modal/form cập nhật trạng thái
  };

  const handleDeleteOrder = (orderId: string) => {
    console.log('Event: Delete order button clicked for order ID:', orderId);
    // Logic để xác nhận và xóa đơn hàng
  };

  const getStatusBadgeClass = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-secondary';
      case 'processing': return 'bg-info';
      case 'shipped': return 'bg-primary';
      case 'delivered': return 'bg-success';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải đơn hàng...</span>
        </div>
        <span className="ms-2">Đang tải đơn hàng...</span>
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
      <h1 className="h3 mb-4 text-gray-800">Quản lý Đơn hàng</h1>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Danh sách Đơn hàng</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th>ID Đơn hàng</th>
                  <th>ID Người dùng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td><span className="d-inline-block text-truncate" style={{ maxWidth: '100px' }}>{order._id}</span></td>
                    <td><span className="d-inline-block text-truncate" style={{ maxWidth: '100px' }}>{order.user_id}</span></td>
                    <td>{order.total_amount.toLocaleString()} VNĐ</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td>{new Date(order.created_at).toLocaleString()}</td>
                    <td>
                      <button type="button" className="btn btn-info btn-sm me-2" onClick={() => handleViewOrder(order._id)}>
                        <i className="fas fa-eye"></i> Xem
                      </button>
                      <button type="button" className="btn btn-warning btn-sm me-2" onClick={() => handleUpdateStatus(order._id)}>
                        <i className="fas fa-edit"></i> Cập nhật TT
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDeleteOrder(order._id)}>
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