import React, { useEffect, useState } from 'react';
import axiosClient from "@/api/axiosClient";
import toast, { Toaster } from 'react-hot-toast';
import { API_BASE_URL } from '@/config/constants'; // Import toast và Toaster

// Định nghĩa kiểu dữ liệu cho Payment
interface Payment {
  _id: string;
  order_id: any; // Có thể là string ID hoặc object Order (khi được populate từ backend)
  user_id: any;  // Có thể là string ID hoặc object User
  amount: number;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed';
  transaction_id?: string;
  created_at: string;
}

// Định nghĩa kiểu dữ liệu cho Payment API Response (đã cập nhật)
interface PaymentApiResponse {
    success: boolean;
    message: string;
    data: {
      payments: Payment[];
      total: number;
      currentPage: number;
      totalPages: number;
    };
}

export const PaymentManagementPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null); // Không cần state error riêng nữa

  // States cho phân trang
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [paymentsPerPage, setPaymentsPerPage] = useState<number>(10); // Số thanh toán trên mỗi trang
  const [totalPayments, setTotalPayments] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');

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
    fetchPayments(currentPage, paymentsPerPage);
  }, [currentPage, paymentsPerPage]);

  const fetchPayments = async (page: number, limit: number) => {
    try {
      setLoading(true);
      const response = await axiosClient.get<PaymentApiResponse>(`${API_BASE_URL}/payments?page=${page}&limit=${limit}`);
      console.log("paymentt",response);
      setPayments(response.data.data?.payments || []); // Lấy mảng payments từ data.data.payments
      setTotalPayments(response.data.data.total);
      setCurrentPage(response.data.data.currentPage);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      console.error('Error fetching payments:', err);
      toast.error('Failed to load payments. Please try again later.'); // Thông báo lỗi bằng toast
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

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const filteredPayments = payments.filter((payment) => {
    const keyword = searchTerm.toLowerCase();
    const orderId = typeof payment.order_id === 'object' ? payment.order_id?._id : payment.order_id;
    const userId = typeof payment.user_id === 'object' ? payment.user_id?._id : payment.user_id;
    return (
      payment._id?.toLowerCase().includes(keyword) ||
      orderId?.toLowerCase().includes(keyword) ||
      userId?.toLowerCase().includes(keyword) ||
      payment.payment_method?.toLowerCase().includes(keyword) ||
      payment.status?.toLowerCase().includes(keyword)
    );
  });

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

  // if (error) { // Đã thay thế bằng toast.error
  //   return (
  //     <div className="alert alert-danger" role="alert">
  //       <h4 className="alert-heading">Lỗi!</h4>
  //       <p>{error}</p>
  //     </div>
  //   );
  // }

  return (
    <>
      <Toaster /> {/* Component Toaster để hiển thị các toast */}
      <h1 className="h3 mb-4 text-gray-800">Quản lý Thanh toán</h1>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Danh sách Thanh toán</h6>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-4 ms-auto">
              <div className="input-group">
                <span className="input-group-text"><i className="fas fa-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm thanh toán..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>
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
                {filteredPayments.map((payment) => (
                  <tr key={payment._id}>
                    <td><span className="d-inline-block text-truncate" style={{ maxWidth: '100px' }}>{payment._id}</span></td>
                    <td><span className="d-inline-block text-truncate" style={{ maxWidth: '100px' }}>
                      {typeof payment.order_id === 'object' ? payment.order_id?._id : payment.order_id}
                    </span></td>
                    <td><span className="d-inline-block text-truncate" style={{ maxWidth: '100px' }}>
                      {typeof payment.user_id === 'object' ? (payment.user_id?.username || payment.user_id?._id) : payment.user_id}
                    </span></td>
                    <td>{(payment.amount ?? 0).toLocaleString()} VNĐ</td>
                    <td>{payment.payment_method}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(payment.status)}`}>
                        {(payment.status ?? 'N/A').toUpperCase()}
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
          {/* Pagination Controls */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              Hiển thị {filteredPayments.length} trên {totalPayments} thanh toán (Trang {currentPage} / {totalPages})
            </div>
            <nav>
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    Previous
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(i + 1)}>
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    Next
                  </button>
                </li>
              </ul>
            </nav>
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
              <p><strong>ID Đơn hàng:</strong> {typeof currentPayment.order_id === 'object' ? currentPayment.order_id?._id : currentPayment.order_id}</p>
              <p><strong>ID Người dùng:</strong> {typeof currentPayment.user_id === 'object' ? (currentPayment.user_id?.username || currentPayment.user_id?._id) : currentPayment.user_id}</p>
              <p><strong>Số tiền:</strong> {(currentPayment.amount ?? 0).toLocaleString()} VNĐ</p>
              <p><strong>Phương thức:</strong> {currentPayment.payment_method}</p>
              <p><strong>Trạng thái:</strong> {(currentPayment.status ?? 'N/A').toUpperCase()}</p>
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