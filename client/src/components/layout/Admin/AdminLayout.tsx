import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useLogout } from '@/features/auth/hooks/useAuth';
import {useCartStore} from "@/store/useCartStore";

interface AdminLayoutProps {
  // Khi AdminLayout được dùng làm layout route, nó không nhận children trực tiếp
  // mà sẽ render Outlet để hiển thị các route con
}

export const AdminLayout: React.FC<AdminLayoutProps> = () => {
  const [sidebarToggled, setSidebarToggled] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { logout } = useLogout();
  const navigate = useNavigate();

  // Hàm để toggle sidebar
  const handleToggleSidebar = () => {
    setSidebarToggled(!sidebarToggled);
  };

  // Hàm để toggle mobile sidebar
  const handleMobileSidebarToggle = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    logout();
    useCartStore.getState().clearCart();
  };

  // Thêm/bỏ class 'toggled' vào body để điều khiển sidebar
  useEffect(() => {
    if (sidebarToggled) {
      document.body.classList.add('sb-sidenav-toggled');
    } else {
      document.body.classList.remove('sb-sidenav-toggled');
    }
  }, [sidebarToggled]);

  return (
    <div id="wrapper">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="position-fixed d-md-none"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1040
          }}
          onClick={handleMobileSidebarToggle}
        ></div>
      )}

      {/* Sidebar */}
      <ul className={`navbar-nav bg-gradient-primary sidebar sidebar-dark accordion ${sidebarToggled ? 'toggled' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`} id="accordionSidebar" style={{ zIndex: mobileSidebarOpen ? 1050 : 'auto' }}>
        {/* Sidebar - Brand */}
        <Link className="sidebar-brand d-flex align-items-center justify-content-center" to="/admin/dashboard">
          <div className="sidebar-brand-icon rotate-n-15">
            <i className="fas fa-laugh-wink"></i>
          </div>
          <div className="sidebar-brand-text mx-3">SB Admin <sup>2</sup></div>
        </Link>

        {/* Divider */}
        <hr className="sidebar-divider my-0" />

        {/* Nav Item - Dashboard */}
        <li className="nav-item active">
          <Link className="nav-link" to="/admin/dashboard">
            <i className="fas fa-fw fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </Link>
        </li>

        {/* Divider */}
        <hr className="sidebar-divider" />

        {/* Heading */}
        <div className="sidebar-heading">
          Quản lý
        </div>

        {/* Nav Item - Sản phẩm */}
        <li className="nav-item">
          <Link className="nav-link" to="/admin/products">
            <i className="fas fa-fw fa-boxes"></i> {/* Icon cho Sản phẩm */}
            <span>Sản phẩm</span>
          </Link>
        </li>

        {/* Nav Item - Danh mục */}
        <li className="nav-item">
          <Link className="nav-link" to="/admin/categories">
            <i className="fas fa-fw fa-tags"></i> {/* Icon cho Danh mục */}
            <span>Danh mục</span>
          </Link>
        </li>

        {/* Nav Item - Người dùng */}
        <li className="nav-item">
          <Link className="nav-link" to="/admin/users">
            <i className="fas fa-fw fa-users"></i> {/* Icon cho Người dùng */}
            <span>Người dùng</span>
          </Link>
        </li>

        {/* Divider */}
        <hr className="sidebar-divider" />

        {/* Heading */}
        <div className="sidebar-heading">
          Hệ thống
        </div>

        {/* Nav Item - Banner */}
        <li className="nav-item">
          <Link className="nav-link" to="/admin/banners">
            <i className="fas fa-fw fa-image"></i> {/* Icon cho Banner */}
            <span>Banner</span>
          </Link>
        </li>

        {/* Nav Item - Footer */}
        <li className="nav-item">
          <Link className="nav-link" to="/admin/footers">
            <i className="fas fa-fw fa-shoe-prints"></i> {/* Icon cho Footer */}
            <span>Footer</span>
          </Link>
        </li>

        {/* Nav Item - Component */}
        <li className="nav-item">
          <Link className="nav-link" to="/admin/components">
            <i className="fas fa-fw fa-puzzle-piece"></i> {/* Icon cho Component */}
            <span>Component</span>
          </Link>
        </li>

        {/* Nav Item - Đơn hàng */}
        <li className="nav-item">
          <Link className="nav-link" to="/admin/orders">
            <i className="fas fa-fw fa-clipboard-list"></i> {/* Icon cho Đơn hàng */}
            <span>Đơn hàng</span>
          </Link>
        </li>

        {/* Nav Item - Đánh giá */}
        <li className="nav-item">
          <Link className="nav-link" to="/admin/reviews">
            <i className="fas fa-fw fa-star"></i> {/* Icon cho Đánh giá */}
            <span>Đánh giá</span>
          </Link>
        </li>

        {/* Nav Item - Thanh toán */}
        <li className="nav-item">
          <Link className="nav-link" to="/admin/payments">
            <i className="fas fa-fw fa-credit-card"></i> {/* Icon cho Thanh toán */}
            <span>Thanh toán</span>
          </Link>
        </li>

        {/* Nav Item - Lịch sử ĐH */}
        <li className="nav-item">
          <Link className="nav-link" to="/admin/order-history">
            <i className="fas fa-fw fa-history"></i> {/* Icon cho Lịch sử ĐH */}
            <span>Lịch sử ĐH</span>
          </Link>
        </li>

        {/* Nav Item - Mã giảm giá */}
        <li className="nav-item">
          <Link className="nav-link" to="/admin/coupons">
            <i className="fas fa-fw fa-tag"></i>
            <span>Mã giảm giá</span>
          </Link>
        </li>

        {/* Divider */}
        <hr className="sidebar-divider" />

        {/* Nav Item - Logout (New position) */}
        <li className="nav-item">
          <a className="nav-link" href="#" onClick={handleLogout}>
            <i className="fas fa-fw fa-sign-out-alt"></i>
            <span>Đăng xuất</span>
          </a>
        </li>

        {/* Divider */}
        <hr className="sidebar-divider d-none d-md-block" />
        <div className="text-center d-none d-md-inline">
          <button className="rounded-circle border-0" id="sidebarToggle" onClick={handleToggleSidebar}></button>
        </div>

        {/* Mobile Close Button */}
        <div className="text-center d-md-none mt-3 mb-2">
          <button className="btn btn-sm btn-light text-primary fw-bold" onClick={handleMobileSidebarToggle}>
            <i className="fas fa-times me-2"></i>Đóng menu
          </button>
        </div>
      </ul>
      <div id="content-wrapper" className="d-flex flex-column">
        {/* Main Content */}
        <div id="content">
          <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
            <button id="sidebarToggleTop" className="btn btn-link d-md-none rounded-circle mr-3" onClick={handleMobileSidebarToggle}>
              <i className="fa fa-bars"></i>
            </button>
            <ul className="navbar-nav ml-auto flex-wrap">
              {/* Nav Item - Search Dropdown (Visible Only XS) */}
              <li className="nav-item dropdown no-arrow d-sm-none">
                <a className="nav-link dropdown-toggle" href="#" id="searchDropdown" role="button"
                  data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <i className="fas fa-search fa-fw"></i>
                </a>
                {/* Dropdown - Messages */}
                <div className="dropdown-menu dropdown-menu-right p-3 shadow animated--grow-in"
                  aria-labelledby="searchDropdown">
                  <form className="form-inline mr-auto w-100 navbar-search">
                    <div className="input-group">
                      <input type="text" className="form-control bg-light border-0 small"
                        placeholder="Search for..." aria-label="Search"
                        aria-describedby="basic-addon2" />
                      <div className="input-group-append">
                        <button className="btn btn-primary" type="button">
                          <i className="fas fa-search fa-sm"></i>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </li>

              {/* Nav Item - Alerts */}
              <li className="nav-item dropdown no-arrow mx-1">
                <a className="nav-link dropdown-toggle" href="#" id="alertsDropdown" role="button"
                  data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <i className="fas fa-bell fa-fw"></i>
                  {/* Counter - Alerts */}
                  <span className="badge badge-danger badge-counter">3+</span>
                </a>
                {/* Dropdown - Alerts */}
                <div className="dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in"
                  aria-labelledby="alertsDropdown">
                  <h6 className="dropdown-header">
                    Alerts Center
                  </h6>
                  <a className="dropdown-item d-flex align-items-center" href="#">
                    <div className="mr-3">
                      <div className="icon-circle bg-primary">
                        <i className="fas fa-file-alt text-white"></i>
                      </div>
                    </div>
                    <div>
                      <div className="small text-gray-500">December 12, 2019</div>
                      <span className="font-weight-bold">A new monthly report is ready to download!</span>
                    </div>
                  </a>
                  <a className="dropdown-item text-center small text-gray-500" href="#">Show All Alerts</a>
                </div>
              </li>

              {/* Nav Item - Messages */}
              <li className="nav-item dropdown no-arrow mx-1">
                <a className="nav-link dropdown-toggle" href="#" id="messagesDropdown" role="button"
                  data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <i className="fas fa-envelope fa-fw"></i>
                  {/* Counter - Messages */}
                  <span className="badge badge-danger badge-counter">7</span>
                </a>
                {/* Dropdown - Messages */}
                <div className="dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in"
                  aria-labelledby="messagesDropdown">
                  <h6 className="dropdown-header">
                    Message Center
                  </h6>
                  <a className="dropdown-item d-flex align-items-center" href="#">
                    <div className="dropdown-list-image mr-3">
                      <img className="rounded-circle" src="img/undraw_profile_1.svg"
                        alt="..." />
                      <div className="status-indicator bg-success"></div>
                    </div>
                    <div className="font-weight-bold">
                      <div className="text-truncate">Hi there! I am wondering if you can help me with a
                        problem I've been having.</div>
                      <div className="small text-gray-500">Emily Fowler · 58m</div>
                    </div>
                  </a>
                  <a className="dropdown-item text-center small text-gray-500" href="#">Read More Messages</a>
                </div>
              </li>

              <div className="topbar-divider d-none d-sm-block"></div>

              {/* Nav Item - User Information */}
              <li className="nav-item dropdown no-arrow">
                <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button"
                  data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <span className="mr-2 d-none d-lg-inline text-gray-600 small">Admin</span>
                  <img className="img-profile rounded-circle"
                    src="img/undraw_profile.svg" />
                </a>
                {/* Dropdown - User Information */}
                <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in"
                  aria-labelledby="userDropdown">
                  <a className="dropdown-item" href="#">
                    <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
                    Profile
                  </a>
                  <a className="dropdown-item" href="#">
                    <i className="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400"></i>
                    Settings
                  </a>
                  <a className="dropdown-item" href="#">
                    <i className="fas fa-list fa-sm fa-fw mr-2 text-gray-400"></i>
                    Activity Log
                  </a>
                  <div className="dropdown-divider"></div>
                  {/* Removed Logout from here */}
                </div>
              </li>
            </ul>
          </nav>
          <div className="container-fluid">
            <Outlet /> {/* Đây là nơi các route con sẽ được render */}
          </div>
        </div>
        <footer className="sticky-footer bg-white">
          <div className="container my-auto">
            <div className="copyright text-center my-auto">
              <span>Copyright &copy; Your Website 2021</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};