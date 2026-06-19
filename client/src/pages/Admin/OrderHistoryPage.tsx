import React, { useEffect, useState } from 'react';
import axiosClient from "@/api/axiosClient";
// Định nghĩa kiểu dữ liệu cho Order History Item (có thể giống Order hoặc có thêm/bớt trường)
interface OrderHistoryItem {
  _id: string;
  user_id: string;
  products: { product_id: string; name: string; quantity: number; price: number }[];
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  // Thêm các trường khác nếu có
}

// Định nghĩa kiểu dữ liệu cho Order History API Response
interface OrderHistoryApiResponse {
    success: boolean;
    message: string;
    data: OrderHistoryItem[]; // Giả định API trả về trực tiếp mảng OrderHistoryItem
}

export const OrderHistoryPage: React.FC = () => {
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        setLoading(true);
        // Endpoint: GET /api/orderHistory
        const response = await axiosClient.get<OrderHistoryApiResponse>('http://localhost:8090/api/orderHistory');
        setOrderHistory(response.data.data || []);
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

  const getStatusBadgeClass = (status: OrderHistoryItem['status']) => {
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
                  <th>ID Đơn hàng</th>
                  <th>ID Người dùng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orderHistory.map((order) => (
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
                      <button type="button" className="btn btn-info btn-sm" onClick={() => handleViewOrderDetails(order._id)}>
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