export interface Category {
  _id: string;
  name: string;
  description?: string; // Thêm description nếu có thể có
  __v?: number; // Thêm __v nếu có thể có
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_url: string;
  images: string[]; // Mảng các ảnh sản phẩm
  specs?: {
    screen?: string;
    camera?: string;
    memory?: string;
    storage?: string;
    battery?: string;
    processor?: string;
    os?: string;
    weight?: string;
    dimensions?: string;
    other?: string[];
  };
  variants?: Array<{
    name: string;
    color?: string;
    storage?: string;
    price: number;
    stock_quantity: number;
    image_url?: string;
  }>;
  cate_id: string | Category; // Cập nhật để có thể là string hoặc Category object
  __v: number;
}

export interface ProductCategory {
  products: Product[];
}

export interface ProductApiResponse {
  success: boolean;
  message: string;
  data: {
      totalProducts: number;
    products?: Product[];
    categories?: ProductCategory[];
    total: number;
    totalPages: number;
    currentPage: number;
  };
}