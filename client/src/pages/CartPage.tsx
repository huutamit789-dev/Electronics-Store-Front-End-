import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useCart } from '@/contexts/CartContext';
import { cartService } from '@/features/cart/services/cartService';
import { CartItem } from '@/types/order';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8091/api';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, getTotalAmount } = useCartStore();
  const { isLoggedIn, user } = useAuthStore();
  const { logout } = useLogout();
  const { cart, updateCartItemQuantityContext, removeFromCartContext, clearCartContext, user: cartUser } = useCart();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState('');
  const [paymentResult, setPaymentResult] = useState<{ success: boolean; message: string } | null>(null);

  const displayItems = isLoggedIn && cart?.items ? cart.items.map(ci => ({
    productId: ci.product_id?._id || ci.product_id,
    productName: ci.product_id?.name || '',
    price: ci.price,
    quantity: ci.quantity,
    image_url: ci.product_id?.image_url || '',
    stock_quantity: 0
  })) : items;

  const displayTotal = isLoggedIn && cart?.items 
    ? cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    : getTotalAmount();
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (isLoggedIn && cartUser?._id) {
      updateCartItemQuantityContext(cartUser._id, productId, quantity);
    } else {
      updateQuantity(productId, quantity);
    }
  };

  const handleRemoveItem = (productId: string) => {
    if (isLoggedIn && cartUser?._id) {
      removeFromCartContext(cartUser._id, productId);
    } else {
      removeItem(productId);
    }
  };

  const handleClearCart = () => {
    if (isLoggedIn && cartUser?._id) {
      clearCartContext(cartUser._id);
    } else {
      clearCart();
    }
  };

  const handleCheckout = async () => {
    if (!isLoggedIn || !user) {
      handleShowLoginModal();
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      let userId = user.username;
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          userId = decoded.id || user.username;
        } catch (e) {
          console.error('Failed to decode token:', e);
        }
      }

      const orderItems = displayItems.map(item => ({
        product_id: item.productId,
        quantity: item.quantity
      }));

      const orderData = {
        user_id: userId,
        items: orderItems,
        total_price: displayTotal,
      };

      const orderResponse = await cartService.createOrder(orderData);
      const timestamp = Date.now();
      const orderId = `ORDER-${timestamp}`;
      setCurrentOrderId(orderId);
      
      // Lưu timestamp vào order để tìm lại sau
      const orderDataId = (orderResponse as any).data?._id || (orderResponse as any)._id;
      if (orderDataId) {
        await axios.put(`${API_BASE_URL}/orders/${orderDataId}`, { momo_order_id: orderId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // Hiển thị modal test payment ngay sau khi tạo order
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Lỗi khi tạo đơn hàng');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestPaymentResult = async (success: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/payments/momo/test-result`, {
        orderId: currentOrderId,
        success: success,
        amount: displayTotal
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setPaymentResult({
        success: response.data?.success || false,
        message: response.data?.message || (success ? 'Thanh toán thành công' : 'Thanh toán thất bại')
      });

      setShowPaymentModal(false);

      if (success) {
        handleClearCart();
        setShowSuccessToast(true);
        setTimeout(() => {
          setShowSuccessToast(false);
          navigate('/my-orders');
        }, 2000);
      }
    } catch (error) {
      console.error('Error testing payment result:', error);
      toast.error('Lỗi khi xử lý kết quả thanh toán');
    }
  };

  // Modal handlers
  const handleShowLoginModal = () => { setShowLoginModal(true); setShowRegisterModal(false); };
  const handleCloseLoginModal = () => setShowLoginModal(false);
  const handleShowRegisterModal = () => { setShowRegisterModal(true); setShowLoginModal(false); };
  const handleCloseRegisterModal = () => setShowRegisterModal(false);
  const handleSwitchToRegister = () => { setShowLoginModal(false); setShowRegisterModal(true); };
  const handleSwitchToLogin = () => { setShowRegisterModal(false); setShowLoginModal(true); };
  const handleLogout = () => { logout(); };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);

  const handleLogoClick = () => {
    setSearchQuery(''); // Clear search when clicking logo
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Header (Màu đỏ CellphoneS) */}
      <header className="bg-brand-red text-white sticky-top shadow-sm py-2 z-3">
        <div className="container d-flex align-items-center gap-4">
          <Link to="/" onClick={handleLogoClick} className="fs-4 fw-bold fst-italic d-flex align-items-center gap-1 cursor-pointer text-white text-decoration-none">
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
                {displayItems.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark" style={{fontSize: '0.6rem'}}>
                    {displayItems.length}
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

      <main className="container flex-grow-1 py-4">
        <div className="d-flex align-items-center mb-4">
          <button className="btn btn-outline-secondary me-3" onClick={() => navigate('/')}>
            <i className="bi bi-arrow-left"></i> Quay lại
          </button>
          <h1 className="mb-0">Giỏ hàng của bạn</h1>
        </div>

        {!displayItems || displayItems.length === 0 ? (
          <div className="alert alert-info" role="alert">
            <h4 className="alert-heading">Giỏ hàng trống!</h4>
            <p>Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy bắt đầu mua sắm!</p>
            <Link to="/" className="btn btn-primary mt-2">Tiếp tục mua sắm</Link>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="table-responsive mb-3 d-none d-md-block">
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Tổng cộng</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {displayItems.map((item: any) => (
                    <tr key={item.productId}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img src={item.image_url} alt={item.productName} className="img-thumbnail me-2" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                          <span>{item.productName}</span>
                        </div>
                      </td>
                      <td>{item.price.toLocaleString()} VNĐ</td>
                      <td>
                        <div className="input-group" style={{ width: '120px' }}>
                          <button className="btn btn-outline-secondary" type="button" onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}>
                            <i className="fas fa-minus"></i>
                          </button>
                          <input
                            type="number"
                            className="form-control text-center"
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item.productId, parseInt(e.target.value) || 1)}
                            min="1"
                          />
                          <button className="btn btn-outline-secondary" type="button" onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}>
                            <i className="fas fa-plus"></i>
                          </button>
                        </div>
                      </td>
                      <td>{(item.price * item.quantity).toLocaleString()} VNĐ</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleRemoveItem(item.productId)}>
                          <i className="fas fa-trash"></i> Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan={3} className="text-end">Tổng cộng:</th>
                    <th>{displayTotal.toLocaleString()} VNĐ</th>
                    <th>
                      <button className="btn btn-secondary btn-sm" onClick={handleClearCart}>
                        <i className="fas fa-trash-alt"></i> Xóa tất cả
                      </button>
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="d-md-none mb-3">
              {displayItems.map((item: any) => (
                <div key={item.productId} className="card mb-3">
                  <div className="card-body">
                    <div className="d-flex">
                      <img src={item.image_url} alt={item.productName} className="img-thumbnail me-3" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                      <div className="flex-grow-1">
                        <h6 className="card-title mb-1">{item.productName}</h6>
                        <p className="card-text text-danger fw-bold mb-2">{item.price.toLocaleString()} VNĐ</p>
                        <div className="d-flex align-items-center gap-2">
                          <div className="input-group" style={{ width: '100px' }}>
                            <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}>
                              <i className="fas fa-minus"></i>
                            </button>
                            <input
                              type="number"
                              className="form-control text-center"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuantity(item.productId, parseInt(e.target.value) || 1)}
                              min="1"
                            />
                            <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}>
                              <i className="fas fa-plus"></i>
                            </button>
                          </div>
                          <button className="btn btn-danger btn-sm" onClick={() => handleRemoveItem(item.productId)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                      <span className="fw-bold">Tổng: {(item.price * item.quantity).toLocaleString()} VNĐ</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="card">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Tổng cộng:</span>
                  <span className="fw-bold text-danger fs-5">{displayTotal.toLocaleString()} VNĐ</span>
                </div>
              </div>
              <button className="btn btn-secondary w-100 mt-2" onClick={handleClearCart}>
                <i className="fas fa-trash-alt"></i> Xóa tất cả
              </button>
            </div>

            <div className="text-end">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? 'Đang xử lý...' : 'Tiến hành thanh toán'}
              </button>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
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
      <LoginModal show={showLoginModal} onClose={handleCloseLoginModal} onSwitchToRegister={handleSwitchToRegister} onLoginSuccess={handleCloseLoginModal} />
      <RegisterModal show={showRegisterModal} onClose={handleCloseRegisterModal} onSwitchToLogin={handleSwitchToLogin} onRegisterSuccess={handleCloseRegisterModal} />

      {/* Payment Test Modal */}
      <div className={`modal fade ${showPaymentModal ? 'show' : ''}`} style={{ display: showPaymentModal ? 'block' : 'none' }} tabIndex={-1} role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Test Thanh Toán MoMo</h5>
              <button type="button" className="btn-close" onClick={() => setShowPaymentModal(false)}></button>
            </div>
            <div className="modal-body">
              <p>Đơn hàng đã được tạo. Vui lòng chọn kết quả thanh toán để test:</p>
              <div className="d-grid gap-2">
                <button className="btn btn-success btn-lg" onClick={() => handleTestPaymentResult(true)}>
                  <i className="bi bi-check-circle me-2"></i>Thanh toán thành công
                </button>
                <button className="btn btn-danger btn-lg" onClick={() => handleTestPaymentResult(false)}>
                  <i className="bi bi-x-circle me-2"></i>Thanh toán thất bại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showPaymentModal && <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>}

      {/* Payment Result Modal */}
      {paymentResult && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1} role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className={`modal-header ${paymentResult.success ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                <h5 className="modal-title">
                  {paymentResult.success ? <i className="bi bi-check-circle me-2"></i> : <i className="bi bi-x-circle me-2"></i>}
                  {paymentResult.success ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setPaymentResult(null)}></button>
              </div>
              <div className="modal-body">
                <p className="mb-0">{paymentResult.message}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setPaymentResult(null)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {paymentResult && <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>}

      {/* Toast Notification */}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
        <div
          className={`toast ${showSuccessToast ? 'show' : ''}`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{ backgroundColor: '#198754' }}
        >
          <div className="toast-header text-white">
            <i className="bi bi-check-circle-fill me-2"></i>
            <strong className="me-auto">Thành công</strong>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => setShowSuccessToast(false)}
            ></button>
          </div>
          <div className="toast-body text-white">
            Đặt hàng thành công! Đang chuyển đến trang đơn hàng...
          </div>
        </div>
      </div>
    </div>
  );
};