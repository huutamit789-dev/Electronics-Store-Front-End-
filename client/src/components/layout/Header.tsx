import { Layout, Input, Flex, Typography } from 'antd';

const { Header } = Layout;

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
        <span>Đăng nhập</span>
      </Flex>
    </Flex>
  </Header>
);