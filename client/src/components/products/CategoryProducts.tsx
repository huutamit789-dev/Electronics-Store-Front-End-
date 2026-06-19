import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/product';
import { productService } from '@/features/products/services/productService';

// Import a local image for placeholder
import iphone1 from '@/assets/images/iphone-17-pro-max-3.webp';

interface Category {
  _id: string;
  name: string;
}

interface CategoryProductsProps {
  categoryId: string | null;
  categories: Category[];
    products: Product[];
}

export const CategoryProducts: React.FC<CategoryProductsProps> = ({ categoryId, categories }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductsByCategory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = categoryId
        ? await productService.getProductByCategoryId(categoryId, 1, 12) // Fetch up to 12 products
        : await productService.getAllProducts(1, 12);

      const fetchedProducts = response.data.products
        ?? response.data.categories?.flatMap(cat => cat.products)
        ?? [];

      // Simple image placeholder logic
      const productsWithImages = fetchedProducts.map((p, index) => ({
        ...p,
        image_url: p.image_url || iphone1,
      }));

      setProducts(productsWithImages);
    } catch (err) {
      console.error('Failed to fetch category products:', err);
      setError('Không thể tải sản phẩm cho danh mục này.');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchProductsByCategory();
  }, [fetchProductsByCategory]);

  const categoryName = categories.find(c => c._id === categoryId)?.name || 'Tất cả sản phẩm';

  const containerStyle: React.CSSProperties = {
    minHeight: '500px', // Set a minimum height for the container
    display: 'flex',
    flexDirection: 'column',
  };

  if (error) {
    return (
      <div className="category-products-wrapper mb-5 p-4" style={containerStyle}>
        <h4 className="fw-bold mb-4 text-danger">Lỗi</h4>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="category-products-wrapper mb-5 p-4" style={containerStyle}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold">Sản phẩm cho: {categoryName}</h4>
      </div>
      <div className="flex-grow-1 d-flex align-items-center justify-content-center">
        {loading ? (
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-4 g-4 w-100">
            {products.length > 0 ? (
              products.map(product => (
                <div className="col" key={product._id}>
                  <Link to={`/product/${product._id}`} className="text-decoration-none text-dark">
                    <div className="card card-product p-3 h-100">
                      <img src={product.image_url} className="card-img-top" alt={product.name} style={{ height: '200px', objectFit: 'contain' }} />
                      <div className="card-body px-0 pb-0 d-flex flex-column">
                        <p className="small text-truncate flex-grow-1">{product.name}</p>
                        <p className="price mb-0">{product.price.toLocaleString()}đ</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-12">
                <p className="text-center text-muted">Không có sản phẩm nào trong danh mục này.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};