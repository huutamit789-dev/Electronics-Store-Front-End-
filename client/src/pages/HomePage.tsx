// src/pages/HomePage.tsx
import { Card, Row, Col, Typography, Button } from 'antd';

const { Title, Paragraph } = Typography;

export const HomePage = () => {
  return (
    <div style={{ padding: '50px 0' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: 50 }}>
        <Title level={1}>Chào mừng đến với MyStore</Title>
        <Paragraph style={{ fontSize: 18 }}>
          Nơi cung cấp các sản phẩm điện tử chất lượng hàng đầu.
        </Paragraph>
        <Button type="primary" size="large">Xem sản phẩm</Button>
      </div>

      {/* Feature Grid */}
      <Row gutter={16}>
        <Col span={8}>
          <Card title="Chất lượng" bordered={false}>Sản phẩm chính hãng 100%</Card>
        </Col>
        <Col span={8}>
          <Card title="Giao hàng" bordered={false}>Giao hàng nhanh toàn quốc</Card>
        </Col>
        <Col span={8}>
          <Card title="Hỗ trợ" bordered={false}>Chăm sóc khách hàng 24/7</Card>
        </Col>
      </Row>
    </div>
  );
};