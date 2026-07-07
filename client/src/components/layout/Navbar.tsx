import { Layout, Menu, Button } from 'antd';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const { Header } = Layout;

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { key: '1', label: <Link to="/">Trang chủ</Link> },
    { key: '2', label: <Link to="/login">Đăng nhập</Link> },
    { key: '3', label: <Link to="/register">Đăng ký</Link> },
  ];

  return (
    <Header style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: '0 20px' }}>
      <div className="logo" style={{ marginRight: '20px', fontWeight: 'bold', fontSize: '1.2rem' }}>MyStore</div>
      
      {/* Desktop Menu */}
      <div className="d-none d-md-block" style={{ flex: 1 }}>
        <Menu mode="horizontal" defaultSelectedKeys={['1']} items={menuItems} style={{ border: 'none' }} />
      </div>

      {/* Mobile Menu Button */}
      <Button
        className="d-md-none"
        type="text"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        style={{ marginLeft: 'auto' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {mobileMenuOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M3 12h18M3 6h18M3 18h18" />
          )}
        </svg>
      </Button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="d-md-none position-absolute"
          style={{
            top: '64px',
            left: 0,
            right: 0,
            background: '#fff',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 1000
          }}
        >
          <Menu mode="vertical" defaultSelectedKeys={['1']} items={menuItems} style={{ border: 'none' }} />
        </div>
      )}
    </Header>
  );
};