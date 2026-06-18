import { Card, Col, Row, Typography } from 'antd';
import { Product } from '@/types/product';

const { Meta } = Card;

interface ProductListProps {
  products: Product[];
}

export const ProductList = ({ products }: ProductListProps) => {
  // Không còn sử dụng useProducts hook ở đây nữa, dữ liệu được truyền từ props

  if (!products || products.length === 0) {
    return (
      <div className="p-4 text-center">
        <Typography.Text>Không có sản phẩm nào để hiển thị.</Typography.Text>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Typography.Title level={2} className="mb-6 text-center">
        Sản phẩm nổi bật
      </Typography.Title>
      <Row gutter={[16, 16]}>
        {products.map((product: Product) => (
          <Col key={product._id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              cover={<img alt={product.name} src={product.image_url} className="h-48 object-cover" />}
              className="rounded-lg shadow-md"
            >
              <Meta
                title={product.name}
                description={`${product.price.toLocaleString()} VNĐ`}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};