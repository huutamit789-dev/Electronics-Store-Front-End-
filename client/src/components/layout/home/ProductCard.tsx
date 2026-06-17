import { Card, Typography, Tag } from 'antd';

interface ProductProps {
  name: string;
  price: string;
  discount: string;
}

export const ProductCard = ({ name, price, discount }: ProductProps) => (
  <Card 
    hoverable 
    cover={<div style={{ height: 150, background: '#f5f5f5' }}>📷</div>}
    style={{ borderRadius: '12px' }}
  >
    <Tag color="red">{discount}</Tag>
    <Typography.Paragraph ellipsis={{ rows: 2 }} style={{ marginTop: 10 }}>
      {name}
    </Typography.Paragraph>
    <Typography.Text strong style={{ color: '#d70018', fontSize: '16px' }}>
      {price}
    </Typography.Text>
  </Card>
);