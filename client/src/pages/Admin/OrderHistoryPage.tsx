import React, { useEffect, useState } from 'react';
import axiosClient from "@/api/axiosClient";
import { API_BASE_URL } from '@/config/constants';

// Định nghĩa kiểu dữ liệu cho Order History Item
interface OrderHistoryItem {
  _id: string;
  order_id: {
    _id: string;
    user_id?: {
      _id: string;
      username: string;
      email: string;
    };
    items: { product_id: { name: string }; quantity: number; price: number }[];
    total_price: number;
    status: string;
    created_at: string;
  };
  old_status: string;
  new_status: string;
  changed_at: string;
  note?: string;
}

// Định nghĩa kiểu dữ liệu cho Order History API Response
interface OrderHistoryApiResponse {
    success: boolean;
    message: string;
    data: {
      history: OrderHistoryItem[];
      total: number;
      totalPages: number;
      currentPage: number;
    };
}

export const OrderHistoryPage: React.FC = () => {
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        // Endpoint: GET /api/order-history
        const response = await axiosClient.get<OrderHistoryApiResponse>(`${API_BASE_URL}/order-history`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setOrderHistory(response.data.data.history || []);
        console.log('Fetched order history:', response.data.data);
      } catch (err) {
        console.error('Error fetching order history:', err);
        setError('Failed to load order history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, []);

  const handleViewOrderDetails = (orderId: string) => {
    console.log('Event: View order details button clicked for order ID:', orderId);
    // Logic để xem chi tiết đơn hàng lịch sử
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-secondary';
      case 'processing': return 'bg-info';
      case 'shipped': return 'bg-primary';
      case 'delivered': return 'bg-success';
      case 'cancelled': return 'bg-danger';
      case 'completed': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải lịch sử đơn hàng...</span>
        </div>
        <span className="ms-2">Đang tải lịch sử đơn hàng...</span>
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
      <h1 className="h3 mb-4 text-gray-800">Lịch sử Đơn hàng</h1>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Danh sách Lịch sử Đơn hàng</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th>ID Lịch sử</th>
                  <th>ID Đơn hàng</th>
                  <th>Tên người dùng</th>
                  <th>Trạng thái cũ</th>
                  <th>Trạng thái mới</th>
                  <th>Thời gian thay đổi</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orderHistory.map((history) => (
                  <tr key={history._id}>
                    <td><span className="d-inline-block text-truncate" style={{ maxWidth: '100px' }}>{history._id}</span></td>
                    <td><span className="d-inline-block text-truncate" style={{ maxWidth: '100px' }}>{history.order_id?._id || 'N/A'}</span></td>
                    <td><span className="d-inline-block text-truncate" style={{ maxWidth: '150px' }}>
                      {typeof history.order_id?.user_id === 'object' ? history.order_id.user_id?.username : history.order_id?.user_id || 'N/A'}
                    </span></td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(history.old_status)}`}>
                        {history.old_status?.toUpperCase() || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(history.new_status)}`}>
                        {history.new_status?.toUpperCase() || 'N/A'}
                      </span>
                    </td>
                    <td>{new Date(history.changed_at).toLocaleString()}</td>
                    <td>
                      <button type="button" className="btn btn-info btn-sm" onClick={() => handleViewOrderDetails(history.order_id?._id || '')}>
                        <i className="fas fa-eye"></i> Xem chi tiết
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