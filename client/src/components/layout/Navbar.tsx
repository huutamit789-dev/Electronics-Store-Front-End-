import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
    <Layout.Header style={{ display: 'flex', alignItems: 'center', background: '#fff' }}>
      <div className="logo" style={{ marginRight: '20px', fontWeight: 'bold' }}>MyStore</div>
      <Menu mode="horizontal" defaultSelectedKeys={['1']}>
        <Menu.Item key="1"><Link to="/">Trang chủ</Link></Menu.Item>
        <Menu.Item key="2"><Link to="/login">Đăng nhập</Link></Menu.Item>
        <Menu.Item key="3"><Link to="/register">Đăng ký</Link></Menu.Item>
      </Menu>
    </Layout.Header>
  );
};