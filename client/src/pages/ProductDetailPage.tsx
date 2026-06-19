import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CustomHeader } from '@/components/layout/Header'; // Sử dụng CustomHeader đã refactor sang Bootstrap
import { Product } from '@/types/product';
import axiosClient from "@/api/axiosClient"; // Import kiểu Product
import { jwtDecode } from 'jwt-decode'; // Đã sửa lỗi import: sử dụng named import { jwtDecode }

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

interface AuthUser {
  _id: string;
  username: string;
  role: string;
  // Thêm các thuộc tính khác nếu có trong payload của token
}

interface AuthContextType {
  user: AuthUser | null;
  // other auth functions like login, logout
}

const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token'); // Đọc token từ localStorage
    if (storedToken) {
      try {
        const decodedToken: any = jwtDecode(storedToken); // Đã sửa: sử dụng jwtDecode

        // Kiểm tra thời gian hết hạn của token
        if (decodedToken.exp * 1000 < Date.now()) {
          console.log("Token đã hết hạn.");
          localStorage.removeItem('token'); // Xóa token hết hạn
          setUser(null);
          return;
        }

        // Lấy thông tin người dùng từ payload đã giải mã
        const authUser: AuthUser = {
          _id: decodedToken.id, // Lấy id từ token
          username: decodedToken.username,
          role: decodedToken.role,
          // Map các thuộc tính khác từ decodedToken nếu có
        };
        setUser(authUser);
      } catch (e) {
        console.error("Failed to decode token or parse user data", e);
        localStorage.removeItem('token'); // Xóa token không hợp lệ
        setUser(null);
      }
    }
  }, []);

  return { user };
};
// --- End of Placeholder ---


export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get userId from your authentication context
  const { user } = useAuth(); // Sử dụng useAuth hook đã được cập nhật

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
        const productResponse = await axiosClient.get<ProductDetailApiResponse>(`http://localhost:8090/api/products/${id}`);
        setProduct(productResponse.data.data);
        console.log('Fetched product details:', productResponse.data.data);

        // Fetch categories
        const categoriesResponse = await axiosClient.get<CategoryApiResponse>('http://localhost:8090/api/categories');
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

  const handleAddToCart = async () => {
    if (!product) {
      alert('Không thể thêm sản phẩm vào giỏ hàng vì thông tin sản phẩm không đầy đủ.');
      return;
    }

    // Use user._id from the auth context
    if (!user?._id) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
      // Bạn có thể chuyển hướng đến trang đăng nhập hoặc hiển thị modal đăng nhập ở đây
      return;
    }

    try {
      const response = await axiosClient.post('http://localhost:8090/api/cart/add', {
        userId: user._id, // Sử dụng user._id đã lấy từ token
        productId: product._id,
        quantity: 1,
        price: product.price,
      });

      if (response.data.success) {
        alert('Sản phẩm đã được thêm vào giỏ hàng thành công!');
        console.log('Add to cart successful:', response.data);
        // Tùy chọn: cập nhật context giỏ hàng hoặc hiển thị thông báo
      } else {
        alert(`Lỗi khi thêm sản phẩm vào giỏ hàng: ${response.data.message}`);
        console.error('Add to cart failed:', response.data.message);
      }
    } catch (err) {
      console.error('Error adding product to cart:', err);
      alert('Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
    }
  };

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
          <button className="btn btn-cps flex-grow-1">Mua ngay</button>
        </div>
      </div>
    </div>
  );
};