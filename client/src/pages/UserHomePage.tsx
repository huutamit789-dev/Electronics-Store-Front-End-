import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';

import { Product } from '@/types/product';
import { productService } from '@/features/products/services/productService';

// Định nghĩa kiểu dữ liệu cho Category
interface Category {
  _id: string;
  name: string;
  description: string;
  __v: number;
}

interface CategoryApiResponse {
  success: boolean;
  message: string;
  data: {
    categories: Category[];
  };
}

// Sử dụng một pixel trong suốt Base64 làm placeholder
const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// CSS tùy chỉnh từ HomePage.html
const customStyles = `
    body { font-family: 'Inter', sans-serif; background-color: #f4f7f9; color: #333; }
    .navbar { background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .sidebar-menu { background: white; border-radius: 1rem; padding: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .sidebar-item { padding: 12px; display: flex; align-items: center; cursor: pointer; border-radius: 0.5rem; transition: 0.2s; position: relative; z-index: 10; } /* Thêm position: relative và z-index */
    .sidebar-item:hover { background: #fff5f5; color: #e31a1a; }
    .hero-banner { background: #ddd; border-radius: 1rem; min-height: 350px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .user-panel { background: white; border-radius: 1rem; padding: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }

    /* Product Cards */
    .card-product { border: none; border-radius: 1rem; transition: all 0.3s ease; height: 100%; background: #fff; }
    .card-product:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
    .price { color: #e31a1a; font-weight: 700; }

    /* Flashsale Styles */
    .flashsale-wrapper { background-color: #d32f2f; border-radius: 1rem; padding: 2rem; color: white; }
    .countdown-box { background: black; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: bold; }

    /* Reviews */
    .review-card { background: white; padding: 1.5rem; border-radius: 1rem; border: 1px solid #eee; transition: 0.3s; }
    .review-card:hover { border-color: #e31a1a; }
    .star-rating { color: #ffc107; }

    /* Category Hover Card */
    .category-hover-card {
      position: absolute;
      left: 100%; /* Đặt bên phải của sidebar-item */
      top: 0;
      width: 300px; /* Chiều rộng của popup */
      background: white;
      border-radius: 1rem;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      padding: 1rem;
      margin-left: 10px; /* Khoảng cách từ sidebar */
      z-index: 100; /* Đảm bảo nó nằm trên các phần tử khác */
      display: none; /* Mặc định ẩn */
    }
    .sidebar-item:hover .category-hover-card {
      display: block; /* Hiện khi hover */
    }
`;


export const UserHomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // State để điều khiển modal
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // State cho Flash Sale Countdown
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Inject custom styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = customStyles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Logic Countdown
  useEffect(() => {
    const flashSaleEndTime = new Date();
    flashSaleEndTime.setHours(flashSaleEndTime.getHours() + 1); // Flash sale kết thúc sau 1 giờ

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = flashSaleEndTime.getTime() - now;

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (distance < 0) {
        clearInterval(interval);
        setCountdown({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        setCountdown({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  const fetchProducts = useCallback(async (categoryId: string | null = null) => {
    setLoading(true);
    setError(null);
    try {
      const productsResponse = categoryId
        ? await productService.getProductByCategoryId(categoryId, 1, 10)
        : await productService.getAllProducts(1, 10);

      const fetchedProducts = productsResponse.data.products
        ?? productsResponse.data.categories?.flatMap(category => category.products)
        ?? [];

      setProducts(fetchedProducts);

    } catch (err) {
      setError('Failed to fetch products. Please try again later.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const categoriesResponse = await axios.get<CategoryApiResponse>('http://localhost:8090/api/categories');
      setCategories(categoriesResponse.data.data.categories);
    } catch (err) {
      setError('Failed to fetch categories. Please try again later.');
      console.error('Error fetching categories:', err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts(selectedCategoryId);
  }, [fetchProducts, selectedCategoryId]);

  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
  };

  // Hàm mở/đóng modal
  const handleShowLoginModal = () => { setShowLoginModal(true); setShowRegisterModal(false); };
  const handleCloseLoginModal = () => setShowLoginModal(false);
  const handleShowRegisterModal = () => { setShowRegisterModal(true); setShowLoginModal(false); };
  const handleCloseRegisterModal = () => setShowRegisterModal(false);

  // Chuyển đổi giữa các modal
  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };


  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-light text-dark justify-content-center align-items-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 fs-5">Đang tải dữ liệu...</p>
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
    <div className="d-flex flex-column min-vh-100">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg sticky-top mb-4">
        <div className="container">
          <Link className="navbar-brand fw-bold fs-3 text-danger" to="/">Electro<span className="text-dark">Store</span></Link>
          <div className="d-flex mx-auto w-50">
            <input className="form-control me-2 rounded-pill" type="search" placeholder="Tìm kiếm sản phẩm..." />
          </div>
          <div className="d-flex gap-3">
            <Link to="/cart" className="text-dark"><i className="bi bi-cart3 fs-4"></i></Link>
            <a href="#" className="text-dark" onClick={handleShowLoginModal}><i className="bi bi-person fs-4"></i></a>
          </div>
        </div>
      </nav>

      <div className="container pb-5 flex-grow-1"> {/* Thêm flex-grow-1 */}

        {/* Hero Section: Sidebar + Banner + User Info */}
        <div className="row g-3 mb-5">
          <div className="col-lg-2">
            <div className="sidebar-menu">
              {/* "Tất cả sản phẩm" link */}
              <div
                className={`sidebar-item ${selectedCategoryId === null ? 'active' : ''}`}
                onClick={() => handleCategoryClick(null)}
              >
                <i className="bi bi-grid me-2"></i> Tất cả sản phẩm
              </div>
              {/* Category links */}
              {categories.map(category => (
                <div
                  key={category._id}
                  className={`sidebar-item ${selectedCategoryId === category._id ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(category._id)}
                >
                  {/* Icon động dựa trên category.name hoặc một icon mặc định */}
                  <i className={`bi ${
                    category.name.includes('Điện thoại') ? 'bi-phone' :
                    category.name.includes('Laptop') ? 'bi-laptop' :
                    category.name.includes('Âm thanh') ? 'bi-headphones' :
                    category.name.includes('Đồng hồ') || category.name.includes('Camera') ? 'bi-watch' :
                    category.name.includes('Gia dụng') ? 'bi-house-door' :
                    category.name.includes('Phụ kiện') ? 'bi-plug' :
                    'bi-tag' // Icon mặc định
                  } me-2`}></i> {category.name}
                </div>
              ))}
            </div>
          </div>
          <div className="col-lg-7">
            <div className="hero-banner">
              <img src="https://placehold.co/700x350/ddd/333?text=Banner+Chính" alt="Main Banner" className="img-fluid" />
            </div>
          </div>
          <div className="col-lg-3">
            <div className="user-panel mb-3">
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-person-circle fs-2 text-secondary"></i>
                <div className="ms-2 small">Chào mừng bạn đến với <br /><strong>ElectroStore</strong></div>
              </div>
              <button className="btn btn-outline-danger w-100 btn-sm" onClick={handleShowLoginModal}>Đăng nhập</button>
            </div>
            <div className="user-panel">
              <p className="fw-bold mb-2 small">Ưu đãi cho bạn</p>
              <ul className="list-unstyled small text-muted">
                <li><i className="bi bi-book me-2"></i> Ưu đãi giáo dục</li>
                <li><i className="bi bi-fire me-2"></i> Deal hot mỗi ngày</li>
                <li><i className="bi bi-arrow-repeat me-2"></i> Thu cũ đổi mới</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-5 bg-danger p-3 rounded-3 text-center text-white">
          <h5>🔥 TÙNG TÙNG DEAL KHỦNG - GIẢM ĐẾN 50% - MUA NGAY 🔥</h5>
        </div>

        {/* Flashsale */}
        <div className="flashsale-wrapper mb-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold text-white">🔥 FLASH SALE</h3>
            <div className="d-flex align-items-center gap-2">
              <span className="text-white opacity-75">Kết thúc sau:</span>
              <div className="countdown-box">{countdown.hours.toString().padStart(2, '0')}</div> :
              <div className="countdown-box">{countdown.minutes.toString().padStart(2, '0')}</div> :
              <div className="countdown-box">{countdown.seconds.toString().padStart(2, '0')}</div>
            </div>
          </div>
          <div className="row row-cols-1 row-cols-md-5 g-3">
            {products.slice(0, 5).map(product => ( // Lấy 5 sản phẩm đầu tiên cho flash sale
              <div className="col" key={product._id}>
                <Link to={`/product/${product._id}`} className="text-decoration-none text-dark">
                  <div className="card card-product p-3 text-center">
                    <img src={product.image_url} className="card-img-top" alt={product.name} style={{ height: '150px', objectFit: 'contain' }} />
                    <p className="small mt-2 mb-1 text-truncate">{product.name}</p>
                    <div className="price">{product.price.toLocaleString()}đ</div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Product List Section (TIVI NỔI BẬT) */}
        <h4 className="fw-bold mb-4">SẢN PHẨM NỔI BẬT</h4> {/* Đổi tên tiêu đề */}
        <div className="row g-4 mb-5">
          <div className="col-lg-2">
            <div className="bg-dark text-white rounded-3 p-4 h-100 d-flex flex-column justify-content-center text-center">
              <h5>SẢN PHẨM HOT</h5>
            </div>
          </div>
          <div className="col-lg-10">
            <div className="row row-cols-1 row-cols-md-4 g-4">
              {products.slice(5, 9).map(product => ( // Lấy 4 sản phẩm tiếp theo
                <div className="col" key={product._id}>
                  <Link to={`/product/${product._id}`} className="text-decoration-none text-dark">
                    <div className="card card-product p-3">
                      <img src={product.image_url} className="card-img-top" alt={product.name} style={{ height: '200px', objectFit: 'contain' }} />
                      <div className="card-body px-0">
                        <p className="small text-truncate">{product.name}</p>
                        <p className="price mb-0">{product.price.toLocaleString()}đ</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <h4 className="fw-bold mb-4">ĐÁNH GIÁ CỦA KHÁCH HÀNG</h4>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="review-card">
              <div className="star-rating mb-2">
                <i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i>
              </div>
              <p className="small">"Sản phẩm cực kỳ chất lượng, giao hàng nhanh chóng. Sẽ ủng hộ shop dài lâu!"</p>
              <div className="d-flex align-items-center mt-3">
                <div className="bg-secondary text-white rounded-circle p-2 me-2" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>NV</div>
                <small className="fw-bold">Nguyễn Văn A</small>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="review-card">
              <div className="star-rating mb-2">
                <i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i>
              </div>
              <p className="small">"Giá cả hợp lý, nhân viên hỗ trợ nhiệt tình. Rất hài lòng với chiếc tivi mới mua."</p>
              <div className="d-flex align-items-center mt-3">
                <div className="bg-secondary text-white rounded-circle p-2 me-2" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>TT</div>
                <small className="fw-bold">Trần Thị B</small>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="review-card">
              <div className="star-rating mb-2">
                <i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i>
              </div>
              <p className="small">"Tuyệt vời! Hàng chính hãng, đóng gói cẩn thận. Cảm ơn shop!"</p>
              <div className="d-flex align-items-center mt-3">
                <div className="bg-secondary text-white rounded-circle p-2 me-2" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>LM</div>
                <small className="fw-bold">Lê Minh C</small>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="bg-dark text-white mt-4 py-4">
        <div className="container mx-auto px-4 row row-cols-2 row-cols-md-4 g-3 fs-6">
          <div className="col">
            <h4 className="fw-bold mb-3">Về chúng tôi</h4>
            <ul className="list-unstyled text-secondary">
              <li>Giới thiệu</li>
              <li>Tuyển dụng</li>
              <li>Liên hệ</li>
            </ul>
          </div>
          <div className="col">
            <h4 className="fw-bold mb-3">Chính sách</h4>
            <ul className="list-unstyled text-secondary">
              <li>Bảo hành</li>
              <li>Đổi trả</li>
              <li>Giao hàng</li>
            </ul>
          </div>
          <div className="col">
            <h4 className="fw-bold mb-3">Tổng đài</h4>
            <div className="text-secondary">1800 1060</div>
            <div className="text-secondary mt-2 fs-7">Thời gian: 8:00 - 22:00</div>
          </div>
          <div className="col">
            <h4 className="fw-bold mb-3">Kết nối</h4>
            <div className="d-flex gap-2">
              <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>f</div>
              <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>yt</div>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        show={showLoginModal}
        onClose={handleCloseLoginModal}
        onSwitchToRegister={handleSwitchToRegister}
        onLoginSuccess={handleCloseLoginModal}
      />

      {/* Register Modal */}
      <RegisterModal
        show={showRegisterModal}
        onClose={handleCloseRegisterModal}
        onSwitchToLogin={handleSwitchToLogin}
        onRegisterSuccess={handleCloseRegisterModal}
      />
    </div>
  );
};