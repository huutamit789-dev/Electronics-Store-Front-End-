import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CustomHeader } from '@/components/layout/Header'; // Sử dụng CustomHeader đã refactor sang Bootstrap
import { Product } from '@/types/product'; // Import kiểu Product
import { useCartStore } from '@/store/useCartStore';
import { CartItem } from '@/types/order';
import toast from 'react-hot-toast';

// Định nghĩa kiểu dữ liệu cho Product Detail API Response
interface ProductDetailApiResponse {
  success: boolean;
  message: string;
  data: Product; // Giả định API trả về trực tiếp đối tượng Product
}

// Định nghĩa kiểu dữ liệu cho Category
interface Category {
  _id: string;
  name: string;
  description: string;
  __v: number;
}

// Định nghĩa kiểu dữ liệu cho Category API Response
interface CategoryApiResponse {
    success: boolean;
    message: string;
    data: {
        categories: Category[];
    };
}

// CSS tùy chỉnh từ ProductDetail.html
const customStyles = `
  :root { --cps-red: #d70018; }
  .text-cps-red { color: var(--cps-red); }
  .bg-cps-red { background-color: var(--cps-red); }
  .btn-cps { background-color: var(--cps-red); color: white; border-radius: 8px; }
  .btn-cps:hover { background-color: #b30013; color: white; }
  .price-current { font-size: 1.5rem; font-weight: 700; color: var(--cps-red); }
  .price-old { text-decoration: line-through; color: #6c757d; font-size: 0.9rem; }
  .sticky-action-bar { position: fixed; bottom: 0; width: 100%; background: white; border-top: 1px solid #ddd; z-index: 1000; padding: 10px 0; }
  .card-border { border: 1px solid #e0e0e0; border-radius: 12px; }
`;

export const ProductDetailPage: React.FC = () => { // Đã xóa ({product}: ProductDetailPageProps)
  const { id } = useParams<{ id: string }>(); // Lấy product ID từ URL
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]); // Thêm state cho categories
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (!product) return;
    const cartItem: CartItem = {
      productId: product._id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url,
    };
    addItem(cartItem);
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  useEffect(() => {
    // Inject custom styles
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = customStyles;
    document.head.appendChild(styleSheet);

    const fetchData = async () => {
      if (!id) {
        setError('Product ID is missing.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Fetch product details
        const productResponse = await axios.get<ProductDetailApiResponse>(`http://localhost:8090/api/products/${id}`);
        setProduct(productResponse.data.data);
        console.log('Fetched product details:', productResponse.data.data);

        // Fetch categories
        const categoriesResponse = await axios.get<CategoryApiResponse>('http://localhost:8090/api/categories');
        setCategories(categoriesResponse.data.data.categories);
        console.log('Fetched categories:', categoriesResponse.data.data.categories);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load product details or categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      document.head.removeChild(styleSheet); // Clean up styles on unmount
    };
  }, [id]);

  // Tìm tên danh mục dựa trên cate_id của sản phẩm
  // Sử dụng optional chaining an toàn hơn
  const categoryName = product ? categories.find(cat => cat._id === product.cate_id)?.name : 'Danh mục';

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-light text-dark justify-content-center align-items-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 fs-5">Đang tải chi tiết sản phẩm...</p>
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

  if (!product) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-light text-dark justify-content-center align-items-center">
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">Không tìm thấy sản phẩm!</h4>
          <p>Sản phẩm bạn đang tìm kiếm không tồn tại.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-light text-dark">
      <CustomHeader />
      <nav className="container my-3 text-secondary small">
        <Link to="/" className="text-decoration-none text-secondary">Trang chủ</Link> /
        {/* Sử dụng cate_id thay vì category_id */}
        <Link to={`/?categoryId=${product!.cate_id || ''}`} className="text-decoration-none text-secondary"> {categoryName}</Link> /
        <span> {product!.name}</span>
      </nav>

      <main className="container flex-grow-1">
        <div className="row g-4">
          {/* Left Column */}
          <div className="col-md-7">
            <div className="card p-3 border-0 shadow-sm rounded-4">
              <img src={product.image_url} className="img-fluid rounded-3" alt={product.name} />
            </div>
            <div className="mt-4 card p-3 border-0 shadow-sm rounded-4">
              <h5 className="fw-bold">Mô tả sản phẩm</h5>
              <p className="text-muted">{product.description}</p>
              {/* Có thể thêm các tính năng nổi bật khác nếu có trong product object */}
            </div>
          </div>

          {/* Right Column */}
          <div className="col-md-5">
            <h2 className="fw-bold fs-4">{product.name}</h2>

            {/* Price Section */}
            <div className="card p-3 my-3 card-border">
              <div className="d-flex align-items-center gap-2">
                <span className="price-current">{product.price.toLocaleString()}₫</span>
                {/* Giả định có original_price để hiển thị giá cũ */}
                {/* <span className="price-old">31.990.000₫</span> */}
              </div>
            </div>

            {/* Offers Section */}
            <div className="card p-3 card-border">
              <h6 className="fw-bold text-danger">🎁 Khuyến mãi</h6>
              <ul className="list-unstyled small mt-2">
                <li>• Trả góp 0% lãi suất</li>
                <li>• Tặng kèm bộ phụ kiện chính hãng</li>
                <li>• Bảo hành 24 tháng toàn quốc</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="d-grid gap-2 mt-4">
              <button className="btn btn-cps btn-lg" onClick={handleAddToCart}>
                <i className="fas fa-shopping-cart me-2"></i> Thêm vào giỏ hàng
              </button>
              <button className="btn btn-outline-danger btn-lg">
                <i className="fas fa-phone me-2"></i> Gọi tư vấn
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Action Bar for Mobile */}
      <div className="sticky-action-bar d-md-none">
        <div className="container d-flex gap-2">
          <button className="btn btn-outline-danger flex-grow-1">Gọi tư vấn</button>
          <button className="btn btn-cps flex-grow-1" onClick={handleAddToCart}>Mua ngay</button>
        </div>
      </div>
    </div>
  );
};