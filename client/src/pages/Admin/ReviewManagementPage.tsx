import React, { useEffect, useState } from 'react';
// Xóa các import Ant Design
// import { Table, Button, Space, Typography, Spin, Alert, Rate } from 'antd';
// import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';

// Định nghĩa kiểu dữ liệu cho Review
interface Review {
  _id: string;
  product_id: string; // ID sản phẩm được đánh giá
  user_id: string;    // ID người dùng đánh giá
  rating: number;     // Điểm đánh giá (1-5)
  comment: string;    // Bình luận
  created_at: string;
  // Thêm các trường khác nếu có
}

// Định nghĩa kiểu dữ liệu cho Review API Response
interface ReviewApiResponse {
    success: boolean;
    message: string;
    data: Review[]; // Giả định API trả về trực tiếp mảng Review
}

export const ReviewManagementPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // Endpoint: GET /api/reviews
        const response = await axios.get<ReviewApiResponse>('http://localhost:8090/api/reviews');
        setReviews(response.data.data || []);
        console.log('Fetched reviews:', response.data.data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleViewReview = (reviewId: string) => {
    console.log('Event: View review button clicked for review ID:', reviewId);
    // Logic để xem chi tiết đánh giá
  };

  const handleEditReview = (reviewId: string) => {
    console.log('Event: Edit review button clicked for review ID:', reviewId);
    // Logic để mở form chỉnh sửa đánh giá
  };

  const handleDeleteReview = (reviewId: string) => {
    console.log('Event: Delete review button clicked for review ID:', reviewId);
    // Logic để xác nhận và xóa đánh giá
  };

  const renderRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < rating) {
        stars.push(<i key={i} className="fas fa-star text-warning"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star text-secondary"></i>);
      }
    }
    return <>{stars}</>;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải đánh giá...</span>
        </div>
        <span className="ms-2">Đang tải đánh giá...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Lỗi!</h4>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="h3 mb-4 text-gray-800">Quản lý Đánh giá</h1>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Danh sách Đánh giá</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th>ID Đánh giá</th>
                  <th>ID Sản phẩm</th>
                  <th>ID Người dùng</th>
                  <th>Điểm</th>
                  <th>Bình luận</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review._id}>
                    <td><span className="d-inline-block text-truncate" style={{ maxWidth: '100px' }}>{review._id}</span></td>
                    <td><span className="d-inline-block text-truncate" style={{ maxWidth: '100px' }}>{review.product_id}</span></td>
                    <td><span className="d-inline-block text-truncate" style={{ maxWidth: '100px' }}>{review.user_id}</span></td>
                    <td>{renderRatingStars(review.rating)}</td>
                    <td><span className="d-inline-block text-truncate" style={{ maxWidth: '200px' }}>{review.comment}</span></td>
                    <td>{new Date(review.created_at).toLocaleString()}</td>
                    <td>
                      <button type="button" className="btn btn-info btn-sm me-2" onClick={() => handleViewReview(review._id)}>
                        <i className="fas fa-eye"></i> Xem
                      </button>
                      <button type="button" className="btn btn-warning btn-sm me-2" onClick={() => handleEditReview(review._id)}>
                        <i className="fas fa-edit"></i> Sửa
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDeleteReview(review._id)}>
                        <i className="fas fa-trash"></i> Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};