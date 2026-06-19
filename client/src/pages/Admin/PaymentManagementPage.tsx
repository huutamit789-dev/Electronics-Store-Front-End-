import React, { useEffect, useState } from 'react';
// Xóa các import Ant Design
// import { Table, Button, Space, Typography, Spin, Alert, Tag } from 'antd';
// import { EyeOutlined } from '@ant-design/icons';
import axios from 'axios';

// Định nghĩa kiểu dữ liệu cho Payment
interface Payment {
  _id: string;
  order_id: string; // ID của đơn hàng liên quan
  user_id: string;  // ID của người dùng thực hiện thanh toán
  amount: number;
  payment_method: string; // Ví dụ: 'Credit Card', 'PayPal', 'COD'
  status: 'pending' | 'completed' | 'failed';
  transaction_id?: string; // ID giao dịch từ cổng thanh toán
  created_at: string;
  // Thêm các trường khác nếu có
}

// Định nghĩa kiểu dữ liệu cho Payment API Response
interface PaymentApiResponse {
    success: boolean;
    message: string;
    data: Payment[]; // Giả định API trả về trực tiếp mảng Payment
}

export const PaymentManagementPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // States cho Modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // States cho dữ liệu
  const [currentPayment, setCurrentPayment] = useState<Payment>({
    _id: '',
    order_id: '',
    user_id: '',
    amount: 0,
    payment_method: '',
    status: 'pending',
    transaction_id: '',
    created_at: ''
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get<PaymentApiResponse>('http://localhost:8090/api/payments');
      setPayments(response.data.data || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayment = (paymentId: string) => {
    const payment = payments.find(p => p._id === paymentId);
    if (payment) {
      setCurrentPayment(payment);
      setIsViewModalOpen(true);
    }
  };

  const getStatusBadgeClass = (status: Payment['status']) => {
    switch (status) {
      case 'pending': return 'bg-secondary';
      case 'completed': return 'bg-success';
      case 'failed': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải thanh toán...</span>
        </div>
        <span className="ms-2">Đang tải thanh toán...</span>
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
      <h1 className="h3 mb-4 text-gray-800">Quản lý Thanh toán</h1>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Danh sách Thanh toán</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th>ID Thanh toán</th>
                  <th>ID Đơn hàng</th>
                  <th>ID Người dùng</th>
                  <th>Số tiền</th>
                  <th>Phương thức</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td><span className="d-inline-block text-truncate" style={{ maxWidth: '100px' }}>{payment._id}</span></td>
                    <td><span className="d-inline-block text-truncate" style={{ maxWidth: '100px' }}>{payment.order_id}</span></td>
                    <td><span className="d-inline-block text-truncate" style={{ maxWidth: '100px' }}>{payment.user_id}</span></td>
                    <td>{payment.amount.toLocaleString()} VNĐ</td>
                    <td>{payment.payment_method}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(payment.status)}`}>
                        {payment.status.toUpperCase()}
                      </span>
                    </td>
                    <td>{new Date(payment.created_at).toLocaleString()}</td>
                    <td>
                      <button type="button" className="btn btn-info btn-sm" onClick={() => handleViewPayment(payment._id)}>
                        <i className="fas fa-eye"></i> Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL XEM CHI TIẾT */}
      {isViewModalOpen && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog"><div className="modal-content">
            <div className="modal-header"><h5 className="modal-title">Chi tiết thanh toán</h5></div>
            <div className="modal-body">
              <p><strong>ID Thanh toán:</strong> {currentPayment._id}</p>
              <p><strong>ID Đơn hàng:</strong> {currentPayment.order_id}</p>
              <p><strong>ID Người dùng:</strong> {currentPayment.user_id}</p>
              <p><strong>Số tiền:</strong> {currentPayment.amount.toLocaleString()} VNĐ</p>
              <p><strong>Phương thức:</strong> {currentPayment.payment_method}</p>
              <p><strong>Trạng thái:</strong> {currentPayment.status.toUpperCase()}</p>
              {currentPayment.transaction_id && <p><strong>ID Giao dịch:</strong> {currentPayment.transaction_id}</p>}
              <p><strong>Ngày tạo:</strong> {new Date(currentPayment.created_at).toLocaleString()}</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsViewModalOpen(false)}>Đóng</button>
            </div>
          </div></div>
        </div>
      )}
    </>
  );
};