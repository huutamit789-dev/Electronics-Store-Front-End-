import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { CategoryProducts } from '@/components/products/CategoryProducts';
import { FlashSale } from '@/components/products/FlashSale';
import { CustomerReviews } from '@/components/reviews/CustomerReviews';
import { ChatbotPopup } from '@/components/chatbox/ChatbotPopup';
import { useCountdown } from '@/hooks/useCountdown';
import { jwtDecode } from 'jwt-decode';
import { Product } from '@/types/product';
import { productService } from '@/features/products/services/productService';
import { bannerService, Banner } from '@/features/banners/services/bannerService';
import { footerService, Footer } from '@/features/footers/services/footerService';
import { useAuthStore } from '@/store/useAuthStore';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { useCartStore } from '@/store/useCartStore';
import { useCart } from '@/contexts/CartContext';
import { CartItem } from '@/types/order';
import { formatVND } from '@/lib/formatters';
import { logger } from '@/lib/logger';
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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [footer, setFooter] = useState<Footer | null>(null);
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
  const { addItem, getTotalItems, clearCart, getCountUniqueItems } = useCartStore(); // Destructure clearCart
  const { addToCartContext, user: cartUser, cart } = useCart();
  const [role, setRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [ram, setRam] = useState<string>('all');
  const [storage, setStorage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [featuredCurrentPage, setFeaturedCurrentPage] = useState(1);
  const [featuredItemsPerPage, setFeaturedItemsPerPage] = useState(4);
  const [featuredCarouselDirection, setFeaturedCarouselDirection] = useState<'left' | 'right' | null>(null);
  const [featuredIsAnimating, setFeaturedIsAnimating] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Debounce tìm kiếm để tránh gửi request liên tục lên backend khi người dùng đang gõ
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Responsive itemsPerPage cho featured products
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setFeaturedItemsPerPage(2);
      } else if (window.innerWidth < 992) {
        setFeaturedItemsPerPage(3);
      } else {
        setFeaturedItemsPerPage(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show/hide back to top button on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

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

  // Pagination for featured products
  const featuredTotalPages = Math.ceil(allProducts.length / featuredItemsPerPage);

  const handleFeaturedPageChange = (page: number) => {
    if (page > 0 && page <= featuredTotalPages && !featuredIsAnimating) {
      if (page > featuredCurrentPage) {
        setFeaturedCarouselDirection('right');
      } else if (page < featuredCurrentPage) {
        setFeaturedCarouselDirection('left');
      }
      
      setFeaturedIsAnimating(true);
      setFeaturedCurrentPage(page);
      
      setTimeout(() => {
        setFeaturedIsAnimating(false);
        setFeaturedCarouselDirection(null);
      }, 300);
    }
  };

  const getFeaturedProducts = () => {
    const start = (featuredCurrentPage - 1) * featuredItemsPerPage;
    return allProducts.slice(start, start + featuredItemsPerPage);
  };
  // fetchProducts đã được chuyển vào trong component CategoryProducts để tối ưu hóa truy vấn
  const fetchAllProducts = useCallback(async () => {
    try {
      const allProductsResponse = await productService.getAllProducts(1, 12);
      const allFetchedProducts = allProductsResponse.data.products ?? [];
      const allProductsWithLocalImages = allFetchedProducts.map((product, index) => ({
        ...product,
        image_url: (product.image_url && !product.image_url.includes('placeholder'))
                     ? product.image_url
                     : localImages[index % localImages.length]
      }));
      setAllProducts(allProductsWithLocalImages);
    } catch (err) {
      console.error('Failed to fetch all products:', err);
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
      setCategories(categoriesResponse.data.data.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to fetch categories. Please try again later.');
      setCategories([]); // Set empty array on error
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  useEffect(() => { fetchAllProducts(); }, [fetchAllProducts]);

  // Set loading to false when categories are loaded (even if empty)
  useEffect(() => {
    setLoading(false);
  }, [categories]);

  // Không cần fetchProducts ở đây nữa vì CategoryProducts tự lắng nghe các thay đổi để tự tải lại sản phẩm

  const fetchBanners = useCallback(async () => {
    try {
      const bannersResponse = await bannerService.getAllBanners();
      if (bannersResponse.success) {
        setBanners(bannersResponse.data);
      }
    } catch (err) {
      console.error('Failed to fetch banners:', err);
    }
  }, []);

  const fetchFooter = useCallback(async () => {
    logger.logApiCall('GET', '/footers/active');
    try {
      const footerResponse = await footerService.getActiveFooter();
      if (footerResponse.success) {
        logger.success('FOOTER FETCHED', {
          action: 'fetch_footer',
          details: { hasData: !!footerResponse.data }
        });
        setFooter(footerResponse.data);
      }
    } catch (err) {
      logger.logApiError('GET', '/footers/active', err);
      console.error('Failed to fetch footer:', err);
    }
  }, []);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);
  useEffect(() => { fetchFooter(); }, [fetchFooter]);

  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    // Scroll to products section
    setTimeout(() => {
      const productsSection = document.getElementById('products-section');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Modal Handlers
  const handleShowLoginModal = () => { setShowLoginModal(true); setShowRegisterModal(false); };
  const handleCloseLoginModal = () => setShowLoginModal(false);
  const handleShowRegisterModal = () => { setShowRegisterModal(true); setShowLoginModal(false); };
  const handleCloseRegisterModal = () => setShowRegisterModal(false);
  const handleSwitchToRegister = () => { setShowLoginModal(false); setShowRegisterModal(true); };
  const handleSwitchToLogin = () => { setShowRegisterModal(false); setShowLoginModal(true); };

  const handleLogout = () => { 
    logout(); 
    setRole(null); 
    clearCart(); // Clear cart on logout
  };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);

  const handleLogoClick = () => {
    setSearchQuery(''); // Xóa từ khóa khi click logo
    setDebouncedSearchQuery('');
    setSelectedCategoryId(null); // Reset danh mục
    setPriceRange('all');
    setRam('all');
    setStorage('all');
    setSortBy('newest');
  };

  /**
   * @function handleResetFilters
   * @description Resets all filters, search query, and sorting back to their default values.
   */
  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setPriceRange('all');
    setRam('all');
    setStorage('all');
    setSortBy('newest');
  };

  const handleAddToCart = (product: Product) => {
    if (!isLoggedIn) {
      handleShowLoginModal();
      return;
    }

    if (isLoggedIn && cartUser?._id) {
      addToCartContext(cartUser._id, product._id, 1, product.price).then(ok => { if (ok) setShowCartToast(true); });
    } else {
      const cartItem: CartItem = {
        productId: product._id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        image_url: product.image_url,
        stock_quantity: product.stock_quantity
      };
      addItem(cartItem);
      setShowCartToast(true);
    }

    // Auto close toast after 2 seconds
    setTimeout(() => {
      setShowCartToast(false);
    }, 2000);
  };

  const handleLoginSuccess = () => {
    handleCloseLoginModal();
    checkLoginStatus();
    clearCart(); // Clear cart on successful login
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

  if (loading) {
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
      <header className="bg-brand-red text-white sticky-top shadow-sm py-2" style={{ zIndex: 1000 }}>
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
                {(isLoggedIn && cart?.items 
                  ? cart.items.reduce((sum, item) => sum + item.quantity, 0)
                  : getCountUniqueItems()) > 0 && (
                  <span className="position-absolute badge rounded-pill bg-warning text-dark" style={{fontSize: '0.6rem', right: '-10px', top: '-8px', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0'}}>
                    {isLoggedIn && cart?.items 
                      ? cart.items.reduce((sum, item) => sum + item.quantity, 0)
                      : getCountUniqueItems()}
                  </span>
                )}
              </i>
              <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Giỏ hàng</div>
            </Link>
            
            {isLoggedIn ? (
              <div className="d-flex align-items-center gap-3">
                <Link to="/account" className="cursor-pointer hover-lift text-white text-decoration-none">
                  <i className="bi bi-wallet2 fs-5"></i>
                  <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Tài khoản</div>
                </Link>
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
      className="btn btn-white position-absolute top-50 translate-middle-y z-2 rounded-circle shadow-sm border"
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
              {banners.find(b => b.position === 'main')?.image_url ? (
                <img 
                  src={banners.find(b => b.position === 'main')?.image_url} 
                  className="card-img h-100 object-fit-cover" 
                  alt="Main Banner" 
                  style={{ minHeight: '250px', height: '280px', width: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <div className="card-img h-100 d-flex align-items-center justify-content-center bg-light" style={{ minHeight: '250px', height: '280px' }}>
                  <i className="bi bi-image fs-1 text-muted"></i>
                </div>
              )}
              <div className="card-img-overlay d-flex flex-column justify-content-end p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                <h2 className="card-title fw-bold">{banners.find(b => b.position === 'main')?.title || 'Banner chính'}</h2>
                <p className="card-text text-light">{banners.find(b => b.position === 'main')?.description || ''}</p>
              </div>
            </div>
          </div>
          <div className="col-md-6 d-flex flex-column gap-3">
            <div className="card border-0 rounded-4 premium-shadow img-zoom-container flex-grow-1 cursor-pointer overflow-hidden">
              {banners.find(b => b.position === 'sub1')?.image_url ? (
                <img 
                  src={banners.find(b => b.position === 'sub1')?.image_url} 
                  className="card-img h-100 object-fit-cover" 
                  alt="Sub Banner 1" 
                  style={{ height: '130px', width: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <div className="card-img h-100 d-flex align-items-center justify-content-center bg-light" style={{ height: '130px' }}>
                  <i className="bi bi-image fs-1 text-muted"></i>
                </div>
              )}
            </div>
            <div className="card border-0 rounded-4 premium-shadow img-zoom-container flex-grow-1 cursor-pointer overflow-hidden">
              {banners.find(b => b.position === 'sub2')?.image_url ? (
                <img 
                  src={banners.find(b => b.position === 'sub2')?.image_url} 
                  className="card-img h-100 object-fit-cover" 
                  alt="Sub Banner 2" 
                  style={{ height: '130px', width: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div className="card-img h-100 d-flex align-items-center justify-content-center bg-light" style={{ height: '130px' }}>
                  <i className="bi bi-image fs-1 text-muted"></i>
                </div>
              )}
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

        {/* Cấu trúc lưới sản phẩm kết hợp Sidebar bộ lọc */}
        <div className="row g-4 mb-5" id="products-section">
          {/* Cột bên trái: Bộ lọc Sidebar */}
          <div className="col-lg-3">
            <div className="card border-0 rounded-4 shadow-sm p-4 bg-white sticky-top" style={{ top: '80px', zIndex: 1 }}>
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <h5 className="fw-bold fs-6 m-0 text-gray-800 d-flex align-items-center gap-2" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                  <i className="bi bi-funnel text-danger"></i> Bộ lọc tìm kiếm
                </h5>
                <button 
                  className="btn btn-link btn-sm text-danger text-decoration-none p-0 fw-semibold animate-hover" 
                  style={{ fontSize: '0.8rem' }}
                  onClick={handleResetFilters}
                >
                  Xóa bộ lọc
                </button>
              </div>

              {/* Sắp xếp */}
              <div className="mb-4">
                <label className="form-label fw-bold text-secondary small mb-2">Sắp xếp theo</label>
                <select 
                  className="form-select form-select-sm rounded-3 border-light-subtle bg-light text-dark fw-medium"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá: Thấp đến Cao</option>
                  <option value="price_desc">Giá: Cao đến Thấp</option>
                </select>
              </div>

              {/* Khoảng giá */}
              <div className="mb-4">
                <label className="form-label fw-bold text-secondary small mb-2">Khoảng giá</label>
                <div className="d-flex flex-column gap-2">
                  {[
                    { label: 'Tất cả', value: 'all' },
                    { label: 'Dưới 5 triệu', value: 'under5' },
                    { label: '5 triệu - 15 triệu', value: '5to15' },
                    { label: '15 triệu - 25 triệu', value: '15to25' },
                    { label: 'Trên 25 triệu', value: 'over25' }
                  ].map(opt => (
                    <div key={opt.value} className="form-check">
                      <input
                        className="form-check-input check-danger"
                        type="radio"
                        name="priceFilter"
                        id={`price-${opt.value}`}
                        checked={priceRange === opt.value}
                        onChange={() => setPriceRange(opt.value)}
                      />
                      <label className="form-check-label text-dark small cursor-pointer" htmlFor={`price-${opt.value}`}>
                        {opt.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bộ nhớ RAM */}
              <div className="mb-4">
                <label className="form-label fw-bold text-secondary small mb-2">Dung lượng RAM</label>
                <div className="d-flex flex-wrap gap-1">
                  {['all', '4GB', '8GB', '12GB', '16GB'].map(r => (
                    <button
                      key={r}
                      type="button"
                      className={`btn btn-sm rounded-pill px-3 py-1 fw-medium transition-all ${
                        ram === r 
                          ? 'btn-danger text-white border-0 shadow-sm' 
                          : 'btn-outline-secondary border-light-subtle bg-light text-dark'
                      }`}
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => setRam(r)}
                    >
                      {r === 'all' ? 'Tất cả' : r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bộ nhớ trong */}
              <div className="mb-2">
                <label className="form-label fw-bold text-secondary small mb-2">Bộ nhớ trong</label>
                <div className="d-flex flex-wrap gap-1">
                  {['all', '64GB', '128GB', '256GB', '512GB', '1TB'].map(s => (
                    <button
                      key={s}
                      type="button"
                      className={`btn btn-sm rounded-pill px-3 py-1 fw-medium transition-all ${
                        storage === s 
                          ? 'btn-danger text-white border-0 shadow-sm' 
                          : 'btn-outline-secondary border-light-subtle bg-light text-dark'
                      }`}
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => setStorage(s)}
                    >
                      {s === 'all' ? 'Tất cả' : s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cột bên phải: Lưới sản phẩm */}
          <div className="col-lg-9">
            <CategoryProducts 
              categoryId={selectedCategoryId} 
              categories={categories}
              keyword={debouncedSearchQuery}
              priceRange={priceRange}
              ram={ram}
              storage={storage}
              sortBy={sortBy}
            />
          </div>
        </div>
        <FlashSale products={allProducts} countdown={countdown} />

        {/* Sản phẩm nổi bật / Sản phẩm Hot (Áp dụng UI Flash Sale) */}
        <section className="mb-5 mt-5">
          <div className="featured-products-container p-4 p-md-5 shadow-lg position-relative" style={{ 
            background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
            borderRadius: '16px'
          }}>
            
            {/* Tiêu đề & Đồng hồ đếm ngược */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-white text-warning rounded-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '48px', height: '48px' }}>
                  <i className="bi bi-fire fs-3"></i>
                </div>
                <div className="text-white">
                  <h2 className="fs-3 fw-bold fst-italic mb-0" style={{ letterSpacing: '0.5px' }}>SẢN PHẨM NỔI BẬT</h2>
                  <div className="opacity-75 small">Sản phẩm bán chạy nhất tuần qua</div>
                </div>
              </div>

              <div className="d-flex gap-2 text-white font-monospace">
                <div className="timer-box">
                  <span className="fs-5 fw-bold lh-1 mb-1">{countdown?.hours || '02'}</span>
                  <span style={{ fontSize: '0.55rem', fontWeight: 'bold' }}>GIỜ</span>
                </div>
                <div className="timer-box">
                  <span className="fs-5 fw-bold lh-1 mb-1">{countdown?.minutes || '45'}</span>
                  <span style={{ fontSize: '0.55rem', fontWeight: 'bold' }}>PHÚT</span>
                </div>
                <div className="timer-box">
                  <span className="fs-5 fw-bold lh-1 mb-1">{countdown?.seconds || '12'}</span>
                  <span style={{ fontSize: '0.55rem', fontWeight: 'bold' }}>GIÂY</span>
                </div>
              </div>
            </div>

            <div className="position-relative">
              {/* Carousel Navigation Buttons */}
              {featuredTotalPages > 1 && (
                <>
                  <button
                    className="btn btn-white position-absolute top-50 translate-middle-y z-2 rounded-circle shadow-sm border d-flex align-items-center justify-content-center hover-lift carousel-nav-btn"
                    style={{ left: '-20px', width: '40px', height: '40px', padding: 0 }}
                    onClick={() => handleFeaturedPageChange(featuredCurrentPage - 1)}
                    disabled={featuredCurrentPage === 1 || featuredIsAnimating}
                  >
                    <i className="bi bi-chevron-left text-secondary"></i>
                  </button>
                  <button
                    className="btn btn-white position-absolute top-50 translate-middle-y z-2 rounded-circle shadow-sm border d-flex align-items-center justify-content-center hover-lift carousel-nav-btn"
                    style={{ right: '-20px', width: '40px', height: '40px', padding: 0 }}
                    onClick={() => handleFeaturedPageChange(featuredCurrentPage + 1)}
                    disabled={featuredCurrentPage === featuredTotalPages || featuredIsAnimating}
                  >
                    <i className="bi bi-chevron-right text-secondary"></i>
                  </button>
                </>
              )}

              <div className="carousel-container overflow-hidden">
                <div className={`row row-cols-2 row-cols-md-4 g-3 carousel-slide ${featuredCarouselDirection ? `slide-${featuredCarouselDirection}` : ''}`}>
                  {getFeaturedProducts().map(product => (
                    <div className="col" key={product._id}>
                      <div className="card card-product p-3 h-100 d-flex flex-column bg-white">
                        <Link to={`/product/${product._id}`} className="text-decoration-none text-dark flex-grow-1 d-flex flex-column">
                          
                          <div className="position-relative mb-3">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                className="w-100 rounded-3"
                                style={{ height: '150px', width: '100%', objectFit: 'contain' }}
                                alt={product.name}
                              />
                            ) : (
                              <div className="w-100 rounded-3 d-flex align-items-center justify-content-center bg-light" style={{ height: '150px' }}>
                                <i className="bi bi-image fs-1 text-muted"></i>
                              </div>
                            )}
                            <span className="badge bg-warning position-absolute top-0 start-0 m-2 px-2 py-1 shadow-sm">
                              HOT
                            </span>
                          </div>

                          <h6 className="fw-bold text-truncate mb-2">{product.name}</h6>
                          <div className="text-warning fw-bold fs-5 lh-1 mb-1">{formatVND(product.price)}</div>
                          
                          <div className="mt-auto">
                            <div className="progress mb-2" style={{ height: '4px', backgroundColor: '#e9ecef' }}>
                              <div className="progress-bar bg-warning" role="progressbar" style={{ width: '70%' }}></div>
                            </div>
                            <div className="text-center text-muted fw-bold mb-3" style={{ fontSize: '0.65rem' }}>
                              ĐANG HOT
                            </div>
                          </div>
                        </Link>

                        <button
                          className="btn btn-dark w-100 py-2 mt-auto"
                          onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                        >
                          Thêm vào giỏ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination inside carousel */}
                {featuredTotalPages > 1 && (
                  <div className="d-flex justify-content-center align-items-center mt-4 gap-2">
                    <button
                      className="btn btn-sm btn-outline-light rounded-3"
                      onClick={() => handleFeaturedPageChange(featuredCurrentPage - 1)}
                      disabled={featuredCurrentPage === 1 || featuredIsAnimating}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                    {(() => {
                      const maxVisiblePages = 5;
                      let startPage = Math.max(1, featuredCurrentPage - Math.floor(maxVisiblePages / 2));
                      let endPage = Math.min(featuredTotalPages, startPage + maxVisiblePages - 1);
                      
                      if (endPage - startPage + 1 < maxVisiblePages) {
                        startPage = Math.max(1, endPage - maxVisiblePages + 1);
                      }
                      
                      const pages = [];
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(i);
                      }
                      
                      return pages.map((page) => (
                        <button
                          key={page}
                          className={`btn btn-sm rounded-3 ${featuredCurrentPage === page ? 'btn-light text-warning' : 'btn-outline-light'}`}
                          onClick={() => handleFeaturedPageChange(page)}
                          disabled={featuredIsAnimating}
                        >
                          {page}
                        </button>
                      ));
                    })()}
                    <button
                      className="btn btn-sm btn-outline-light rounded-3"
                      onClick={() => handleFeaturedPageChange(featuredCurrentPage + 1)}
                      disabled={featuredCurrentPage === featuredTotalPages || featuredIsAnimating}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Đánh giá khách hàng */}
        <CustomerReviews />
      </main>

      {/* Footer Mới */}
      <footer className="bg-dark text-white py-5 mt-auto">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <h4 className="fw-bold mb-3 fs-4">{footer?.company_name || 'ElectroStore'}</h4>
              <p className="text-light mb-4 fs-6">{footer?.company_description}</p>
            </div>
            <div className="col-md-4">
              <h4 className="fw-bold mb-3 fs-5">{footer?.policy_title || 'Chính sách'}</h4>
              <ul className="list-unstyled">
                {footer?.policies && footer.policies.length > 0 ? (
                  footer.policies.map((policy, index) => (
                    <li key={index} className="mb-3">
                      <Link to={policy.link} className="text-decoration-none text-light hover-white transition-colors">{policy.title}</Link>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="mb-3"><Link to="#" className="text-decoration-none text-light hover-white transition-colors">Bảo hành</Link></li>
                    <li className="mb-3"><Link to="#" className="text-decoration-none text-light hover-white transition-colors">Đổi trả</Link></li>
                  </>
                )}
              </ul>
            </div>
            <div className="col-md-4">
              <h4 className="fw-bold mb-3 fs-5">
                {footer?.contact_title || 'Liên hệ'}
              </h4>
              <ul className="list-unstyled">
                {footer?.contacts && footer.contacts.length > 0 ? (
                  footer.contacts.map((contact, index) => (
                    <li key={index} className="mb-3 fs-6">
                      <i className={`bi ${contact.icon} me-2 text-warning`}></i> {contact.text}
                    </li>
                  ))
                ) : (
                  <>
                    <li className="mb-3 fs-6"><i className="bi bi-telephone me-2 text-warning"></i> Hotline: 1900 xxxx</li>
                    <li className="mb-3 fs-6"><i className="bi bi-envelope me-2 text-warning"></i> CSKH: cskh@electrostore.com</li>
                  </>
                )}
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

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          className="btn btn-danger position-fixed rounded-circle shadow-lg"
          onClick={scrollToTop}
          style={{
            bottom: '30px',
            left: '30px',
            width: '50px',
            height: '50px',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.3s ease-in-out'
          }}
        >
          <i className="bi bi-arrow-up fs-4"></i>
        </button>
      )}

      {/* Chatbot Popup */}
      <ChatbotPopup />
    </div>
  );
};