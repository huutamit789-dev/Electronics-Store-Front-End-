import React, { useEffect, useState } from 'react';
import axiosClient from "@/api/axiosClient";
import toast, { Toaster } from 'react-hot-toast'; // Import toast và Toaster

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

// Định nghĩa kiểu dữ liệu cho Order API Response (đã cập nhật)
interface OrderApiResponse {
    success: boolean;
    message: string;
    data: {
      orders: Order[];
      total: number;
      currentPage: number;
      totalPages: number;
    };
}

export const OrderManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null); // Không cần state error riêng nữa

  // States cho phân trang
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [ordersPerPage, setOrdersPerPage] = useState<number>(10); // Số đơn hàng trên mỗi trang
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // States cho các Modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // States cho dữ liệu
  const [currentOrder, setCurrentOrder] = useState<Order>({
    _id: '',
    user_id: '',
    products: [],
    total_amount: 0,
    status: 'pending',
    created_at: ''
  });
  const [newStatus, setNewStatus] = useState<Order['status']>('pending');

  useEffect(() => {
    fetchOrders(currentPage, ordersPerPage);
  }, [currentPage, ordersPerPage]);

  const fetchOrders = async (page: number, limit: number) => {
    try {
      setLoading(true);
      const response = await axiosClient.get<OrderApiResponse>(`http://localhost:8090/api/orders?page=${page}&limit=${limit}`);
      console.log("order", response);
      setOrders(response.data.data?.orders || []); // Lấy mảng orders từ data.data.orders
      setTotalOrders(response.data.data.total);
      setCurrentPage(response.data.data.currentPage);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast.error('Failed to load orders. Please try again later.'); // Thông báo lỗi bằng toast
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (orderId: string) => {
    const order = orders.find(o => o._id === orderId);
    if (order) {
      setCurrentOrder(order);
      setIsViewModalOpen(true);
    }
  };

  const handleUpdateStatus = (orderId: string) => {
    const order = orders.find(o => o._id === orderId);
    if (order) {
      setCurrentOrder(order);
      setNewStatus(order.status);
      setIsStatusModalOpen(true);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await axiosClient.put(`http://localhost:8090/api/orders/${currentOrder._id}/status`, { status: newStatus });
      setIsStatusModalOpen(false);
      fetchOrders(currentPage, ordersPerPage); // Cập nhật lại danh sách sau khi cập nhật trạng thái
      toast.success('Cập nhật trạng thái đơn hàng thành công!'); // Thông báo thành công bằng toast
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err);
      toast.error('Cập nhật trạng thái đơn hàng thất bại!'); // Thông báo lỗi bằng toast
    }
  };

  const confirmDeleteOrder = (orderId: string) => {
    const order = orders.find(o => o._id === orderId);
    if (order) {
      setCurrentOrder(order);
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteOrder = async () => {
    try {
      await axiosClient.delete(`http://localhost:8090/api/orders/${currentOrder._id}`);
      setIsDeleteModalOpen(false);
      fetchOrders(currentPage, ordersPerPage); // Cập nhật lại danh sách sau khi xóa
      toast.success('Xóa đơn hàng thành công!'); // Thông báo thành công bằng toast
    } catch (err) {
      console.error('Lỗi khi xóa đơn hàng:', err);
      toast.error('Xóa đơn hàng thất bại!'); // Thông báo lỗi bằng toast
    }
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

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
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
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => confirmDeleteOrder(order._id)}>
                        <i className="fas fa-trash"></i> Xóa
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
              Hiển thị {orders.length} trên {totalOrders} đơn hàng (Trang {currentPage} / {totalPages})
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
          <div className="modal-dialog modal-lg"><div className="modal-content">
            <div className="modal-header"><h5 className="modal-title">Chi tiết đơn hàng</h5></div>
            <div className="modal-body">
              <p><strong>ID:</strong> {currentOrder._id}</p>
              <p><strong>ID Người dùng:</strong> {currentOrder.user_id}</p>
              <p><strong>Tổng tiền:</strong> {currentOrder.total_amount.toLocaleString()} VNĐ</p>
              <p><strong>Trạng thái:</strong> {currentOrder.status.toUpperCase()}</p>
              <p><strong>Ngày đặt:</strong> {new Date(currentOrder.created_at).toLocaleString()}</p>
              <h6 className="mt-3">Sản phẩm:</h6>
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Tên sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrder.products.map((product, index) => (
                    <tr key={index}>
                      <td>{product.name}</td>
                      <td>{product.quantity}</td>
                      <td>{product.price.toLocaleString()} VNĐ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsViewModalOpen(false)}>Đóng</button>
            </div>
          </div></div>
        </div>
      )}

      {/* MODAL CẬP NHẬT TRẠNG THÁI */}
      {isStatusModalOpen && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog"><div className="modal-content">
            <div className="modal-header"><h5 className="modal-title">Cập nhật trạng thái</h5></div>
            <div className="modal-body">
              <p><strong>ID Đơn hàng:</strong> {currentOrder._id}</p>
              <p><strong>Trạng thái hiện tại:</strong> {currentOrder.status.toUpperCase()}</p>
              <select className="form-control" value={newStatus} onChange={(e) => setNewStatus(e.target.value as Order['status'])}>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsStatusModalOpen(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleStatusUpdate}>Cập nhật</button>
            </div>
          </div></div>
        </div>
      )}

      {/* MODAL XÓA */}
      {isDeleteModalOpen && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog"><div className="modal-content">
            <div className="modal-header"><h5 className="modal-title">Xác nhận xóa</h5></div>
            <div className="modal-body">Bạn có chắc chắn muốn xóa đơn hàng <strong>{currentOrder._id}</strong> không?</div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Hủy</button>
              <button className="btn btn-danger" onClick={handleDeleteOrder}>Xóa</button>
            </div>
          </div></div>
        </div>
      )}
    </>
  );
};