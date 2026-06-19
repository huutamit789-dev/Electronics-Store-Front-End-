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

export const CustomerReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reviewService.getAllReviews(1, 3);
      setReviews(response.data.reviews);
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
      <div className="row g-4">
        {reviews.map(review => (
          <div className="col-md-4" key={review._id}>
            <div className="review-card h-100">
              <StarRating rating={review.rating} />
              <p className="small">"{review.comment}"</p>
              <div className="d-flex align-items-center mt-auto">
                <div className="bg-secondary text-white rounded-circle p-2 me-2" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {review.author.substring(0, 2).toUpperCase()}
                </div>
                <small className="fw-bold">{review.author}</small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};