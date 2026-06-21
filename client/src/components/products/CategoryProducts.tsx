import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/product';
import { productService } from '@/features/products/services/productService';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';
import '@/index.css';

interface Category {
  _id: string;
  name: string;
}

interface CategoryProductsProps {
  categoryId: string | null;
  categories: Category[];
}

export const CategoryProducts: React.FC<CategoryProductsProps> = ({ categoryId, categories }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showCartToast, setShowCartToast] = useState(false);
  const { addItem } = useCartStore();
  const { isLoggedIn } = useAuthStore();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 10; // Changed from 4 to 10 as requested

  const fetchProductsByCategory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = categoryId
          ? await productService.getProductByCategoryId(categoryId, currentPage, productsPerPage)
          : await productService.getAllProducts(currentPage, productsPerPage);

      setProducts(response.data.products ?? []);
      setTotalPages(response.data.totalPages || 1); // Assuming API returns totalPages

      console.log('CategoryProducts - Fetched products:', response.data.products?.length);
      console.log('CategoryProducts - Current Page:', currentPage);
      console.log('CategoryProducts - Total Pages:', response.data.totalPages);
      console.log('CategoryProducts - Total Products (from API):', response.data.total);

    } catch (err) {
      setError('Không thể tải sản phẩm cho danh mục này.');
      console.error('CategoryProducts - Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, currentPage, productsPerPage]);

  useEffect(() => {
    // Reset to first page when category changes
    setCurrentPage(1);
  }, [categoryId]);

  useEffect(() => {
    fetchProductsByCategory();
  }, [fetchProductsByCategory]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    if (!isLoggedIn) {
      handleShowLoginModal();
      return;
    }
    addItem({
      productId: product._id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url || '',
    });
    setShowCartToast(true);

    // Auto close toast after 2 seconds
    setTimeout(() => {
      setShowCartToast(false);
    }, 2000);
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of the products section after page change
      const productsSection = document.getElementById('products-section');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Modal handlers
  const handleShowLoginModal = () => { setShowLoginModal(true); setShowRegisterModal(false); };
  const handleCloseLoginModal = () => setShowLoginModal(false);
  const handleShowRegisterModal = () => { setShowRegisterModal(true); setShowLoginModal(false); };
  const handleCloseRegisterModal = () => setShowRegisterModal(false);
  const handleSwitchToRegister = () => { setShowLoginModal(false); setShowRegisterModal(true); };
  const handleSwitchToLogin = () => { setShowRegisterModal(false); setShowLoginModal(true); };

  // Hàm xử lý khi ảnh bị lỗi hoặc không tải được
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/images/default-product.png';
  };

  const categoryName = categories.find(c => c._id === categoryId)?.name || 'Tất cả sản phẩm';

  return (
    <>
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold fs-4 d-flex align-items-center gap-2">
            <i className="bi bi-collection text-danger"></i> {categoryName}
          </h4>
        </div>

        {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" role="status"></div>
            </div>
        ) : error ? (
            <div className="alert alert-danger">{error}</div>
        ) : (
            <>
              <div className="row row-cols-2 row-cols-md-4 g-4">
                {products.length > 0 ? (
                    products.map(product => (
                        <div className="col" key={product._id}>
                          <div className="card custom-product-card h-100 d-flex flex-column">
                            <Link to={`/product/${product._id}`} className="text-decoration-none text-dark flex-grow-1">
                              <img
                                  src={product.image_url}
                                  className="w-100 rounded-3 mb-3"
                                  alt={product.name}
                                  style={{ height: '180px', objectFit: 'contain' }}
                                  onError={handleImageError}
                              />
                              <div className="px-1">
                                <p className="product-title">{product.name}</p>
                                <p className="product-price">{product.price.toLocaleString()}đ</p>
                              </div>
                            </Link>
                            <button
                                className="btn btn-add-to-cart w-100 mt-auto"
                                onClick={(e) => handleAddToCart(e, product)}
                            >
                              Thêm vào giỏ
                            </button>
                          </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center py-5">
                      <p className="text-muted">Không có sản phẩm nào trong danh mục này.</p>
                    </div>
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <nav aria-label="Product pagination" className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Trước</button>
                    </li>
                    {[...Array(totalPages)].map((_, index) => (
                      <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(index + 1)}>{index + 1}</button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Sau</button>
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