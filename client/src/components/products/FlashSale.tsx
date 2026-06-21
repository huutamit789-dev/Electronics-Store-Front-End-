import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';

interface FlashSaleProps {
  products: Product[];
  countdown: any;
}

export const FlashSale: React.FC<FlashSaleProps> = ({ products, countdown }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addItem } = useCartStore();
  const { isLoggedIn } = useAuthStore();

  const itemsPerPage = 4; // Changed from 4 to 10
  const totalSlides = Math.ceil(products.length / itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getCurrentProducts = () => {
    const start = currentIndex * itemsPerPage;
    return products.slice(start, start + itemsPerPage);
  };

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
  };

  // Modal handlers
  const handleShowLoginModal = () => { setShowLoginModal(true); setShowRegisterModal(false); };
  const handleCloseLoginModal = () => setShowLoginModal(false);
  const handleShowRegisterModal = () => { setShowRegisterModal(true); setShowLoginModal(false); };
  const handleCloseRegisterModal = () => setShowRegisterModal(false);
  const handleSwitchToRegister = () => { setShowLoginModal(false); setShowRegisterModal(true); };
  const handleSwitchToLogin = () => { setShowRegisterModal(false); setShowLoginModal(true); };

  return (
    <>
      <section className="mb-5 mt-4">
        {/* CHÍNH LÀ THẺ DIV NÀY: Phải có class flash-sale-container */}
        <div className="flash-sale-container p-4 p-md-5 shadow-lg position-relative">

          {/* Tiêu đề & Đồng hồ đếm ngược */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">

            <div className="d-flex align-items-center gap-3">
              <div className="bg-white text-danger rounded-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '48px', height: '48px' }}>
                <i className="bi bi-lightning-charge-fill fs-3"></i>
              </div>
              <div className="text-white">
                <h2 className="fs-3 fw-bold fst-italic mb-0" style={{ letterSpacing: '0.5px' }}>FLASH SALE</h2>
                <div className="opacity-75 small">Săn deal chớp nhoáng, giá cực sốc</div>
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

          {/* Lưới sản phẩm Flash Sale */}
          <div className="position-relative">
            <button
              className="btn btn-light position-absolute top-50 start-0 translate-middle-y z-2 rounded-circle shadow-sm border"
              style={{ width: '36px', height: '36px', padding: 0, marginLeft: '-18px' }}
              onClick={prevSlide}
              disabled={totalSlides <= 1}
            >
              <i className="bi bi-chevron-left text-secondary"></i>
            </button>

            <div className="row row-cols-2 row-cols-md-4 g-3">
              {getCurrentProducts().map((product) => (
                <div className="col" key={product._id}>
                  <div className="card card-product p-3 h-100 d-flex flex-column bg-white">
                    <Link to={`/product/${product._id}`} className="text-decoration-none text-dark flex-grow-1 d-flex flex-column">

                      <div className="position-relative mb-3">
                        <img
                          src={product.image_url}
                          className="w-100 rounded-3"
                          style={{ height: '150px', objectFit: 'contain' }}
                          alt={product.name}
                        />
                        <span className="badge bg-danger position-absolute top-0 start-0 m-2 px-2 py-1 shadow-sm">
                          -15%
                        </span>
                      </div>

                      <h6 className="fw-bold text-truncate mb-2">{product.name}</h6>
                      <div className="text-danger fw-bold fs-5 lh-1 mb-1">{product.price.toLocaleString()}đ</div>
                      <div className="text-muted text-decoration-line-through mb-3" style={{ fontSize: '0.75rem' }}>
                        {(product.price * 1.15).toLocaleString()}đ
                      </div>

                      <div className="mt-auto">
                        <div className="progress mb-2" style={{ height: '4px', backgroundColor: '#e9ecef' }}>
                          <div className="progress-bar bg-danger" role="progressbar" style={{ width: '85%' }}></div>
                        </div>
                        <div className="text-center text-muted fw-bold mb-3" style={{ fontSize: '0.65rem' }}>
                          ĐÃ BÁN 85%
                        </div>
                      </div>
                    </Link>

                    <button
                      className="btn btn-buy-dark w-100 py-2 mt-auto"
                      onClick={(e) => handleAddToCart(e, product)}
                    >
                      Mua ngay
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="btn btn-light position-absolute top-50 end-0 translate-middle-y z-2 rounded-circle shadow-sm border"
              style={{ width: '36px', height: '36px', padding: 0, marginRight: '-18px' }}
              onClick={nextSlide}
              disabled={totalSlides <= 1}
            >
              <i className="bi bi-chevron-right text-secondary"></i>
            </button>
          </div>

        </div>
      </section>

      {/* Modals */}
      <LoginModal show={showLoginModal} onClose={handleCloseLoginModal} onSwitchToRegister={handleSwitchToRegister} onLoginSuccess={handleCloseLoginModal} />
      <RegisterModal show={showRegisterModal} onClose={handleCloseRegisterModal} onSwitchToLogin={handleSwitchToLogin} onRegisterSuccess={handleCloseLoginModal} />
    </>
  );
};