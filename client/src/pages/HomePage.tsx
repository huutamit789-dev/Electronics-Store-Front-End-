import { Row, Col, Layout } from 'antd';
import { CustomHeader } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Banner } from '@/components/layout/home/Banner';

const { Content } = Layout;

export const HomePage = () => {
  return (
    <Layout>
      <CustomHeader />
      <Content style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
        <Row gutter={16}>
          {/* Sidebar ẩn trên mobile */}
          <Col lg={4} className="hidden lg:block">
            <Sidebar />
          </Col>
          
          {/* Main Content */}
          <Col xs={24} lg={16}>
            <Banner />
          </Col>
          
          {/* Right Promotion */}
          <Col lg={4} className="hidden lg:block">
            {/* Nội dung quảng cáo ở đây */}
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};