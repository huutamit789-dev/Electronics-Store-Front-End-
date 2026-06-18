import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/productService';

export const useProducts = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['products', page, limit],
    queryFn: () => productService.getAllProducts(page, limit)
  });
};
