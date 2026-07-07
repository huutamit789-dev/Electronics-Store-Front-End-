import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/product';
import { productService } from '@/features/products/services/productService';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useCart } from '@/contexts/CartContext';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';
import '@/index.css';

// Import local images as fallback for placeholders
import iphone1 from '@/assets/images/iphone-17-pro-max-3.webp';
import iphone2 from '@/assets/images/iphone-17-pro-max_3.webp';
import iphone3 from '@/assets/images/iphone-17-pro-max-1_4.webp';
import iphone4 from '@/assets/images/iphone-17-pro-max_1_3.webp';
const localImages = [iphone1, iphone2, iphone3, iphone4];

interface Category {
  _id: string;
  name: string;
}

interface CategoryProductsProps {
  categoryId: string | null;
  categories: Category[];
  keyword: string;
  priceRange: string;
  ram: string;
  storage: string;
  sortBy: string;
}

/**
 * @component CategoryProducts
 * @description Renders a paginated grid of products filtered by category, search keywords, and specifications.
 * Supports adding to cart, authentication modals, and automatic local image fallbacks.
 */
export const CategoryProducts: React.FC<CategoryProductsProps> = ({
  categoryId,
  categories,
  keyword,
  priceRange,
  ram,
  storage,
  sortBy
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showCartToast, setShowCartToast] = useState(false);
  
  const { addItem } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  const { addToCartContext, user } = useCart();

  // States phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 12; // 12 sản phẩm trên 1 trang cho cân đối 3 hoặc 4 cột

  /**
   * @function fetchProductsByFilters
   * @description Fetches matching product records from the backend search API based on category, keyword, and specs.
   */
  const fetchProductsByFilters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page: currentPage,
        limit: productsPerPage,
        sortBy
      };

      if (categoryId) {
        params.cate_id = categoryId;
      }

      if (keyword && keyword.trim()) {
        params.keyword = keyword.trim();
      }

      // Lọc theo khoảng giá
      if (priceRange === 'under5') {
        params.priceMax = 5000000;
      } else if (priceRange === '5to15') {
        params.priceMin = 5000000;
        params.priceMax = 15000000;
      } else if (priceRange === '15to25') {
        params.priceMin = 15000000;
        params.priceMax = 25000000;
      } else if (priceRange === 'over25') {
        params.priceMin = 25000000;
      }

      // Lọc thông số specs
      if (ram !== 'all') {
        params.ram = ram;
      }
      if (storage !== 'all') {
        params.storage = storage;
      }

      const response = await productService.searchProducts(params);
      const fetchedProducts = response.data.products ?? [];

      // Dự phòng ảnh nếu link trong database chứa từ khóa placeholder
      const productsWithLocalImages = fetchedProducts.map((product: Product, index: number) => ({
        ...product,
        image_url: (product.image_url && !product.image_url.includes('placeholder'))
                     ? product.image_url
                     : localImages[index % localImages.length]
      }));

      setProducts(productsWithLocalImages);
      setTotalPages(response.data.totalPages || 1);
      setTotalProducts(response.data.total || 0);

      console.log('CategoryProducts - Lấy thành công:', fetchedProducts.length, 'sản phẩm');
    } catch (err) {
      setError('Không thể tải danh sách sản phẩm phù hợp.');
      console.error('CategoryProducts - Lỗi khi fetch sản phẩm:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, currentPage, productsPerPage, keyword, priceRange, ram, storage, sortBy]);

  // Reset trang về 1 khi bất kỳ bộ lọc hoặc danh mục nào thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId, keyword, priceRange, ram, storage, sortBy]);

  // Gọi API tải sản phẩm khi trang hiện tại hoặc logic truy vấn thay đổi
  useEffect(() => {
    fetchProductsByFilters();
  }, [fetchProductsByFilters]);

  /**
   * @function handleAddToCart
   * @description Handles adding a product to the user's shopping cart, triggers login if not authenticated.
   * @param {React.MouseEvent} e - Mouse click event.
   * @param {Product} product - Product details object.
   */
  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    if (!isLoggedIn) {
      handleShowLoginModal();
      return;
    }
    if (isLoggedIn && user?._id) {
      addToCartContext(user._id, product._id, 1, product.price).then(ok => { if (ok) setShowCartToast(true); });
    } else {
      addItem({
        productId: product._id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        image_url: product.image_url || '',
        stock_quantity: product.stock_quantity
      });
      setShowCartToast(true);
    }

    // Tự động đóng Toast sau 2 giây
    setTimeout(() => {
      setShowCartToast(false);
    }, 2000);
  };

  /**
   * @function handlePageChange
   * @description Modifies the current pagination index and scrolls to top of products list.
   * @param {number} page - Targeted page index.
   */
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      const productsSection = document.getElementById('products-section');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  /**
   * @function handleImageError
   * @description Fallback handler when the product image url is broken.
   */
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/images/default-product.png';
  };

  const categoryName = categories.find(c => c._id === categoryId)?.name || 'Tất cả sản phẩm';
  const displayTitle = keyword ? `Kết quả tìm kiếm: "${keyword}"` : categoryName;

  const handleShowLoginModal = () => { setShowLoginModal(true); setShowRegisterModal(false); };
  const handleCloseLoginModal = () => setShowLoginModal(false);
  const handleShowRegisterModal = () => { setShowRegisterModal(true); setShowLoginModal(false); };
  const handleCloseRegisterModal = () => setShowRegisterModal(false);
  const handleSwitchToRegister = () => { setShowLoginModal(false); setShowRegisterModal(true); };
  const handleSwitchToLogin = () => { setShowRegisterModal(false); setShowLoginModal(true); };

  return (
    <>
      <div className="mb-5 bg-white p-4 rounded-4 shadow-sm border border-light">
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
          <h4 className="fw-bold fs-5 d-flex align-items-center gap-2 m-0 text-gray-800">
            <i className="bi bi-collection text-danger"></i> {displayTitle}
          </h4>
          <span className="text-secondary small fw-medium">Tìm thấy {totalProducts} sản phẩm</span>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status"></div>
            <p className="text-muted small mt-2">Đang tải sản phẩm phù hợp...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger shadow-sm rounded-3">{error}</div>
        ) : (
          <>
            <div className="row row-cols-2 row-cols-md-3 g-3">
              {products.length > 0 ? (
                products.map(product => (
                  <div className="col" key={product._id}>
                    <div className="card h-100 border border-light shadow-sm hover-lift p-3 rounded-4 img-zoom-container d-flex flex-column bg-white">
                      <Link to={`/product/${product._id}`} className="text-decoration-none text-dark flex-grow-1">
                        <img
                          src={product.image_url}
                          className="card-img-top rounded-3 object-fit-contain mb-3"
                          alt={product.name}
                          style={{ height: '170px' }}
                          onError={handleImageError}
                        />
                        <h6 className="fw-semibold text-truncate text-gray-900 mb-1" style={{ fontSize: '0.9rem' }}>
                          {product.name}
                        </h6>
                        <div className="text-brand-red fw-bold fs-6 mb-3">{product.price.toLocaleString()}đ</div>
                      </Link>
                      <button
                        className="btn btn-light border w-100 rounded-3 fw-bold mt-auto text-dark hover-brand-red transition"
                        onClick={(e) => handleAddToCart(e, product)}
                        style={{ fontSize: '0.85rem' }}
                      >
                        Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center py-5">
                  <i className="bi bi-search fs-1 text-muted mb-3 d-block"></i>
                  <p className="text-muted">Không tìm thấy sản phẩm nào khớp với bộ lọc.</p>
                </div>
              )}
            </div>

            {/* Điều hướng phân trang */}
            {totalPages > 1 && (
              <nav aria-label="Product pagination" className="mt-5">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link px-3 py-2 rounded-start-3" onClick={() => handlePageChange(currentPage - 1)}>
                       Trước
                    </button>
                  </li>
                  {[...Array(totalPages)].map((_, index) => (
                    <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                      <button className="page-link px-3 py-2" onClick={() => handlePageChange(index + 1)}>
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link px-3 py-2 rounded-end-3" onClick={() => handlePageChange(currentPage + 1)}>
                      Sau 
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <LoginModal show={showLoginModal} onClose={handleCloseLoginModal} onSwitchToRegister={handleSwitchToRegister} onLoginSuccess={handleCloseLoginModal} />
      <RegisterModal show={showRegisterModal} onClose={handleCloseRegisterModal} onSwitchToLogin={handleSwitchToLogin} onRegisterSuccess={handleCloseRegisterModal} />

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
    </>
  );
};