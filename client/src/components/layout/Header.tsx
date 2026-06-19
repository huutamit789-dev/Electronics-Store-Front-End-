import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { useAuthStore } from '@/store/useAuthStore';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { useCartStore } from '@/store/useCartStore';

interface CustomHeaderProps {
  searchQuery?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CustomHeader: React.FC<CustomHeaderProps> = ({ searchQuery, onSearchChange }) => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuthStore();
  const { logout } = useLogout();
  const items = useCartStore((state) => state.items);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleShowLoginModal = () => { setShowLoginModal(true); setShowRegisterModal(false); };
  const handleCloseLoginModal = () => setShowLoginModal(false);
  const handleCloseRegisterModal = () => setShowRegisterModal(false);
  const handleSwitchToRegister = () => { setShowLoginModal(false); setShowRegisterModal(true); };
  const handleSwitchToLogin = () => { setShowRegisterModal(false); setShowLoginModal(true); };

  const handleLogout = () => {
    logout();
  };

  const handleLoginSuccess = () => {
    handleCloseLoginModal();
    setTimeout(() => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const decoded: { role?: string; user?: { role?: string } } = jwtDecode(token);
          const userRole = (decoded?.role || decoded?.user?.role || '').toLowerCase();
          if (userRole === 'admin') {
            navigate('/admin', { replace: true });
            return;
          }
        } catch {
          // Token không hợp lệ -> bỏ qua, vẫn reload bên dưới
        }
      }
      window.location.reload();
    }, 100);
  };

  const handleRegisterSuccess = () => {
    handleCloseRegisterModal();
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg sticky-top mb-4 bg-white shadow-sm">
        <div className="container d-flex flex-wrap justify-content-between align-items-center">
          <div className="d-flex justify-content-between align-items-center w-100">
            <Link className="navbar-brand fw-bold fs-3 text-danger" to="/">Electro<span className="text-dark">Store</span></Link>
            <div className="d-flex gap-3 align-items-center">
              <Link to="/cart" className="text-dark position-relative">
                <i className="bi bi-cart3 fs-4"></i>
                {totalItems > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {totalItems}
                    <span className="visually-hidden">sản phẩm trong giỏ hàng</span>
                  </span>
                )}
              </Link>
              {isLoggedIn ? (
                <div className="dropdown">
                  <a className="nav-link dropdown-toggle text-dark d-flex align-items-center" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className="bi bi-person fs-4 me-2"></i>
                    {user?.username}
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                    <li><Link className="dropdown-item" to="/profile">Thông tin cá nhân</Link></li>
                    <li><Link className="dropdown-item" to="/my-orders">Đơn hàng của tôi</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><a className="dropdown-item" href="#" onClick={handleLogout}>Đăng xuất</a></li>
                  </ul>
                </div>
              ) : (
                <a href="#" className="text-dark" onClick={handleShowLoginModal}><i className="bi bi-person fs-4"></i></a>
              )}
            </div>
          </div>
          <div className="w-100 mt-2 mt-lg-0">
            <input
              className="form-control rounded-pill"
              type="search"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery ?? ''}
              onChange={onSearchChange}
            />
          </div>
        </div>
      </nav>

      <LoginModal
        show={showLoginModal}
        onClose={handleCloseLoginModal}
        onSwitchToRegister={handleSwitchToRegister}
        onLoginSuccess={handleLoginSuccess}
      />
      <RegisterModal
        show={showRegisterModal}
        onClose={handleCloseRegisterModal}
        onSwitchToLogin={handleSwitchToLogin}
        onRegisterSuccess={handleRegisterSuccess}
      />
    </>
  );
};
