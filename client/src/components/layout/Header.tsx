import { Header } from 'antd/es/layout/layout';
import { Flex, Input, Typography } from 'antd';
import { Link } from 'react-router-dom';

export const CustomHeader = () => (
  <Header style={{ backgroundColor: '#d70018', height: 'auto', padding: '10px 50px' }}>
    <Flex align="center" gap={20}>
      <Typography.Title level={3} style={{ color: 'white', margin: 0, fontStyle: 'italic' }}>
        CellphoneS
      </Typography.Title>
      <Input.Search 
        placeholder="Bạn cần tìm gì?" 
        style={{ maxWidth: 400 }} 
        enterButton 
      />
      <Flex gap={15} style={{ color: 'white' }}>
        <span>Giỏ hàng</span>
        <Link to="/login" style={{ color: 'white' }}>Đăng nhập</Link>
      </Flex>
    </Flex>
  </Header>
);