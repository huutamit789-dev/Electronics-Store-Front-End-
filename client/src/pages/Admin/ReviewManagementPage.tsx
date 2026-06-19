import React, { useEffect, useState } from 'react';
import axiosClient from "@/api/axiosClient";

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

  // States cho các Modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // States cho dữ liệu
  const [currentReview, setCurrentReview] = useState<Review>({
    _id: '',
    product_id: '',
    user_id: '',
    rating: 0,
    comment: '',
    created_at: ''
  });
  const [editReview, setEditReview] = useState({ rating: 0, comment: '' });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get<ReviewApiResponse>('http://localhost:8090/api/reviews');
  console.log("review", response)
      setReviews(response.data.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReview = (reviewId: string) => {
    const review = reviews.find(r => r._id === reviewId);
    if (review) {
      setCurrentReview(review);
      setIsViewModalOpen(true);
    }
  };

  const handleEditReview = (reviewId: string) => {
    const review = reviews.find(r => r._id === reviewId);
    if (review) {
      setCurrentReview(review);
      setEditReview({ rating: review.rating, comment: review.comment });
      setIsEditModalOpen(true);
    }
  };

  const handleUpdate = async () => {
    try {
      await axiosClient.put(`http://localhost:8090/api/reviews/${currentReview._id}`, editReview);
      setIsEditModalOpen(false);
      fetchReviews();
    } catch (err) {
      console.error('Lỗi khi cập nhật đánh giá:', err);
      alert('Cập nhật đánh giá thất bại!');
    }
  };

  const confirmDeleteReview = (reviewId: string) => {
    const review = reviews.find(r => r._id === reviewId);
    if (review) {
      setCurrentReview(review);
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteReview = async () => {
    try {
      await axiosClient.delete(`http://localhost:8090/api/reviews/${currentReview._id}`);
      setIsDeleteModalOpen(false);
      fetchReviews();
    } catch (err) {
      console.error('Lỗi khi xóa đánh giá:', err);
      alert('Xóa đánh giá thất bại!');
    }
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
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => confirmDeleteReview(review._id)}>
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

      {/* MODAL XEM CHI TIẾT */}
      {isViewModalOpen && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog"><div className="modal-content">
            <div className="modal-header"><h5 className="modal-title">Chi tiết đánh giá</h5></div>
            <div className="modal-body">
              <p><strong>ID Đánh giá:</strong> {currentReview._id}</p>
              <p><strong>ID Sản phẩm:</strong> {currentReview.product_id}</p>
              <p><strong>ID Người dùng:</strong> {currentReview.user_id}</p>
              <p><strong>Điểm đánh giá:</strong> {renderRatingStars(currentReview.rating)}</p>
              <p><strong>Bình luận:</strong> {currentReview.comment}</p>
              <p><strong>Ngày tạo:</strong> {new Date(currentReview.created_at).toLocaleString()}</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsViewModalOpen(false)}>Đóng</button>
            </div>
          </div></div>
        </div>
      )}

      {/* MODAL SỬA */}
      {isEditModalOpen && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog"><div className="modal-content">
            <div className="modal-header"><h5 className="modal-title">Chỉnh sửa đánh giá</h5></div>
            <div className="modal-body">
              <div className="mb-3">
                <label>Điểm đánh giá (1-5):</label>
                <input className="form-control" type="number" min="1" max="5" value={editReview.rating} onChange={(e) => setEditReview({...editReview, rating: Number(e.target.value)})} />
              </div>
              <div className="mb-3">
                <label>Bình luận:</label>
                <textarea className="form-control" value={editReview.comment} onChange={(e) => setEditReview({...editReview, comment: e.target.value})} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleUpdate}>Lưu thay đổi</button>
            </div>
          </div></div>
        </div>
      )}

      {/* MODAL XÓA */}
      {isDeleteModalOpen && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog"><div className="modal-content">
            <div className="modal-header"><h5 className="modal-title">Xác nhận xóa</h5></div>
            <div className="modal-body">Bạn có chắc chắn muốn xóa đánh giá này không?</div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Hủy</button>
              <button className="btn btn-danger" onClick={handleDeleteReview}>Xóa</button>
            </div>
          </div></div>
        </div>
      )}
    </>
  );
};