export interface ComponentItem {
  _id: string;
  type: 'flash_sale' | 'best_selling' | 'new_arrival' | 'custom';
  title: string;
  description?: string;
  background_color: string;
  text_color: string;
  button_color: string;
  button_text_color: string;
  show_countdown: boolean;
  countdown_end?: Date;
  products: ComponentProduct[];
  position: 'home_top' | 'home_middle' | 'home_bottom';
  is_active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ComponentProduct {
  product_id: string;
  product_name: string;
  product_image: string;
  original_price: number;
  discount_price: number;
  sold_percentage: number;
  discount_percentage: number;
}

export interface ComponentApiResponse {
  success: boolean;
  message: string;
  data: ComponentItem[];
}
