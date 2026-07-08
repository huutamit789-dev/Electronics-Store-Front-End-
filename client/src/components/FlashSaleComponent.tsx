import React, { useState, useEffect } from 'react';
import { componentService } from '@/features/components/services/componentService';
import { ComponentItem } from '@/types/component';

interface FlashSaleComponentProps {
  position?: 'home_top' | 'home_middle' | 'home_bottom';
}

export const FlashSaleComponent: React.FC<FlashSaleComponentProps> = ({ position = 'home_top' }) => {
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeftMap, setTimeLeftMap] = useState<Map<string, { days: number; hours: number; minutes: number; seconds: number }>>(new Map());

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const response = await componentService.getComponentsByPosition(position);
        if (response.success) {
          setComponents(response.data.filter(c => c.is_active));
        }
      } catch (error) {
        console.error('Failed to fetch components:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComponents();
  }, [position]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const newTimeLeftMap = new Map<string, { days: number; hours: number; minutes: number; seconds: number }>();
      
      components.forEach(component => {
        if (component.show_countdown && component.countdown_end) {
          const endTime = new Date(component.countdown_end).getTime();
          const distance = endTime - now;

          if (distance > 0) {
            newTimeLeftMap.set(component._id, {
              days: Math.floor(distance / (1000 * 60 * 60 * 24)),
              hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
              minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
              seconds: Math.floor((distance % (1000 * 60)) / 1000)
            });
          } else {
            newTimeLeftMap.set(component._id, { days: 0, hours: 0, minutes: 0, seconds: 0 });
          }
        }
      });
      
      setTimeLeftMap(newTimeLeftMap);
    }, 1000);

    return () => clearInterval(timer);
  }, [components]);

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  if (components.length === 0) {
    return null;
  }

  return (
    <>
      {components.map((component) => (
        <div
          key={component._id}
          className="flash-sale-section mb-4"
          style={{
            backgroundColor: component.background_color,
            color: component.text_color,
            padding: '20px',
            borderRadius: '8px'
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <i className="fas fa-bolt fa-2x mr-3"></i>
              <div>
                <h2 className="m-0 font-weight-bold">{component.title}</h2>
                {component.description && <p className="m-0 mb-0">{component.description}</p>}
              </div>
            </div>
            
            {component.show_countdown && component.countdown_end && (
              <div className="countdown-timer d-flex align-items-center">
                <span className="mr-2">Kết thúc trong:</span>
                <div className="d-flex align-items-center">
                  {(() => {
                    const timeLeft = timeLeftMap.get(component._id) || { days: 0, hours: 0, minutes: 0, seconds: 0 };
                    return (
                      <>
                        <div className="d-flex align-items-center">
                          <div className="time-box mx-1 px-3 py-2 rounded text-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)', minWidth: '50px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{String(timeLeft.days).padStart(2, '0')}</div>
                            <div style={{ fontSize: '0.7rem' }}>Ngày</div>
                          </div>
                          <span className="mx-1" style={{ fontSize: '1.5rem' }}>:</span>
                          <div className="time-box mx-1 px-3 py-2 rounded text-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)', minWidth: '50px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{String(timeLeft.hours).padStart(2, '0')}</div>
                            <div style={{ fontSize: '0.7rem' }}>Giờ</div>
                          </div>
                          <span className="mx-1" style={{ fontSize: '1.5rem' }}>:</span>
                          <div className="time-box mx-1 px-3 py-2 rounded text-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)', minWidth: '50px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{String(timeLeft.minutes).padStart(2, '0')}</div>
                            <div style={{ fontSize: '0.7rem' }}>Phút</div>
                          </div>
                          <span className="mx-1" style={{ fontSize: '1.5rem' }}>:</span>
                          <div className="time-box mx-1 px-3 py-2 rounded text-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)', minWidth: '50px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{String(timeLeft.seconds).padStart(2, '0')}</div>
                            <div style={{ fontSize: '0.7rem' }}>Giây</div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>

          <div className="row">
            {component.products.map((product, index) => (
              <div key={index} className="col-md-6 col-lg-4 mb-3">
                <div className="card product-card h-100">
                  <div className="card-body">
                    <div className="product-image mb-3">
                      <img
                        src={product.product_image}
                        alt={product.product_name}
                        className="img-fluid rounded"
                        style={{ height: '150px', objectFit: 'cover', width: '100%' }}
                      />
                    </div>
                    <h5 className="card-title">{product.product_name}</h5>
                    <div className="price-section mb-2">
                      <span className="discount-price font-weight-bold" style={{ fontSize: '1.2rem', color: component.button_color }}>
                        {product.discount_price.toLocaleString('vi-VN')}đ
                      </span>
                      <span className="original-price text-muted ml-2" style={{ textDecoration: 'line-through' }}>
                        {product.original_price.toLocaleString('vi-VN')}đ
                      </span>
                      <span className="discount-badge badge badge-danger ml-2">
                        -{product.discount_percentage}%
                      </span>
                    </div>
                    <div className="progress mb-2" style={{ height: '20px' }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${product.sold_percentage}%`,
                          backgroundColor: component.button_color
                        }}
                        aria-valuenow={product.sold_percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        ĐÃ BÁN {product.sold_percentage}%
                      </div>
                    </div>
                    <button
                      className="btn btn-block mt-2"
                      style={{
                        backgroundColor: component.button_color,
                        color: component.button_text_color
                      }}
                    >
                      Mua ngay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};
