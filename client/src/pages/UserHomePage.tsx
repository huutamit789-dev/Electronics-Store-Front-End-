import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { CategoryProducts } from '@/components/products/CategoryProducts';
import { FlashSale } from '@/components/products/FlashSale';
import { useCountdown } from '@/hooks/useCountdown';
import { jwtDecode } from 'jwt-decode';
import { Product } from '@/types/product';
import { productService } from '@/features/products/services/productService';
import { useAuthStore } from '@/store/useAuthStore';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { useCartStore } from '@/store/useCartStore';
import { CartItem } from '@/types/order';
import '@/assets/UserHomePage.css';
// Import local images
import iphone1 from '@/assets/images/iphone-17-pro-max-3.webp';
import iphone2 from '@/assets/images/iphone-17-pro-max_3.webp';
import iphone3 from '@/assets/images/iphone-17-pro-max-1_4.webp';
import iphone4 from '@/assets/images/iphone-17-pro-max_1_3.webp';
const localImages = [iphone1, iphone2, iphone3, iphone4];
const API_BASE_URL = import.meta.env.VITE_API_URL;

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

export const UserHomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const navigate = useNavigate();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showCartToast, setShowCartToast] = useState(false);

  const countdown = useCountdown(1);
  const { isLoggedIn, user } = useAuthStore();
  const { logout } = useLogout();
  const { addItem, getTotalItems } = useCartStore();
  const [role, setRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

const categoryScrollRef = useRef<HTMLDivElement>(null);

  // 3. Hàm xử lý cuộn trái/phải
  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 300; // Độ dài mỗi lần cuộn (pixel)
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth' // Cuộn mượt
      });
    }
  };
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

      const productsWithLocalImages = fetchedProducts.map((product, index) => ({
        ...product,
        image_url: (product.image_url && !product.image_url.includes('placeholder'))
                     ? product.image_url
                     : localImages[index % localImages.length]
      }));

      setProducts(productsWithLocalImages);
    } catch (err) {
      setError('Failed to fetch products. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

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
      setError('Failed to fetch categories. Please try again later.');
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  useEffect(() => { fetchProducts(selectedCategoryId); }, [fetchProducts, selectedCategoryId]);

  const handleCategoryClick = (categoryId: string | null) => setSelectedCategoryId(categoryId);

  // Modal Handlers
  const handleShowLoginModal = () => { setShowLoginModal(true); setShowRegisterModal(false); };
  const handleCloseLoginModal = () => setShowLoginModal(false);
  const handleShowRegisterModal = () => { setShowRegisterModal(true); setShowLoginModal(false); };
  const handleCloseRegisterModal = () => setShowRegisterModal(false);
  const handleSwitchToRegister = () => { setShowLoginModal(false); setShowRegisterModal(true); };
  const handleSwitchToLogin = () => { setShowRegisterModal(false); setShowLoginModal(true); };

  const handleLogout = () => { logout(); setRole(null); };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      (product.cate_id && typeof product.cate_id === 'object' && product.cate_id.name?.toLowerCase().includes(query))
    );
  }, [products, searchQuery]);

  const handleAddToCart = (product: Product) => {
    if (!isLoggedIn) {
      handleShowLoginModal();
      return;
    }

    const cartItem: CartItem = {
      productId: product._id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url,
    };
    addItem(cartItem);
    setShowCartToast(true);

    // Auto close toast after 2 seconds
    setTimeout(() => {
      setShowCartToast(false);
    }, 2000);
  };

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

  if (loading && products.length === 0) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-light text-dark justify-content-center align-items-center">
        <div className="spinner-border text-danger" role="status"><span className="visually-hidden">Loading...</span></div>
        <p className="mt-3 fs-5">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-light text-dark justify-content-center align-items-center">
        <div className="alert alert-danger" role="alert"><h4 className="alert-heading">Lỗi!</h4><p>{error}</p></div>
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

      {/* Navigation Bar (Danh mục) */}
   {/* Navigation Bar (Danh mục kiểu Carousel) */}
<nav className="bg-white border-bottom shadow-sm mb-4 position-relative">
  <div className="container position-relative">
    
    {/* Nút cuộn sang trái */}
    <button 
      className="btn btn-white position-absolute top-50 translate-middle-y z-2 rounded-circle shadow-sm border d-none d-md-flex align-items-center justify-content-center hover-lift"
      style={{ left: '-15px', width: '36px', height: '36px', padding: 0 }}
      onClick={() => scrollCategories('left')}
    >
      <i className="bi bi-chevron-left text-secondary"></i>
    </button>

    {/* Khung chứa danh mục (Ẩn thanh cuộn) */}
    <div 
      ref={categoryScrollRef}
      className="d-flex gap-4 overflow-auto scrollbar-hide text-nowrap py-2 px-3"
      style={{ scrollBehavior: 'smooth' }}
    >
      <div 
        className={`cursor-pointer text-secondary text-decoration-none fw-semibold d-flex align-items-center gap-2 hover-text-red ${selectedCategoryId === null ? 'text-brand-red' : ''}`} 
        onClick={() => handleCategoryClick(null)}
      >
        <i className="bi bi-grid"></i> Tất cả
      </div>
      
      {categories.map(category => (
        <div 
          key={category._id} 
          className={`cursor-pointer text-secondary text-decoration-none fw-semibold d-flex align-items-center gap-2 hover-text-red transition ${selectedCategoryId === category._id ? 'text-brand-red' : ''}`} 
          onClick={() => handleCategoryClick(category._id)}
        >
          <i className={`bi ${
            category.name.includes('Điện thoại') ? 'bi-phone' :
            category.name.includes('Laptop') ? 'bi-laptop' :
            category.name.includes('Âm thanh') ? 'bi-headphones' :
            category.name.includes('Đồng hồ') ? 'bi-smartwatch' :
            category.name.includes('Máy tính bảng') ? 'bi-tablet' :
            category.name.includes('Camera') ? 'bi-camera' :
            category.name.includes('Gaming') ? 'bi-controller' :
            'bi-tag'
          }`}></i> {category.name}
        </div>
      ))}
    </div>

    {/* Nút cuộn sang phải */}
    <button 
      className="btn btn-white position-absolute top-50 translate-middle-y z-2 rounded-circle shadow-sm border d-none d-md-flex align-items-center justify-content-center hover-lift"
      style={{ right: '-15px', width: '36px', height: '36px', padding: 0 }}
      onClick={() => scrollCategories('right')}
    >
      <i className="bi bi-chevron-right text-secondary"></i>
    </button>

  </div>
</nav>

      <main className="container pb-5 flex-grow-1">

        {/* Banners & Hero Section */}
        <section className="row g-3 mb-5">
          <div className="col-md-6">
            <div className="card border-0 rounded-4 premium-shadow img-zoom-container h-100 text-white cursor-pointer overflow-hidden">
              <img src="https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=1200&q=80" className="card-img h-100 object-fit-cover" alt="Main Banner" style={{ minHeight: '350px',height: '360px' }} />
              <div className="card-img-overlay d-flex flex-column justify-content-end p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                <h2 className="card-title fw-bold">Siêu phẩm công nghệ</h2>
                <p className="card-text text-light">Mua sắm ngay với ngàn ưu đãi hấp dẫn.</p>
              </div>
            </div>
          </div>
          <div className="col-md-6 d-flex flex-column gap-3">
            <div className="card border-0 rounded-4 premium-shadow img-zoom-container flex-grow-1 cursor-pointer overflow-hidden">
              <img src="https://images.unsplash.com/photo-1593642532400-2682810df593?w=600&q=80" className="card-img h-100 object-fit-cover" alt="Sub Banner 1" style={{ height: '174px' }} />
            </div>
            <div className="card border-0 rounded-4 premium-shadow img-zoom-container flex-grow-1 cursor-pointer overflow-hidden">
              <img src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&q=80" className="card-img h-100 object-fit-cover" alt="Sub Banner 2" style={{ height: '174px' }}/>
            </div>
          </div>
        </section>

        {/* Trust Features */}
        <section className="row row-cols-2 row-cols-md-4 g-3 mb-5">
          {[
            { icon: 'bi-truck', text: 'Giao hàng nhanh' },
            { icon: 'bi-shield-check', text: 'Bảo hành 1 đổi 1' },
            { icon: 'bi-check-circle', text: 'Chính hãng 100%' },
            { icon: 'bi-credit-card', text: 'Trả góp 0%' }
          ].map((item, idx) => (
            <div className="col" key={idx}>
              <div className="bg-white p-3 rounded-4 d-flex align-items-center gap-3 border shadow-sm h-100">
                <i className={`bi ${item.icon} text-brand-red fs-4`}></i>
                <div className="fs-6 fw-semibold">{item.text}</div>
              </div>
            </div>
          ))}
        </section>

        {/* Kết quả tìm kiếm (Áp dụng UI mới) */}
        {searchQuery.trim() && (
          <div className="mb-5">
            <h4 className="fw-bold mb-4">Kết quả tìm kiếm: "{searchQuery}"</h4>
            {filteredProducts.length > 0 ? (
              <div className="row row-cols-2 row-cols-md-4 g-4">
                {filteredProducts.map(product => (
                  <div className="col" key={product._id}>
                    <div className="card h-100 border border-light shadow-sm hover-lift p-3 rounded-4 img-zoom-container d-flex flex-column">
                      <Link to={`/product/${product._id}`} className="text-decoration-none text-dark flex-grow-1">
                        <img src={product.image_url} className="card-img-top rounded-3 object-fit-contain mb-3" height="180" alt={product.name} />
                        <h6 className="fw-semibold text-truncate">{product.name}</h6>
                        <div className="text-brand-red fw-bold fs-5 mb-3">{product.price.toLocaleString()}đ</div>
                      </Link>
                      <button className="btn btn-light w-100 rounded-3 fw-bold mt-auto text-dark hover-brand-red border" onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}>
                        Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 bg-white rounded-4 shadow-sm border">
                <i className="bi bi-search fs-1 text-muted mb-3"></i>
                <p className="text-muted">Không tìm thấy sản phẩm nào phù hợp với "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}

        {/* Các Component Tùy Chọn Của Bạn (Flashsale / Category Products) */}
        <CategoryProducts categoryId={selectedCategoryId} categories={categories} products={products} />
        <FlashSale products={products} countdown={countdown} />

        {/* Sản phẩm nổi bật / Sản phẩm Hot (Áp dụng UI mới) */}
        <section className="mb-5 mt-5">
          <h2 className="fs-4 fw-bold mb-4 d-flex align-items-center gap-2">
            <i className="bi bi-fire text-brand-red"></i> Sản phẩm nổi bật
          </h2>
          <div className="row row-cols-2 row-cols-md-4 g-4">
            {products.slice(0, 8).map(product => (
              <div className="col" key={product._id}>
                <div className="card h-100 border border-light shadow-sm hover-lift p-3 rounded-4 img-zoom-container d-flex flex-column bg-white">
                  <Link to={`/product/${product._id}`} className="text-decoration-none text-dark flex-grow-1">
                    <img src={product.image_url} className="card-img-top rounded-3 object-fit-contain mb-3" height="180" alt={product.name} />
                    <h6 className="fw-semibold text-truncate">{product.name}</h6>
                    <div className="text-brand-red fw-bold fs-5 mb-3">{product.price.toLocaleString()}đ</div>
                  </Link>
                  <button className="btn btn-light border w-100 rounded-3 fw-bold mt-auto text-dark hover-brand-red transition" onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}>
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Đánh giá khách hàng */}
        <section className="mb-5">
          <h2 className="fs-3 fw-bold mb-4">Đánh giá khách hàng</h2>
          <div className="row g-4">
            {[
              { name: 'Nguyễn Văn A', stars: '⭐⭐⭐⭐⭐', text: '"ElectroStore giao hàng cực nhanh, hàng chính hãng, đóng gói kỹ càng. Rất hài lòng!"' },
              { name: 'Trần Thị B', stars: '⭐⭐⭐⭐☆', text: '"Giá cả hợp lý, nhân viên tư vấn nhiệt tình. Sẽ ủng hộ shop thêm nhiều lần nữa."' },
              { name: 'Lê Văn C', stars: '⭐⭐⭐⭐⭐', text: '"Hàng giống mô tả 100%, chất liệu tốt. Cảm ơn shop rất nhiều vì món quà nhỏ đi kèm."' }
            ].map((review, idx) => (
              <div className="col-md-4" key={idx}>
                <div className="card rounded-4 p-4 border-light shadow-sm h-100">
                  <div className="text-warning mb-2">{review.stars}</div>
                  <p className="text-muted fw-medium mb-3">{review.text}</p>
                  <p className="small fw-bold text-secondary mb-0 mt-auto">— {review.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

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

      {/* Modals giữ nguyên */}
      <LoginModal show={showLoginModal} onClose={handleCloseLoginModal} onSwitchToRegister={handleSwitchToRegister} onLoginSuccess={handleLoginSuccess} />
      <RegisterModal show={showRegisterModal} onClose={handleCloseRegisterModal} onSwitchToLogin={handleSwitchToLogin} onRegisterSuccess={handleRegisterSuccess} />

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
            Đã thêm sản phẩm vào giỏ hàng!
          </div>
        </div>
      </div>
    </div>
  );
};