import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '@/types/product';
import axiosClient from "@/api/axiosClient";
import { useCart } from '@/contexts/CartContext';
import { useAuthStore } from '@/store/useAuthStore';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';

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
`;

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);

  const { user, addToCartContext, errorCart } = useCart();
  const { isLoggedIn } = useAuthStore();
  const { logout } = useLogout();

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
        const productResponse = await axiosClient.get<ProductDetailApiResponse>(`http://localhost:8090/api/products/${id}`);
        setProduct(productResponse.data.data);
        // Fetch categories
        const categoriesResponse = await axiosClient.get<CategoryApiResponse>('http://localhost:8090/api/categories');
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

  const handleAddToCart = async () => {
    if (!product) {
      alert('Không thể thêm sản phẩm vào giỏ hàng vì thông tin sản phẩm không đầy đủ.');
      return;
    }

    if (!user?._id) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
      return;
    }

    if (quantity < 1) {
      alert('Số lượng phải lớn hơn 0.');
      return;
    }

    const success = await addToCartContext(user._id, product._id, quantity, product.price);

    if (success) {
      alert('Sản phẩm đã được thêm vào giỏ hàng thành công!');
      setQuantity(1); // Reset quantity after adding
    } else {
      alert(`Lỗi khi thêm sản phẩm vào giỏ hàng: ${errorCart || 'Đã xảy ra lỗi không xác định.'}`);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      // Check if quantity exceeds stock
      if (product && product.stock_quantity && newQuantity > product.stock_quantity) {
        alert(`Sản phẩm chỉ còn ${product.stock_quantity} cái, không thể chọn ${newQuantity} cái`);
        return;
      }
      setQuantity(newQuantity);
    }
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
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg sticky-top mb-4">
        <div className="container d-flex flex-wrap justify-content-between align-items-center">
          <div className="d-flex justify-content-between align-items-center w-100">
            <Link className="navbar-brand fw-bold fs-3 text-danger" to="/">Electro<span className="text-dark">Store</span></Link>
            <div className="d-flex gap-3">
              <Link to="/cart" className="text-dark"><i className="bi bi-cart3 fs-4"></i></Link>
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
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
      </nav>

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
            <div className="card p-3 card-border mt-3">
              <h6 className="fw-bold mb-3">Số lượng</h6>
              <div className="d-flex align-items-center gap-3">
                <div className="input-group" style={{ maxWidth: '150px' }}>
                  <button className="btn btn-outline-secondary" type="button" onClick={() => handleQuantityChange(quantity - 1)}>
                    <i className="fas fa-minus"></i>
                  </button>
                  <input
                    type="number"
                    className="form-control text-center"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    min="1"
                  />
                  <button className="btn btn-outline-secondary" type="button" onClick={() => handleQuantityChange(quantity + 1)}>
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
                disabled={!product || product.stock_quantity <= 0 || quantity > product.stock_quantity}
              >
                <i className="fas fa-shopping-cart me-2"></i>
                {product && product.stock_quantity <= 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
              </button>
              <button className="btn btn-outline-danger btn-lg">
                <i className="fas fa-phone me-2"></i> Gọi tư vấn
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Action Bar for Mobile */}
      <div className="sticky-action-bar d-md-none">
        <div className="container d-flex gap-2">
          <button className="btn btn-outline-danger flex-grow-1">Gọi tư vấn</button>
          <button className="btn btn-cps flex-grow-1">Mua ngay</button>
        </div>
      </div>

      {/* Modals */}
      <LoginModal show={showLoginModal} onClose={handleCloseLoginModal} onSwitchToRegister={handleSwitchToRegister} onLoginSuccess={handleCloseLoginModal} />
      <RegisterModal show={showRegisterModal} onClose={handleCloseRegisterModal} onSwitchToLogin={handleSwitchToLogin} onRegisterSuccess={handleCloseRegisterModal} />
    </div>
  );
};