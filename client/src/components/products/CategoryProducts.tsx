import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/product';
import { productService } from '@/features/products/services/productService';
import { useCartStore } from '@/store/useCartStore';
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
  const { addItem } = useCartStore();

  const fetchProductsByCategory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = categoryId
          ? await productService.getProductByCategoryId(categoryId, 1, 12)
          : await productService.getAllProducts(1, 12);

      setProducts(response.data.products ?? []);
    } catch (err) {
      setError('Không thể tải sản phẩm cho danh mục này.');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchProductsByCategory();
  }, [fetchProductsByCategory]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    addItem({
      productId: product._id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url || '',
    });
    alert(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  // Hàm xử lý khi ảnh bị lỗi hoặc không tải được
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/images/default-product.png';
  };

  const categoryName = categories.find(c => c._id === categoryId)?.name || 'Tất cả sản phẩm';

  return (
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
        )}
      </div>
  );
};