/**
 * @file CartPage.tsx
 * @description Frontend Cart page displaying items in user's shopping cart.
 * Integrates search bar, item updates/removals, coupon verification, discount summary, and MoMo checkout payment.
 */

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
import { couponService } from '@/features/coupons/services/couponService';
import { formatVND } from '@/lib/formatters';
import { footerService } from '@/features/footers/services/footerService';
import { transactionService } from '@/features/transactions/services/transactionService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8091/api';

/**
 * @component CartPage
 * @description Renders the shopping cart details, handles quantities, coupon application, and order creation.
 */
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
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState('');
  const [paymentResult, setPaymentResult] = useState<{ success: boolean; message: string; payload?: any } | null>(null);

  // States của Coupon giảm giá
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [footer, setFooter] = useState<any>(null);
  
  // States cho phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'balance' | 'cod'>('momo');
  const [accountInfo, setAccountInfo] = useState<any>(null);

  // Mảng sản phẩm hiển thị tùy thuộc vào trạng thái đăng nhập
  const displayItems = isLoggedIn && cart?.items ? cart.items.map(ci => ({
    productId: ci.product_id?._id || ci.product_id,
    productName: ci.product_id?.name || '',
    price: ci.price,
    quantity: ci.quantity,
    image_url: ci.product_id?.image_url || '',
    stock_quantity: 0
  })) : items;

  // Tính tổng tiền tạm tính
  const displayTotal = isLoggedIn && cart?.items 
    ? cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    : getTotalAmount();

  // Tự động tính toán lại số tiền giảm khi tổng tiền tạm tính thay đổi
  useEffect(() => {
    if (appliedCoupon) {
      let newDiscount = 0;
      if (appliedCoupon.discount_type === 'percentage') {
        newDiscount = (displayTotal * appliedCoupon.discount_value) / 100;
        // Kiểm tra số tiền giảm tối đa
        if (appliedCoupon.max_discount_amount && newDiscount > appliedCoupon.max_discount_amount) {
          newDiscount = appliedCoupon.max_discount_amount;
        }
      } else {
        newDiscount = appliedCoupon.discount_value;
      }

      // Không được giảm giá âm hoặc lớn hơn tổng tiền đơn hàng
      if (newDiscount > displayTotal) {
        newDiscount = displayTotal;
      }

      setDiscountAmount(newDiscount);
    }
  }, [displayTotal, appliedCoupon]);

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const response = await footerService.getActiveFooter();
        if (response.success && response.data) {
          setFooter(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch footer:', error);
      }
    };
    fetchFooter();
  }, []);

  // Load account info when logged in
  useEffect(() => {
    const loadAccountInfo = async () => {
      if (isLoggedIn) {
        try {
          const response = await transactionService.getAccountInfo();
          if (response.success) {
            setAccountInfo(response.data);
          }
        } catch (error) {
          console.error('Failed to load account info:', error);
        }
      }
    };
    loadAccountInfo();
  }, [isLoggedIn]);

  /**
   * @function handleUpdateQuantity
   * @description Modifies the quantity of a target item in the cart.
   * @param {string} productId - Product identifier.
   * @param {number} quantity - Target quantity.
   */
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return;
    if (isLoggedIn && cartUser?._id) {
      updateCartItemQuantityContext(cartUser._id, productId, quantity);
    } else {
      updateQuantity(productId, quantity);
    }
  };

  /**
   * @function handleRemoveItem
   * @description Deletes an item from the cart.
   * @param {string} productId - Product identifier.
   */
  const handleRemoveItem = (productId: string) => {
    if (isLoggedIn && cartUser?._id) {
      removeFromCartContext(cartUser._id, productId);
    } else {
      removeItem(productId);
    }
  };

  /**
   * @function handleClearCart
   * @description Empties all items inside the cart.
   */
  const handleClearCart = () => {
    if (isLoggedIn && cartUser?._id) {
      clearCartContext(cartUser._id);
    } else {
      clearCart();
    }
    // Gỡ mã giảm giá nếu giỏ hàng trống
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  /**
   * @function handleApplyCoupon
   * @description Connects to the backend coupon verify API to validate and apply the discount.
   */
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }

    try {
      const response = await couponService.verifyCoupon(couponInput, displayTotal);
      if (response.success) {
        setAppliedCoupon(response.data);
        setDiscountAmount(response.data.discountAmount);
        toast.success(`Áp dụng mã ${response.data.code} thành công!`);
      } else {
        toast.error(response.message || 'Mã giảm giá không hợp lệ');
      }
    } catch (error: any) {
      console.error('Lỗi khi áp dụng coupon:', error);
      const errMsg = error.response?.data?.message || 'Lỗi khi áp dụng mã giảm giá';
      toast.error(errMsg);
    }
  };

  /**
   * @function handleRemoveCoupon
   * @description Clears the currently applied discount code.
   */
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponInput('');
    toast.success('Đã gỡ mã giảm giá');
  };

  /**
   * @function handleCheckout
   * @description Processes order creation with final discounted prices.
   */
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

      // Kiểm tra số dư nếu chọn thanh toán bằng tài khoản
      if (paymentMethod === 'balance') {
        if (!accountInfo || accountInfo.balance < (displayTotal - discountAmount)) {
          toast.error('Số dư tài khoản không đủ. Vui lòng nạp thêm tiền hoặc chọn phương thức thanh toán khác.');
          setIsProcessing(false);
          return;
        }
      }

      // Đơn hàng lưu cả giá gốc, mã giảm giá và số tiền được giảm
      const orderData = {
        user_id: userId,
        items: orderItems,
        total_price: displayTotal - discountAmount, // Số tiền sau chiết khấu
        original_price: displayTotal, // Số tiền trước chiết khấu
        discount_amount: discountAmount,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        payment_method: paymentMethod
      };

      const orderResponse = await cartService.createOrder(orderData);
      
      // Nếu thanh toán bằng tài khoản, không cần qua MoMo
      if (paymentMethod === 'balance') {
        handleClearCart();
        toast.success('Thanh toán bằng tài khoản thành công!');
        setTimeout(() => {
          navigate('/my-orders');
        }, 2000);
        return;
      }

      // Nếu thanh toán bằng MoMo hoặc COD, tiếp tục luồng hiện tại
      const timestamp = Date.now();
      const orderId = `ORDER-${timestamp}`;
      setCurrentOrderId(orderId);
      
      const orderDataId = (orderResponse as any).data?._id || (orderResponse as any)._id;
      if (orderDataId) {
        await axios.put(`${API_BASE_URL}/orders/${orderDataId}`, { momo_order_id: orderId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // Cho môi trường dev: Hiển thị Modal để chọn kết quả test và xem payload trả về
      setShowPaymentModal(true);
    } catch (error: any) {
      console.error('Error creating order:', error);
      const errMsg = error.response?.data?.message || 'Lỗi khi tạo đơn hàng';
      toast.error(errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * @function handleTestPaymentResult
   * @description Mocks MoMo payment gateways callback responses.
   * @param {boolean} success - Represents mockup payment response state.
   */
  const handleTestPaymentResult = async (success: boolean) => {
    try {
      setShowPaymentModal(false);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/payments/momo/test-result`, {
        orderId: currentOrderId,
        success: success,
        amount: displayTotal - discountAmount
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setPaymentResult({
        success: response.data?.success || false,
        message: response.data?.message || (success ? 'Thanh toán thành công' : 'Thanh toán thất bại'),
        payload: response.data?.data // Lưu payload MoMo phản hồi để hiển thị cho dev
      });

      setShowPaymentModal(false);

      if (success) {
        handleClearCart();
        toast.success('Thanh toán thành công!');
        setTimeout(() => {
          navigate('/my-orders');
        }, 2000);
      } else {
        toast.error('Thanh toán thất bại!');
      }
    } catch (error) {
      console.error('Error testing payment result:', error);
      toast.error('Lỗi khi xử lý kết quả thanh toán');
    }
  };

  const handleShowLoginModal = () => { setShowLoginModal(true); setShowRegisterModal(false); };
  const handleCloseLoginModal = () => setShowLoginModal(false);
  const handleShowRegisterModal = () => { setShowRegisterModal(true); setShowLoginModal(false); };
  const handleCloseRegisterModal = () => setShowRegisterModal(false);
  const handleSwitchToRegister = () => { setShowLoginModal(false); setShowRegisterModal(true); };
  const handleSwitchToLogin = () => { setShowRegisterModal(false); setShowLoginModal(true); };
  const handleLogout = () => { logout(); };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);

  const handleLogoClick = () => {
    setSearchQuery('');
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
          <button className="btn btn-outline-secondary me-3 rounded-3" onClick={() => navigate('/')}>
            <i className="bi bi-arrow-left"></i> Quay lại trang chủ
          </button>
          <h1 className="mb-0 fs-3 fw-bold text-gray-800">Giỏ hàng của bạn</h1>
        </div>

        {!displayItems || displayItems.length === 0 ? (
          <div className="alert alert-info shadow-sm rounded-4 p-4" role="alert">
            <h4 className="alert-heading fw-bold">Giỏ hàng trống!</h4>
            <p className="mb-3">Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy lựa chọn sản phẩm phù hợp!</p>
            <Link to="/" className="btn btn-danger rounded-3 px-4 py-2 fw-bold">Quay lại mua sắm</Link>
          </div>
        ) : (
          <div className="row g-4">
            {/* Danh sách sản phẩm bên trái (col-lg-8) */}
            <div className="col-lg-8">
              {/* Desktop Table View */}
              <div className="table-responsive mb-3 d-none d-md-block bg-white p-3 rounded-4 shadow-sm border">
                <table className="table table-align-middle align-middle m-0">
                  <thead>
                    <tr>
                      <th className="border-0">Sản phẩm</th>
                      <th className="border-0">Đơn giá</th>
                      <th className="border-0" style={{ width: '130px' }}>Số lượng</th>
                      <th className="border-0">Tổng tiền</th>
                      <th className="border-0 text-center" style={{ width: '100px' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayItems.map((item: any) => (
                      <tr key={item.productId}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img src={item.image_url} alt={item.productName} className="img-thumbnail me-3 rounded-3" style={{ width: '55px', height: '55px', objectFit: 'contain' }} />
                            <span className="fw-semibold text-gray-800">{item.productName}</span>
                          </div>
                        </td>
                        <td className="fw-medium">{formatVND(item.price)}</td>
                        <td>
                          <div className="input-group input-group-sm border rounded-3" style={{ maxWidth: '120px' }}>
                            <button className="btn btn-light border-0" type="button" onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}>
                              <i className="bi bi-dash"></i>
                            </button>
                            <input
                              type="text"
                              className="form-control text-center bg-transparent border-0"
                              value={item.quantity}
                              readOnly
                            />
                            <button className="btn btn-light border-0" type="button" onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}>
                              <i className="bi bi-plus"></i>
                            </button>
                          </div>
                        </td>
                        <td className="fw-bold text-gray-900">{formatVND(item.price * item.quantity)}</td>
                        <td className="text-center">
                          <button className="btn btn-outline-danger btn-sm rounded-3 border-light-subtle" onClick={() => handleRemoveItem(item.productId)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-start mt-3 pt-3 border-top">
                  <button className="btn btn-outline-secondary btn-sm rounded-3 fw-bold" onClick={handleClearCart}>
                    <i className="bi bi-trash-fill me-1"></i> Xóa tất cả sản phẩm
                  </button>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="d-md-none mb-3">
                {displayItems.map((item: any) => (
                  <div key={item.productId} className="card mb-3 border border-light rounded-4 shadow-sm p-2 bg-white">
                    <div className="card-body p-2">
                      <div className="d-flex align-items-center">
                        <img src={item.image_url} alt={item.productName} className="img-thumbnail me-3 rounded-3" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                        <div className="flex-grow-1">
                          <h6 className="card-title fw-bold text-gray-800 mb-1" style={{ fontSize: '0.9rem' }}>{item.productName}</h6>
                          <p className="text-brand-red fw-bold mb-2 small">{formatVND(item.price)}</p>
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="input-group input-group-sm border rounded-3" style={{ width: '100px' }}>
                              <button className="btn btn-light border-0" type="button" onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}>
                                <i className="bi bi-dash"></i>
                              </button>
                              <input
                                type="text"
                                className="form-control text-center bg-transparent border-0"
                                value={item.quantity}
                                readOnly
                              />
                              <button className="btn btn-light border-0" type="button" onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}>
                                <i className="bi bi-plus"></i>
                              </button>
                            </div>
                            <button className="btn btn-outline-danger btn-sm rounded-3" onClick={() => handleRemoveItem(item.productId)}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top text-gray-800 fw-bold small">
                        <span>Tổng mặt hàng:</span>
                        <span>{formatVND(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <button className="btn btn-outline-secondary w-100 rounded-3 py-2 fw-bold" onClick={handleClearCart}>
                  <i className="bi bi-trash-fill me-1"></i> Xóa tất cả sản phẩm
                </button>
              </div>
            </div>

            {/* Sidebar Tóm tắt đơn hàng + Mã giảm giá bên phải (col-lg-4) */}
            <div className="col-lg-4">
              <div className="card border-0 rounded-4 shadow-sm p-4 bg-white sticky-top" style={{ top: '80px' }}>
                <h5 className="fw-bold text-gray-800 mb-3 pb-2 border-bottom">Tóm tắt đơn hàng</h5>
                
                {/* Khu vực áp dụng mã giảm giá */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-secondary small mb-2">Mã giảm giá (Coupon)</label>
                  <div className="input-group">
                    <input 
                      type="text" 
                      className="form-control rounded-start-3 border-light-subtle text-uppercase fw-semibold" 
                      placeholder="Nhập mã KM" 
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      disabled={appliedCoupon !== null}
                    />
                    {appliedCoupon ? (
                      <button className="btn btn-outline-danger px-3 rounded-end-3 fw-bold" type="button" onClick={handleRemoveCoupon}>
                        Gỡ bỏ
                      </button>
                    ) : (
                      <button className="btn btn-danger px-3 rounded-end-3 fw-bold" type="button" onClick={handleApplyCoupon}>
                        Áp dụng
                      </button>
                    )}
                  </div>
                  {appliedCoupon && (
                    <div className="text-success small mt-1 fw-bold">
                      <i className="bi bi-patch-check-fill me-1"></i>
                      Đã giảm {appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : formatVND(appliedCoupon.discount_value)}
                    </div>
                  )}
                </div>

                {/* Phương thức thanh toán */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-secondary small mb-2">Phương thức thanh toán</label>
                  <div className="d-flex flex-column gap-2">
                    <div className={`card border ${paymentMethod === 'momo' ? 'border-primary bg-light' : 'border-light-subtle'} cursor-pointer`} onClick={() => setPaymentMethod('momo')}>
                      <div className="card-body py-2 px-3 d-flex align-items-center gap-2">
                        <input type="radio" name="paymentMethod" checked={paymentMethod === 'momo'} readOnly />
                        <i className="bi bi-phone text-danger fs-5"></i>
                        <div>
                          <div className="fw-semibold small">MoMo</div>
                          <div className="text-muted small">Thanh toán qua ví MoMo</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`card border ${paymentMethod === 'balance' ? 'border-primary bg-light' : 'border-light-subtle'} cursor-pointer`} onClick={() => setPaymentMethod('balance')}>
                      <div className="card-body py-2 px-3 d-flex align-items-center gap-2">
                        <input type="radio" name="paymentMethod" checked={paymentMethod === 'balance'} readOnly />
                        <i className="bi bi-wallet2 text-primary fs-5"></i>
                        <div className="flex-grow-1">
                          <div className="fw-semibold small">Số dư tài khoản</div>
                          <div className="text-muted small">Số dư: {formatVND(accountInfo?.balance || 0)}</div>
                        </div>
                        {accountInfo && accountInfo.balance < (displayTotal - discountAmount) && (
                          <span className="badge bg-danger small">Không đủ</span>
                        )}
                      </div>
                    </div>
                    
                    <div className={`card border ${paymentMethod === 'cod' ? 'border-primary bg-light' : 'border-light-subtle'} cursor-pointer`} onClick={() => setPaymentMethod('cod')}>
                      <div className="card-body py-2 px-3 d-flex align-items-center gap-2">
                        <input type="radio" name="paymentMethod" checked={paymentMethod === 'cod'} readOnly />
                        <i className="bi bi-cash text-success fs-5"></i>
                        <div>
                          <div className="fw-semibold small">Thanh toán khi nhận hàng (COD)</div>
                          <div className="text-muted small">Trả tiền khi nhận sản phẩm</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chi tiết hóa đơn */}
                <div className="d-flex justify-content-between mb-2 small">
                  <span className="text-secondary">Tạm tính:</span>
                  <span className="fw-semibold text-dark">{formatVND(displayTotal)}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="d-flex justify-content-between mb-2 small text-success fw-semibold">
                    <span>Mã giảm giá:</span>
                    <span>-{formatVND(discountAmount)}</span>
                  </div>
                )}
                
                <hr className="my-3 border-light-subtle" />
                
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="fw-bold text-gray-800">Tổng thanh toán:</span>
                  <span className="fw-bold text-danger fs-4">{formatVND(displayTotal - discountAmount)}</span>
                </div>
                
                <button
                  className="btn btn-danger btn-lg w-100 rounded-3 fw-bold py-2 fs-6 shadow-sm"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Đang xử lý...' : 'Tiến hành đặt hàng'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white py-5 mt-auto border-top border-secondary">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <h4 className="fw-bold mb-3 fs-5">{footer?.company_name || 'ElectroStore'}</h4>
              <p className="text-secondary small">{footer?.company_description}</p>
            </div>
            <div className="col-md-4">
              <h4 className="fw-bold mb-3 fs-6">{footer?.policy_title || 'Chính sách'}</h4>
              <ul className="list-unstyled text-secondary small">
                {footer?.policies && footer.policies.length > 0 ? (
                  footer.policies.map((policy: any, index: number) => (
                    <li key={index} className="mb-2">
                      <Link to={policy.link} className="text-decoration-none text-secondary">{policy.title}</Link>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="mb-2"><Link to="#" className="text-decoration-none text-secondary">Bảo hành</Link></li>
                    <li className="mb-2"><Link to="#" className="text-decoration-none text-secondary">Đổi trả</Link></li>
                  </>
                )}
              </ul>
            </div>
            <div className="col-md-4">
              <h4 className="fw-bold mb-3 fs-6">{footer?.contact_title || 'Liên hệ'}</h4>
              <ul className="list-unstyled text-secondary small">
                {footer?.contacts && footer.contacts.length > 0 ? (
                  footer.contacts.map((contact: any, index: number) => (
                    <li key={index} className="mb-2">
                      <i className={`bi ${contact.icon} me-2`}></i> {contact.text}
                    </li>
                  ))
                ) : (
                  <>
                    <li className="mb-2"><i className="bi bi-telephone me-2"></i> Hotline: 1900 xxxx</li>
                    <li className="mb-2"><i className="bi bi-envelope me-2"></i> CSKH: cskh@electrostore.com</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals xác thực */}
      <LoginModal show={showLoginModal} onClose={handleCloseLoginModal} onSwitchToRegister={handleSwitchToRegister} onLoginSuccess={handleCloseLoginModal} />
      <RegisterModal show={showRegisterModal} onClose={handleCloseRegisterModal} onSwitchToLogin={handleSwitchToLogin} onRegisterSuccess={handleCloseRegisterModal} />

      {/* Payment Test Modal */}
      <div className={`modal fade ${showPaymentModal ? 'show' : ''}`} style={{ display: showPaymentModal ? 'block' : 'none' }} tabIndex={-1} role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">Test Thanh Toán MoMo</h5>
              <button type="button" className="btn-close" onClick={() => setShowPaymentModal(false)}></button>
            </div>
            <div className="modal-body">
              <p className="text-secondary">Đơn hàng đã được tạo. Vui lòng chọn kết quả thanh toán để test:</p>
              <div className="d-grid gap-2 mt-3">
                <button className="btn btn-success btn-lg rounded-3 fw-bold" onClick={() => handleTestPaymentResult(true)}>
                  <i className="bi bi-check-circle me-2"></i>Thanh toán thành công
                </button>
                <button className="btn btn-danger btn-lg rounded-3 fw-bold" onClick={() => handleTestPaymentResult(false)}>
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
                <h5 className="modal-title fw-bold">
                  {paymentResult.success ? <i className="bi bi-check-circle me-2"></i> : <i className="bi bi-x-circle me-2"></i>}
                  {paymentResult.success ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setPaymentResult(null)}></button>
              </div>
              <div className="modal-body">
                <p className="mb-3 text-secondary">{paymentResult.message}</p>
                {paymentResult.payload && (
                  <div className="mt-3">
                    <span className="small text-muted fw-bold d-block mb-1">MoMo Callback Payload (DEV):</span>
                    <pre className="bg-light p-3 rounded text-start border small overflow-auto" style={{ maxHeight: '200px', fontFamily: 'monospace' }}>
                      {JSON.stringify(paymentResult.payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary rounded-3" onClick={() => setPaymentResult(null)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {paymentResult && <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>}
    </div>
  );
};