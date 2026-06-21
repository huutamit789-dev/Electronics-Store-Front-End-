import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product } from '@/types/product';
import axiosClient from "@/api/axiosClient";
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { API_BASE_URL } from '@/config/constants';

// Định nghĩa kiểu dữ liệu cho Product Detail API Response
interface ProductDetailApiResponse {
  success: boolean;
  message: string;
  data: Product;
}

// Định nghĩa kiểu dữ liệu cho Category
interface Category {
  _id: string;
  name: string;
  description: string;
  __v: number;
}

// Định nghĩa kiểu dữ liệu cho Category API Response
interface CategoryApiResponse {
    success: boolean;
    message: string;
    data: {
        categories: Category[];
    };
}

// CSS tùy chỉnh từ ProductDetail.html
const customStyles = `
  :root { --cps-red: #d70018; }
  .text-cps-red { color: var(--cps-red); }
  .bg-cps-red { background-color: var(--cps-red); }
  .btn-cps { background-color: var(--cps-red); color: white; border-radius: 8px; }
  .btn-cps:hover { background-color: #b30013; color: white; }
  .price-current { font-size: 1.5rem; font-weight: 700; color: var(--cps-red); }
  .price-old { text-decoration: line-through; color: #6c757d; font-size: 0.9rem; }
  .sticky-action-bar { position: fixed; bottom: 0; width: 100%; background: white; border-top: 1px solid #ddd; z-index: 1000; padding: 10px 0; }
  .card-border { border: 1px solid #e0e0e0; border-radius: 12px; }
  /* Ẩn mũi tên lên xuống của input number */
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
`;

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [showCartToast, setShowCartToast] = useState(false);
  const [showStockWarning, setShowStockWarning] = useState(false);
  const [stockWarningMessage, setStockWarningMessage] = useState('');

  const { isLoggedIn, user } = useAuthStore();
  const { logout } = useLogout();
  const { addItem, getCountUniqueItems } = useCartStore();
  useEffect(() => {
    // Inject custom styles
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = customStyles;
    document.head.appendChild(styleSheet);

    const fetchData = async () => {
      if (!id) {
        setError('Product ID is missing.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Fetch product details
        const productResponse = await axiosClient.get<ProductDetailApiResponse>(`${API_BASE_URL}/products/${id}`);
        setProduct(productResponse.data.data);
        // Fetch categories
        const categoriesResponse = await axiosClient.get<CategoryApiResponse>(`${API_BASE_URL}/categories`);
        setCategories(categoriesResponse.data.data.categories);


      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load product details or categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      document.head.removeChild(styleSheet); // Clean up styles on unmount
    };
  }, [id]);

  // Add this useEffect to log state changes for debugging
  useEffect(() => {
    console.log('ProductDetailPage: showStockWarning state changed:', showStockWarning);
    if (showStockWarning) {
      console.log('ProductDetailPage: Stock Warning Message:', stockWarningMessage);
    }
  }, [showStockWarning, stockWarningMessage]);


  const handleAddToCart = () => {
    if (!product) return;
    if (!isLoggedIn) {
      handleShowLoginModal();
      return;
    }

    // 1. Tính toán số lượng đã có trong giỏ hàng trước đó
    const currentQtyInCart = useCartStore.getState().getItemQuantity(product._id);
    const totalRequested = currentQtyInCart + quantity;

    // 2. Validate tồn kho thực tế (Tồn kho tại DB - Số lượng đã có trong giỏ)
    if (product.stock_quantity <= 0) {
      setStockWarningMessage('Sản phẩm đã hết hàng.');
      setShowStockWarning(true);
      return;
    }

    if (totalRequested > product.stock_quantity) {
      const remaining = product.stock_quantity - currentQtyInCart;
      const msg = remaining > 0
          ? `Bạn đã có ${currentQtyInCart} cái trong giỏ. Chỉ có thể thêm tối đa ${remaining} cái nữa.`
          : `Sản phẩm này đã đạt giới hạn tồn kho trong giỏ hàng của bạn.`;

      setStockWarningMessage(msg);
      setShowStockWarning(true);
      return;
    }

    // 3. Thực hiện thêm vào giỏ
    const cartItem = {
      productId: product._id,
      productName: product.name,
      price: product.price,
      quantity: quantity,
      image_url: product.image_url,
      stock_quantity: product.stock_quantity
    };

    addItem(cartItem);
    setShowCartToast(true);
    setQuantity(1);

    setTimeout(() => setShowCartToast(false), 2000);
  };

  const handleBuyNow = () => {
    console.log('ProductDetailPage: === handleBuyNow called ===');
    console.log('ProductDetailPage: Product:', product);
    console.log('ProductDetailPage: User:', user);
    console.log('ProductDetailPage: Quantity at click:', quantity); // Log quantity at the moment of click

    if (!product) {
      alert('Không thể thêm sản phẩm vào giỏ hàng vì thông tin sản phẩm không đầy đủ.');
      return;
    }

    if (!isLoggedIn) {
      handleShowLoginModal();
      return;
    }

    // Re-validate quantity right before buying now
    if (product.stock_quantity <= 0) {
      console.log('ProductDetailPage: handleBuyNow: Stock is 0 or less. Showing warning.');
      const msg = 'Sản phẩm này đã hết hàng.';
      setStockWarningMessage(msg);
      setShowStockWarning(true);
      alert(msg); // Temporary alert for debugging
      return;
    }

    if (quantity < 1) {
      console.log('ProductDetailPage: handleBuyNow: Quantity less than 1. Showing warning.');
      const msg = 'Số lượng phải lớn hơn 0.';
      setStockWarningMessage(msg);
      setShowStockWarning(true);
      alert(msg); // Temporary alert for debugging
      return;
    }

    if (quantity > product.stock_quantity) {
      console.log('ProductDetailPage: handleBuyNow: Quantity exceeds stock. Showing warning.');
      const msg = `Số lượng bạn chọn (${quantity}) vượt quá số lượng tồn kho (${product.stock_quantity}).`;
      setStockWarningMessage(msg);
      setShowStockWarning(true);
      alert(msg); // Temporary alert for debugging
      return; // Crucial: stop execution if quantity is invalid
    }

    console.log('ProductDetailPage: handleBuyNow: Calling addItem with quantity:', quantity); // Log before addItem
    alert(`Mua ngay: ${quantity} sản phẩm.`); // Temporary alert before adding
    const cartItem = {
      productId: product._id,
      productName: product.name,
      price: product.price,
      quantity: quantity,
      image_url: product.image_url,
      stock_quantity: product.stock_quantity
    };

    addItem(cartItem);
    navigate('/cart');
  };

  const handleQuantityChange = (newQuantity: number) => {
    console.log('ProductDetailPage: handleQuantityChange called with newQuantity (input value):', newQuantity);
    if (!product) {
      console.log('ProductDetailPage: handleQuantityChange: Product data not available.');
      return;
    }

    const maxQuantity = product.stock_quantity || 0;
    console.log('ProductDetailPage: handleQuantityChange: Max stock:', maxQuantity);

    let updatedQuantity = newQuantity;

    // Ensure quantity is at least 1, unless stock is 0
    if (updatedQuantity < 1 && maxQuantity > 0) {
      console.log('ProductDetailPage: handleQuantityChange: Quantity less than 1, setting to 1.');
      updatedQuantity = 1;
    } else if (updatedQuantity < 0) { // Prevent negative quantity from direct input
      console.log('ProductDetailPage: handleQuantityChange: Quantity negative, setting to 0.');
      updatedQuantity = 0;
    }

    // Cap quantity at maxQuantity and show warning if exceeded
    if (updatedQuantity > maxQuantity) {
      console.log('ProductDetailPage: handleQuantityChange: Quantity exceeds stock. Setting to max stock and showing warning.');
      const msg = `Sản phẩm chỉ còn ${maxQuantity} cái, không thể chọn ${newQuantity} cái.`;
      setStockWarningMessage(msg);
      setShowStockWarning(true);
      updatedQuantity = maxQuantity; // Set to max available stock
    } else {
      console.log('ProductDetailPage: handleQuantityChange: Quantity is valid, hiding warning.');
      setShowStockWarning(false); // Hide warning if quantity is valid
    }
    
    setQuantity(updatedQuantity);
    console.log('ProductDetailPage: handleQuantityChange: Final quantity state set to:', updatedQuantity);
  };

  // Modal handlers
  const handleShowLoginModal = () => { setShowLoginModal(true); setShowRegisterModal(false); };
  const handleCloseLoginModal = () => setShowLoginModal(false);
  const handleShowRegisterModal = () => { setShowRegisterModal(true); setShowLoginModal(false); };
  const handleCloseRegisterModal = () => setShowRegisterModal(false);
  const handleSwitchToRegister = () => { setShowLoginModal(false); setShowRegisterModal(true); };
  const handleSwitchToLogin = () => { setShowRegisterModal(false); setShowLoginModal(true); };

  const handleLogout = () => {
    logout();
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Tìm tên danh mục dựa trên cate_id của sản phẩm
  // Sử dụng optional chaining an toàn hơn
  const categoryName = product ? categories.find(cat => cat._id === product.cate_id)?.name : 'Danh mục';

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-light text-dark justify-content-center align-items-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 fs-5">Đang tải chi tiết sản phẩm...</p>
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

  if (!product) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-light text-dark justify-content-center align-items-center">
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">Không tìm thấy sản phẩm!</h4>
          <p>Sản phẩm bạn đang tìm kiếm không tồn tại.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light text-dark">
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
                {getCountUniqueItems() > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark" style={{fontSize: '0.6rem'}}>
                    {getCountUniqueItems()}
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

      <nav className="container my-3 text-secondary small">
        <Link to="/" className="text-decoration-none text-secondary">Trang chủ</Link> /
        {/* Sử dụng cate_id thay vì category_id */}
        <Link to={`/?categoryId=${product!.cate_id || ''}`} className="text-decoration-none text-secondary"> {categoryName}</Link> /
        <span> {product!.name}</span>
      </nav>

      <main className="container flex-grow-1">
        <div className="row g-4">
          {/* Left Column */}
          <div className="col-md-7">
            <div className="card p-3 border-0 shadow-sm rounded-4">
              <img src={product.image_url} className="img-fluid rounded-3" alt={product.name} />
            </div>
            <div className="mt-4 card p-3 border-0 shadow-sm rounded-4">
              <h5 className="fw-bold">Mô tả sản phẩm</h5>
              <p className="text-muted">{product.description}</p>
              {/* Có thể thêm các tính năng nổi bật khác nếu có trong product object */}
            </div>
          </div>

          {/* Right Column */}
          <div className="col-md-5">
            <h2 className="fw-bold fs-4">{product.name}</h2>

            {/* Price Section */}
            <div className="card p-3 my-3 card-border">
              <div className="d-flex align-items-center gap-2">
                <span className="price-current">{product.price.toLocaleString()}₫</span>
                {/* Giả định có original_price để hiển thị giá cũ */}
                {/* <span className="price-old">31.990.000₫</span> */}
              </div>
              <div className="mt-2">
                <span className={`badge ${product.stock_quantity > 0 ? 'bg-success' : 'bg-danger'}`}>
                  {product.stock_quantity > 0 ? `Còn ${product.stock_quantity} cái` : 'Hết hàng'}
                </span>
              </div>
            </div>

            {/* Offers Section */}
            <div className="card p-3 card-border">
              <h6 className="fw-bold text-danger">🎁 Khuyến mãi</h6>
              <ul className="list-unstyled small mt-2">
                <li>• Trả góp 0% lãi suất</li>
                <li>• Tặng kèm bộ phụ kiện chính hãng</li>
                <li>• Bảo hành 24 tháng toàn quốc</li>
              </ul>
            </div>

            {/* Quantity Selector */}
            <div className="card p-3 card-border mt-3" style={{ position: 'relative', zIndex: 1 }}>
              <h6 className="fw-bold mb-3">Số lượng</h6>
              <div className="d-flex align-items-center gap-3">
                <div className="input-group" style={{ maxWidth: '150px', position: 'relative', zIndex: 2 }}>
                  <button className="btn btn-outline-secondary" type="button" onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity <= 1 && product.stock_quantity > 0}>
                    <i className="fas fa-minus"></i>
                  </button>
                  <input
                    type="number"
                    className="form-control text-center"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)} // Pass 0 if input is empty
                    min="0" // Allow 0 for direct input, then handle in logic
                    style={{ position: 'relative', zIndex: 3 }}
                  />
                  <button className="btn btn-outline-secondary" type="button" onClick={() => handleQuantityChange(quantity + 1)} disabled={quantity >= (product?.stock_quantity || 0)}>
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-grid gap-2 mt-4">
              <button
                className="btn btn-cps btn-lg"
                onClick={handleAddToCart}
                disabled={!product || product.stock_quantity <= 0 || quantity <= 0 || quantity > product.stock_quantity}
              >
                <i className="fas fa-shopping-cart me-2"></i>
                {product && product.stock_quantity <= 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
              </button>

            </div>
          </div>
        </div>
      </main>

      {/* Sticky Action Bar for Mobile */}
      <div className="sticky-action-bar d-md-none">
        <div className="container d-flex gap-2">
          <button className="btn btn-outline-danger flex-grow-1">Gọi tư vấn</button>
          <button className="btn btn-cps flex-grow-1" onClick={handleBuyNow}>Mua ngay</button>
        </div>
      </div>

     
      {/* Modals */}
      <LoginModal show={showLoginModal} onClose={handleCloseLoginModal} onSwitchToRegister={handleSwitchToRegister} onLoginSuccess={handleCloseLoginModal} />
      <RegisterModal show={showRegisterModal} onClose={handleCloseRegisterModal} onSwitchToLogin={handleSwitchToLogin} onRegisterSuccess={handleCloseRegisterModal} />

      {/* Stock Warning Modal */}
      {showStockWarning && (
        <div className="modal fade show" id="stockWarningModal" tabIndex={-1} role="dialog" aria-labelledby="stockWarningModalLabel" aria-hidden="false" style={{ display: 'block', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-warning">
                <h5 className="modal-title" id="stockWarningModalLabel">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Cảnh báo
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowStockWarning(false)}></button>
              </div>
              <div className="modal-body">
                <p className="mb-0">{stockWarningMessage}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStockWarning(false)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showStockWarning && <div className="modal-backdrop fade show" style={{ zIndex: 1055 }}></div>}

      {/* Toast Notification */}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
        <div
          className={`toast ${showCartToast ? 'show' : ''}`}
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
              onClick={() => setShowCartToast(false)}
            ></button>
          </div>
          <div className="toast-body text-white">
            Sản phẩm đã được thêm vào giỏ hàng thành công!
          </div>
        </div>
      </div>
    </div>
  );
};