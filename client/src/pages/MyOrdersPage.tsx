import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '@/api/axiosClient';
import { useAuthStore } from '@/store/useAuthStore';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL } from '@/config/constants';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { useCartStore } from '@/store/useCartStore';
import axios from 'axios';
import '@/assets/UserHomePage.css';

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

interface Category {
  _id: string;
  name: string;
  description: string;
  __v: number;
}

interface CategoryApiResponse {
  success: boolean;
  message: string;
  data: { categories: Category[] };
}

export const MyOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const { logout } = useLogout();
  const { getTotalItems } = useCartStore();

  useEffect(() => {
    if (!isLoggedIn || !user) {
      navigate('/');
      return;
    }

    fetchOrders();
  }, [isLoggedIn, user, navigate]);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 300;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const checkLoginStatus = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const userRole = (decoded?.role || decoded?.user?.role || '').toLowerCase();
        setRole(userRole);
      } catch (e) {
        logout();
      }
    } else {
      setRole(null);
    }
  }, [logout]);

  useEffect(() => {
    if (role && role.toLowerCase().trim() === 'admin') {
      navigate('/admin');
    }
  }, [role, navigate]);

  useEffect(() => { checkLoginStatus(); }, [checkLoginStatus]);

  const fetchCategories = useCallback(async () => {
    try {
      const categoriesResponse = await axios.get<CategoryApiResponse>(`${API_BASE_URL}/categories`);
      setCategories(categoriesResponse.data.data.categories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    if (categoryId) {
      navigate(`/category/${categoryId}`);
    } else {
      navigate('/');
    }
  };

  const handleShowLoginModal = () => { setShowLoginModal(true); setShowRegisterModal(false); };
  const handleCloseLoginModal = () => setShowLoginModal(false);
  const handleShowRegisterModal = () => { setShowRegisterModal(true); setShowLoginModal(false); };
  const handleCloseRegisterModal = () => setShowRegisterModal(false);
  const handleSwitchToRegister = () => { setShowLoginModal(false); setShowRegisterModal(true); };
  const handleSwitchToLogin = () => { setShowRegisterModal(false); setShowLoginModal(true); };
  const handleLogout = () => { logout(); setRole(null); };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);

  const handleLoginSuccess = () => {
    handleCloseLoginModal();
    checkLoginStatus();
    setTimeout(() => {
      const token = localStorage.getItem('access_token');
      if (token) {
        const decoded: any = jwtDecode(token);
        const userRole = (decoded?.role || decoded?.user?.role || '').toLowerCase();
        if (userRole === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          window.location.reload();
        }
      }
    }, 100);
  };

  const handleRegisterSuccess = () => {
    handleCloseRegisterModal();
    checkLoginStatus();
  };

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
    <div className="d-flex flex-column min-vh-100 bg-light">
      
      {/* Header (Màu đỏ CellphoneS) */}
      <header className="bg-brand-red text-white sticky-top shadow-sm py-2 z-3">
        <div className="container d-flex align-items-center gap-4">
          <Link to="/" className="fs-4 fw-bold fst-italic d-flex align-items-center gap-1 cursor-pointer text-white text-decoration-none">
            <i className="bi bi-phone text-warning" style={{ transform: 'rotate(-15deg)' }}></i> ElectroStore
          </Link>

          <div className="flex-grow-1 position-relative d-none d-md-block">
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm, thương hiệu..." 
              className="form-control rounded-pill px-4 py-2 search-input shadow-inner"
              value={searchQuery}
              onChange={handleSearch}
            />
            <i className="bi bi-search position-absolute text-muted" style={{ right: '15px', top: '10px' }}></i>
          </div>

          <div className="d-flex align-items-center gap-4 ms-auto text-center">
            <Link to="/cart" className="cursor-pointer text-white text-decoration-none hover-lift">
              <i className="bi bi-cart3 fs-5 position-relative">
                {getTotalItems() > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark" style={{fontSize: '0.6rem'}}>
                    {getTotalItems()}
                  </span>
                )}
              </i>
              <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Giỏ hàng</div>
            </Link>
            
            {isLoggedIn ? (
              <div className="d-flex align-items-center gap-3">
                <div className="cursor-pointer hover-lift text-white text-decoration-none">
                  <i className="bi bi-person-check fs-5"></i>
                  <div style={{ fontSize: '10px', fontWeight: 'bold' }}>{user?.username}</div>
                </div>
                <div className="cursor-pointer hover-lift text-white text-decoration-none" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right fs-5"></i>
                  <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Đăng xuất</div>
                </div>
              </div>
            ) : (
              <div className="cursor-pointer hover-lift" onClick={handleShowLoginModal}>
                <i className="bi bi-person fs-5"></i>
                <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Tài khoản</div>
              </div>
            )}
          </div>
        </div>
      </header>

      

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

      {/* Footer Mới */}
      <footer className="bg-dark text-white py-5 mt-auto">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <h4 className="fw-bold mb-3 fs-5">ElectroStore</h4>
              <p className="text-secondary small">Hệ thống bán lẻ thiết bị công nghệ chính hãng hàng đầu Việt Nam.</p>
            </div>
            <div className="col-md-4">
              <h4 className="fw-bold mb-3 fs-6">Chính sách</h4>
              <ul className="list-unstyled text-secondary small">
                <li className="mb-2"><Link to="#" className="text-decoration-none text-secondary">Bảo hành</Link></li>
                <li className="mb-2"><Link to="#" className="text-decoration-none text-secondary">Đổi trả</Link></li>
              </ul>
            </div>
            <div className="col-md-4">
              <h4 className="fw-bold mb-3 fs-6">Liên hệ</h4>
              <ul className="list-unstyled text-secondary small">
                <li className="mb-2"><i className="bi bi-telephone me-2"></i> Hotline: 1900 xxxx</li>
                <li className="mb-2"><i className="bi bi-envelope me-2"></i> CSKH: cskh@electrostore.com</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal show={showLoginModal} onClose={handleCloseLoginModal} onSwitchToRegister={handleSwitchToRegister} onLoginSuccess={handleLoginSuccess} />
      <RegisterModal show={showRegisterModal} onClose={handleCloseRegisterModal} onSwitchToLogin={handleSwitchToLogin} onRegisterSuccess={handleRegisterSuccess} />
    </div>
  );
};
