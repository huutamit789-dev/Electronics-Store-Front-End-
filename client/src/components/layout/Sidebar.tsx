import { Menu } from 'antd';
import { MobileOutlined, LaptopOutlined, CustomerServiceOutlined } from '@ant-design/icons';

export const Sidebar = () => {
  const items = [
    { key: '1', icon: <MobileOutlined />, label: 'Điện thoại, Tablet' },
    { key: '2', icon: <LaptopOutlined />, label: 'Laptop' },
    { key: '3', icon: <CustomerServiceOutlined />, label: 'Âm thanh' },
  ];

  return <Menu mode="vertical" items={items} style={{ borderRight: 0 }} />;
};