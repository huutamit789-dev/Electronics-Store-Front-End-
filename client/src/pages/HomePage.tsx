import { Row, Col, Layout, Spin, Alert } from 'antd';
import { CustomHeader } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Banner } from '@/components/layout/home/Banner';
import { ProductList } from '@/features/products/components/ProductList';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Product } from '@/types/product';
import { productService } from '@/features/products/services/productService';
import { API_BASE_URL } from '@/config/constants';

const { Content } = Layout;

interface Category {
  _id: string;
  name: string;
  description: string;
  __v: number;
}

interface CategoryApiResponse {
  success: boolean;
  message: string;
  data: {
    categories: Category[];
  };
}

export const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const fetchProducts = useCallback(async (categoryId: string | null = null) => {
    setLoading(true);
    setError(null);
    try {
      const productsResponse = categoryId
        ? await productService.getProductByCategoryId(categoryId, 1, 10)
        : await productService.getAllProducts(1, 10);

      if (productsResponse?.success === false) {
        console.warn('Product fetch returned unsuccessful response', productsResponse);
        setProducts([]);
      } else {
        const fetchedProducts = productsResponse.data.products
          ?? productsResponse.data.categories?.flatMap(category => category.products)
          ?? [];

        setProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
      }
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setProducts([]);
      } else {
        setError('Failed to fetch products. Please try again later.');
        console.error('Error fetching products:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const categoriesResponse = await axios.get<CategoryApiResponse>(`${API_BASE_URL}/categories`);
      setCategories(categoriesResponse.data.data.categories);
    } catch (err) {
      setError('Failed to fetch categories. Please try again later.');
      console.error('Error fetching categories:', err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts(selectedCategoryId);
  }, [fetchProducts, selectedCategoryId]);

  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
  };

  if (loading) {
    return (
      <Layout>
        <CustomHeader />
        <Content style={{ maxWidth: 1200, margin: '0 auto', padding: '20px', textAlign: 'center' }}>
          <Spin size="large" tip="Loading products..." />
        </Content>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <CustomHeader />
        <Content style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
          <Alert message="Error" description={error} type="error" showIcon />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout>
      <CustomHeader />
      <Content style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
        <Row gutter={16}>
          <Col lg={4} className="hidden lg:block">
            <Sidebar
              categories={categories}
              onCategoryClick={handleCategoryClick}
              selectedCategoryId={selectedCategoryId}
            />
          </Col>

          <Col xs={24} lg={16}>
            <Banner />
          </Col>

          <Col lg={4} className="hidden lg:block" />
        </Row>

        <Row className="mt-8">
          <Col span={24}>
            <ProductList products={products} />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};
