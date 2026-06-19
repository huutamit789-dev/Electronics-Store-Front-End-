import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/product';

interface FlashSaleProps {
  products: Product[];
  countdown: { hours: number; minutes: number; seconds: number };
}

export const FlashSale: React.FC<FlashSaleProps> = ({ products, countdown }) => {
  // Lọc lấy 5 sản phẩm đầu tiên hoặc tùy chỉnh logic của bạn
  const flashSaleItems = products.slice(0, 5);

  return (
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
          {flashSaleItems.map(product => (
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
  );
};