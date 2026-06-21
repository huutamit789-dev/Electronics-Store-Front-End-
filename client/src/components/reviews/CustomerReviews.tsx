import React, { useEffect, useState, useCallback } from 'react';
import { Review } from '@/types/review';
import { reviewService } from '@/features/reviews/services/reviewService';

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <i key={i} className={`bi bi-star-fill ${i <= rating ? 'text-warning' : 'text-secondary'}`}></i>
    );
  }
  return <div className="star-rating mb-2">{stars}</div>;
};

const StarRatingInput: React.FC<{ rating: number; onRatingChange: (rating: number) => void }> = ({ rating, onRatingChange }) => {
  return (
    <div className="d-flex gap-2 mb-3">
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={`bi bi-star-fill fs-4 cursor-pointer ${star <= rating ? 'text-warning' : 'text-secondary'}`}
          style={{ cursor: 'pointer' }}
          onClick={() => onRatingChange(star)}
        ></i>
      ))}
    </div>
  );
};

const ReviewForm: React.FC<{ onReviewSubmitted: () => void }> = ({ onReviewSubmitted }) => {
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim()) {
      setError('Vui lòng nhập tên và nội dung đánh giá.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await reviewService.createReview({ author, rating, comment });
      setAuthor('');
      setRating(5);
      setComment('');
      onReviewSubmitted();
    } catch (err) {
      console.error('Failed to submit review:', err);
      setError('Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card rounded-4 p-4 border-light shadow-sm mb-4">
      <h5 className="fw-bold mb-3">Gửi đánh giá của bạn</h5>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label fw-semibold">Tên của bạn</label>
          <input
            type="text"
            className="form-control rounded-3"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Nhập tên của bạn"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold">Đánh giá sao</label>
          <StarRatingInput rating={rating} onRatingChange={setRating} />
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold">Nội dung đánh giá</label>
          <textarea
            className="form-control rounded-3"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn..."
            rows={3}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-danger w-100 rounded-3 fw-bold"
          disabled={submitting}
        >
          {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      </form>
    </div>
  );
};

export const CustomerReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reviewService.getAllReviews(1, 3);
      setReviews(response.data?.reviews || []);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setError('Không thể tải đánh giá của khách hàng.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleReviewSubmitted = () => {
    fetchReviews();
  };

  if (error) {
    return (
      <div className="mb-5">
        <h4 className="fw-bold mb-4">ĐÁNH GIÁ CỦA KHÁCH HÀNG</h4>
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mb-5 text-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-5">
      <h4 className="fw-bold mb-4">ĐÁNH GIÁ CỦA KHÁCH HÀNG</h4>

      <ReviewForm onReviewSubmitted={handleReviewSubmitted} />

      <div className="row g-4">
        {reviews.map(review => (
          <div className="col-md-4" key={review._id}>
            <div className="review-card h-100">
              <StarRating rating={review.rating} />
              <p className="small">"{review.comment}"</p>
              <div className="d-flex align-items-center mt-auto">
                <div className="bg-secondary text-white rounded-circle p-2 me-2" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {review.user_id ? review.user_id.substring(0, 2).toUpperCase() : 'KH'}
                </div>
                <small className="fw-bold">Khách hàng</small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};