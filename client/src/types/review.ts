export interface Review {
  _id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewApiResponse {
  success: boolean;
  message: string;
  data: {
    reviews: Review[];
    totalReviews?: number;
    currentPage?: number;
    totalPages?: number;
  };
}