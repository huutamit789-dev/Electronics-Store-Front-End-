import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { CategoryProducts } from '@/components/products/CategoryProducts'; // Import the new CategoryProducts component
import { FlashSale } from '@/components/products/FlashSale'; // Import the new FlashSale component
import { useCountdown } from '@/hooks/useCountdown';
import { jwtDecode } from 'jwt-decode';
import { Product } from '@/types/product';
import { productService } from '@/features/products/services/productService';
import { useAuthStore } from '@/store/useAuthStore';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { useCartStore } from '@/store/useCartStore';
import { CartItem } from '@/types/order';

// Import local images
import iphone1 from '@/assets/images/iphone-17-pro-max-3.webp';
import iphone2 from '@/assets/images/iphone-17-pro-max_3.webp';
import iphone3 from '@/assets/images/iphone-17-pro-max-1_4.webp';
import iphone4 from '@/assets/images/iphone-17-pro-max_1_3.webp';

const localImages = [iphone1, iphone2, iphone3, iphone4];

const API_BASE_URL = import.meta.env.VITE_API_URL;

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

export const UserHomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const navigate = useNavigate();

  // State để điều khiển modal
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Sử dụng custom hook cho Countdown (1 giờ)
  const countdown = useCountdown(1);

  // Sử dụng useAuthStore thay vì state riêng
  const { isLoggedIn, user } = useAuthStore();
  const { logout } = useLogout();
  const { addItem, getTotalItems } = useCartStore();
  const [role, setRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Hàm kiểm tra trạng thái đăng nhập từ localStorage
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

      // Gán hình ảnh cục bộ cho sản phẩm
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
// Trong UserHomePage
  const checkLoginStatus = useCallback(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const userRole = (decoded?.role || decoded?.user?.role || '').toLowerCase();
        setRole(userRole);
      } catch (e) {
        // Token lỗi -> Xóa sạch
        logout();
      }
    } else {
      setRole(null);
    }
  }, [logout]);
  // Tự động điều hướng nếu là Admin khi vào trang chủ
  useEffect(() => {
    if (role && role.toLowerCase().trim() === 'admin') {
      navigate('/admin');
    }
  }, [role, navigate]);

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]); // Bây giờ nó sẽ chỉ chạy 1 lần khi component mount
  const fetchCategories = useCallback(async () => {
    try {
      const categoriesResponse = await axios.get<CategoryApiResponse>(`${API_BASE_URL}/categories`);
      setCategories(categoriesResponse.data.data.categories);
    } catch (err) {
      setError('Failed to fetch categories. Please try again later.');
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

// 2. Product Update (runs only when category changes)
  useEffect(() => {
    fetchProducts(selectedCategoryId);
  }, [fetchProducts, selectedCategoryId]);
  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
  };

  // Modal handlers
  const handleShowLoginModal = () => { setShowLoginModal(true); setShowRegisterModal(false); };
  const handleCloseLoginModal = () => setShowLoginModal(false);
  const handleShowRegisterModal = () => { setShowRegisterModal(true); setShowLoginModal(false); };
  const handleCloseRegisterModal = () => setShowRegisterModal(false);
  const handleSwitchToRegister = () => { setShowLoginModal(false); setShowRegisterModal(true); };
  const handleSwitchToLogin = () => { setShowRegisterModal(false); setShowLoginModal(true); };

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    logout();
    setRole(null);
  };

  // Hàm xử lý tìm kiếm sản phẩm
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Lọc sản phẩm theo từ khóa tìm kiếm
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      (product.cate_id && typeof product.cate_id === 'object' && product.cate_id.name?.toLowerCase().includes(query))
    );
  }, [products, searchQuery]);

  // Hàm thêm sản phẩm vào giỏ hàng
  const handleAddToCart = (product: Product) => {
    const cartItem: CartItem = {
      productId: product._id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url,
    };
    addItem(cartItem);
    alert(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  // Hàm gọi sau khi đăng nhập thành công
  const handleLoginSuccess = () => {
    // 1. Đóng modal trước
    handleCloseLoginModal();

    // 2. Cập nhật state ngay lập tức
    checkLoginStatus();

    // 3. Sử dụng setTimeout để đợi state cập nhật xong mới điều hướng
    setTimeout(() => {
      const token = localStorage.getItem('access_token');
      if (token) {
        const decoded: any = jwtDecode(token);
        const userRole = (decoded?.role || decoded?.user?.role || '').toLowerCase();

        if (userRole === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          // Thay vì navigate('/'), hãy dùng window.location.reload()
          // hoặc force refresh để UI cập nhật trạng thái đăng nhập
          window.location.reload();
        }
      }
    }, 100);
  }
  // Hàm gọi sau khi đăng ký thành công
  const handleRegisterSuccess = () => {
    handleCloseRegisterModal(); // Đóng modal
    checkLoginStatus(); // Cập nhật trạng thái đăng nhập
  };


  // Tối ưu hiệu năng: Sử dụng useMemo để tránh việc lọc lại sản phẩm mỗi khi countdown chạy
  const hoveredProducts = useMemo(() => {
    if (hoveredCategoryId === null && categories.length > 0) {
      const firstCategoryId = categories[0]._id;
      return products.filter(p => p.cate_id === firstCategoryId).slice(0, 8);
    }
    return products.filter(p => p.cate_id === hoveredCategoryId).slice(0, 8);
  }, [products, hoveredCategoryId, categories]);

  // Loading state
  if (loading && products.length === 0) { // Chỉ hiển thị loading nếu chưa có sản phẩm nào được tải
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

      <div className="container pb-5 flex-grow-1">

        {/* Hero Section */}
        <div className="row g-3 mb-5" style={{ minHeight: '350px' }}>
          <div className="col-lg-8 col-md-12 d-flex flex-column">
            <div className="hero-banner h-100 flex-grow-1">
              {hoveredCategoryId !== null ? (
                <div className="container-fluid h-100 d-flex flex-column justify-content-center align-items-center p-3">
                  <h5 className="fw-bold mb-3">Sản phẩm thuộc danh mục: {categories.find(cat => cat._id === hoveredCategoryId)?.name || 'Tất cả sản phẩm'}</h5>
                  {hoveredProducts.length > 0 ? (
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
                      {hoveredProducts.map(product => (
                        <div className="col" key={product._id}>
                          <Link to={`/product/${product._id}`} className="text-decoration-none text-dark">
                            <div className="card card-product p-2 text-center h-100 d-flex flex-column justify-content-between">
                              <img src={product.image_url} className="card-img-top mx-auto" alt={product.name} style={{ height: '100px', objectFit: 'contain', width: 'auto' }} />
                              <div>
                                <p className="small mt-2 mb-1 text-truncate">{product.name}</p>
                                <div className="price">{product.price.toLocaleString()}đ</div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-muted">Không có sản phẩm nào.</p>}
                  <div className="mt-3"><p></p></div>
                </div>
              ) : (
                <img src="https://placehold.co/700x350/ddd/333?text=Banner+Chính" alt="Main Banner" className="img-fluid h-100 w-100" style={{ objectFit: 'cover' }} />
              )}
            </div>
          </div>
          <div className="col-lg-4 col-md-12 d-flex flex-column">
            <div className="d-flex flex-column h-100 gap-3">
              <div className="user-panel flex-fill d-flex flex-column justify-content-center">
                {isLoggedIn ? (
                  <div className="d-flex align-items-center flex-column">
                    <i className="bi bi-person-circle fs-2 text-secondary mb-2"></i>
                    <div className="small text-center">Chào mừng đến với<br /><strong>ElectroStore</strong></div>
                    <div className="small text-center mt-2">Xin chào, <strong>{user?.username}</strong></div>
                    <button className="btn btn-outline-danger w-100 btn-sm mt-3" onClick={handleLogout}>Đăng xuất</button>
                  </div>
                ) : (
                  <>
                    <div className="d-flex align-items-center mb-3">
                      <i className="bi bi-person-circle fs-2 text-secondary"></i>
                      <div className="ms-2 small">Chào mừng bạn đến với <br /><strong>ElectroStore</strong></div>
                    </div>

                    <button className="btn btn-outline-danger w-100 btn-sm mt-auto" onClick={handleShowLoginModal}>Đăng nhập</button>
                  </>
                )}
              </div>
              <div className="user-panel flex-fill d-flex flex-column justify-content-center">
                <p className="fw-bold mb-3 small">Ưu đãi cho bạn</p>
                <ul className="list-unstyled small text-muted mb-0">
                  <li className="mb-2"><i className="bi bi-book me-2"></i> Ưu đãi giáo dục</li>
                  <li className="mb-2"><i className="bi bi-fire me-2"></i> Deal hot mỗi ngày</li>
                  <li><i className="bi bi-arrow-repeat me-2"></i> Thu cũ đổi mới</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results Section */}
        {searchQuery.trim() && (
          <div className="row g-3 mb-4">
            <div className="col-12">
              <div className="card p-4">
                <h5 className="fw-bold mb-3">Kết quả tìm kiếm: "{searchQuery}"</h5>
                {filteredProducts.length > 0 ? (
                  <div className="row row-cols-1 row-cols-md-4 g-4">
                    {filteredProducts.map(product => (
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
                        <button 
                          className="btn btn-danger w-100 mt-2 btn-sm" 
                          onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                        >
                          Thêm vào giỏ
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-search fs-1 text-muted mb-3"></i>
                    <p className="text-muted">Không tìm thấy sản phẩm nào phù hợp với "{searchQuery}"</p>
                    <button className="btn btn-outline-danger btn-sm mt-2" onClick={() => setSearchQuery('')}>Xóa tìm kiếm</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Category Menu */}
        <div className="row g-3 mb-4">
          <div className="col-12">
            <div className="sidebar-menu d-flex flex-wrap justify-content-start gap-2 p-3">
              <div className={`sidebar-item ${selectedCategoryId === null ? 'active' : ''}`} onClick={() => handleCategoryClick(null)}>
                <i className="bi bi-grid me-2"></i> Tất cả sản phẩm
              </div>
              {categories.map(category => (
                <div key={category._id} className={`sidebar-item ${selectedCategoryId === category._id ? 'active' : ''}`} onClick={() => handleCategoryClick(category._id)}>
                  <i className={`bi ${
                    category.name.includes('Điện thoại') ? 'bi-phone' :
                    category.name.includes('Laptop') ? 'bi-laptop' :
                    category.name.includes('Âm thanh') ? 'bi-headphones' :
                    category.name.includes('Đồng hồ') || category.name.includes('Camera') ? 'bi-watch' :
                    category.name.includes('Gia dụng') ? 'bi-house-door' :
                    category.name.includes('Phụ kiện') ? 'bi-plug' :
                    'bi-tag'
                  } me-2`}></i> {category.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Products Section */}
        <CategoryProducts categoryId={selectedCategoryId} categories={categories} products={products} />

        <div className="mb-5 bg-danger p-3 rounded-3 text-center text-white">
          <h5>🔥 TÙNG TÙNG DEAL KHỦNG - GIẢM ĐẾN 50% - MUA NGAY 🔥</h5>
        </div>

        {/* Flashsale Section */}
        <FlashSale products={products} countdown={countdown} />

        {/* Hot Products Section */}
        <h4 className="fw-bold mb-4">SẢN PHẨM HOT</h4>
        <div className="row g-4 mb-5">
          <div className="col-lg-2 d-none d-lg-block">
            <div className="bg-dark text-white rounded-3 p-4 h-100 d-flex flex-column justify-content-center text-center">
              <h5>SẢN PHẨM HOT</h5>
              <p className="small text-muted">Ưu đãi độc quyền</p>
            </div>
          </div>
          <div className="col-lg-10">
            <div className="row row-cols-1 row-cols-md-4 g-4">
              {products.slice(0, 4).map(product => (
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
                  <button 
                    className="btn btn-danger w-100 mt-2 btn-sm" 
                    onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                  >
                    Thêm vào giỏ
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <h4 className="fw-bold mb-4">ĐÁNH GIÁ CỦA KHÁCH HÀNG</h4>
        <div className="row g-4">
          {/* Đánh giá 1 */}
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm p-3">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-secondary rounded-circle me-3" style={{width: '40px', height: '40px'}}></div>
                <div>
                  <h6 className="mb-0">Nguyễn Văn A</h6>
                  <div className="text-warning small">★★★★★</div>
                </div>
              </div>
              <p className="card-text text-muted">Sản phẩm rất chất lượng, đóng gói kỹ càng và giao hàng nhanh chóng. Rất hài lòng!</p>
            </div>
          </div>

          {/* Đánh giá 2 */}
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm p-3">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-secondary rounded-circle me-3" style={{width: '40px', height: '40px'}}></div>
                <div>
                  <h6 className="mb-0">Trần Thị B</h6>
                  <div className="text-warning small">★★★★☆</div>
                </div>
              </div>
              <p className="card-text text-muted">Giá cả hợp lý, nhân viên tư vấn nhiệt tình. Sẽ ủng hộ shop thêm nhiều lần nữa.</p>
            </div>
          </div>

          {/* Đánh giá 3 */}
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm p-3">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-secondary rounded-circle me-3" style={{width: '40px', height: '40px'}}></div>
                <div>
                  <h6 className="mb-0">Lê Văn C</h6>
                  <div className="text-warning small">★★★★★</div>
                </div>
              </div>
              <p className="card-text text-muted">Hàng giống mô tả 100%, chất liệu tốt. Cảm ơn shop rất nhiều vì món quà nhỏ đi kèm.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white mt-4 py-5">
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <h5>VỀ CHÚNG TÔI</h5>
              <p className="small">Chuyên cung cấp các sản phẩm chất lượng cao với dịch vụ tận tâm nhất.</p>
            </div>
            <div className="col-md-4">
              <h5>LIÊN KẾT NHANH</h5>
              <ul className="list-unstyled">
                <li><a href="#" className="text-white text-decoration-none">Chính sách bảo mật</a></li>
                <li><a href="#" className="text-white text-decoration-none">Điều khoản sử dụng</a></li>
              </ul>
            </div>
            <div className="col-md-4">
              <h5>THÔNG TIN LIÊN HỆ</h5>
              <p className="small">Email: support@example.com<br />Hotline: 1900 xxxx</p>
            </div>
          </div>
          <hr className="my-4" />
          <div className="text-center small">
            &copy; 2026 Bản quyền thuộc về thương hiệu của bạn.
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal show={showLoginModal} onClose={handleCloseLoginModal} onSwitchToRegister={handleSwitchToRegister} onLoginSuccess={handleLoginSuccess} />
      <RegisterModal show={showRegisterModal} onClose={handleCloseRegisterModal} onSwitchToLogin={handleSwitchToLogin} onRegisterSuccess={handleRegisterSuccess} />
    </div>
  );
};