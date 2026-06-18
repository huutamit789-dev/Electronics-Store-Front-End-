export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_url: string;
  cate_id: string;
  __v: number;
}

export interface ProductCategory {
  products: Product[];
}

export interface ProductApiResponse {
  success: boolean;
  message: string;
  data: {
    products?: Product[];
    categories?: ProductCategory[];
    total: number;
    totalPages: number;
    currentPage: number;
  };
}
