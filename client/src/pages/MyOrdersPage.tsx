import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '@/api/axiosClient';
import { useAuthStore } from '@/store/useAuthStore';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL } from '@/config/constants';

interface OrderItem {
  product_id: {
    _id: string;
    name: string;
    image_url: string;
  };
  quantity: number;
}

interface Order {
  _id: string;
  user_id: string;
  items: OrderItem[];
  total_price: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

export const MyOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      navigate('/');
      return;
    }

    fetchOrders();
  }, [isLoggedIn, user, navigate]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Get userId from token decode
      let userId;
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          userId = decoded?.id || decoded?.userId || decoded?.user?._id || decoded?.sub;
          console.log('Decoded token:', decoded);
          console.log('UserId:', userId);
        } catch (e) {
          console.error('Error decoding token:', e);
        }
      }

      if (!userId) {
        setError('User ID not found in token');
        return;
      }
      const response = await axiosClient.get(`${API_BASE_URL}/orders/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setOrders(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to fetch orders');
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge bg-warning">Đang chờ</span>;
      case 'completed':
        return <span className="badge bg-success">Hoàn thành</span>;
      case 'cancelled':
        return <span className="badge bg-danger">Đã hủy</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-light text-dark justify-content-center align-items-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 fs-5">Đang tải đơn hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-light text-dark justify-content-center align-items-center">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Lỗi!</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light text-dark">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg sticky-top mb-4">
        <div className="container d-flex flex-wrap justify-content-between align-items-center">
          <div className="d-flex justify-content-between align-items-center w-100">
            <a className="navbar-brand fw-bold fs-3 text-danger" href="/">Electro<span className="text-dark">Store</span></a>
            <div className="d-flex gap-3">
              <a href="/cart" className="text-dark"><i className="bi bi-cart3 fs-4"></i></a>
              <div className="dropdown">
                <a className="nav-link dropdown-toggle text-dark d-flex align-items-center" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i className="bi bi-person fs-4 me-2"></i>
                  {user?.username}
                </a>
                <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                  <li><a className="dropdown-item" href="/profile">Thông tin cá nhân</a></li>
                  <li><a className="dropdown-item" href="/my-orders">Đơn hàng của tôi</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item" href="#" onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/';
                  }}>Đăng xuất</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container flex-grow-1" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
        <div className="d-flex align-items-center mb-4">
          <button className="btn btn-outline-secondary me-3" onClick={() => navigate('/')}>
            <i className="bi bi-arrow-left"></i> Quay lại
          </button>
          <h1 className="mb-0">Đơn hàng của tôi</h1>
        </div>

        {orders.length === 0 ? (
          <div className="alert alert-info" role="alert">
            <h4 className="alert-heading">Chưa có đơn hàng!</h4>
            <p>Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!</p>
            <button className="btn btn-danger mt-3" onClick={() => navigate('/')}>
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="row">
            {orders.map((order) => (
              <div className="col-12 mb-4" key={order._id}>
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted">Mã đơn hàng: #{order._id}</small>
                      <div className="small text-muted">
                        Ngày đặt: {new Date(order.created_at).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>Sản phẩm</th>
                            <th>Số lượng</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, index) => (
                            <tr key={index}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <img
                                    src={item.product_id.image_url}
                                    alt={item.product_id.name}
                                    className="img-thumbnail me-2"
                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                  />
                                  <span>{item.product_id.name}</span>
                                </div>
                              </td>
                              <td>{item.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="text-end mt-3">
                      <strong>Tổng tiền: {order.total_price.toLocaleString()} VNĐ</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
