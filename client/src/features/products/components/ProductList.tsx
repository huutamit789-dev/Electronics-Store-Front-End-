import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { Product } from '@/types/product';

interface ProductListProps {
  products: Product[];
}

export const ProductList = ({ products }: ProductListProps) => {
  if (!products || products.length === 0) {
    return (
      <div className="p-3 text-center text-secondary">
        <p>Không có sản phẩm nào để hiển thị.</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="row row-cols-2 row-cols-sm-3 row-cols-lg-5 g-3">
        {products.map((product: Product) => (
          <div key={product._id} className="col">
            {/* Bọc toàn bộ card trong Link */}
            <Link to={`/product/${product._id}`} className="text-decoration-none text-dark">
              <div className="card h-100 shadow-sm border border-light rounded-3 hover-shadow-lg transition-shadow">
                <img src={product.image_url} alt={product.name} className="card-img-top p-3" style={{ height: '160px', objectFit: 'contain' }} />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fs-6 fw-semibold mb-2 text-truncate" style={{ height: '2.5em' }}>{product.name}</h5>
                  <div className="mt-auto text-danger fw-bold fs-5">{product.price.toLocaleString()}₫</div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};