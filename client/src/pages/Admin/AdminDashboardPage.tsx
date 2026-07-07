/**
 * @file AdminDashboardPage.tsx
 * @description Admin Dashboard component representing overview metrics (revenue, orders, users, low stock),
 * real-time interactive revenue charts, and top-performing products.
 */

import React, { useEffect, useState } from 'react';
import { dashboardService, DashboardStatsData } from '@/features/dashboard/services/dashboardService';
import { RevenueChart } from '@/components/admin/RevenueChart';
import toast, { Toaster } from 'react-hot-toast';

/**
 * @component AdminDashboardPage
 * @description The main administration dashboard page layout showing overview counters and statistics visualizers.
 */
export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * @function fetchDashboardData
   * @description Fetches all metrics and chart items from the backend dashboard service.
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getDashboardStats();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message || 'Lỗi khi tải dữ liệu thống kê');
        toast.error('Lỗi khi tải dữ liệu thống kê!');
      }
    } catch (err) {
      console.error('Lỗi fetch dashboard stats:', err);
      setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      toast.error('Không thể kết nối đến máy chủ!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /**
   * @function handleLogout
   * @description Clears credentials and redirects back to the login screen.
   */
  const handleLogout = () => {
    // Xóa token xác thực khỏi localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    // Chuyển hướng người dùng đến trang đăng nhập
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center py-5" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-secondary fw-semibold">Đang tổng hợp báo cáo kinh doanh thực tế...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card shadow-sm border-0 rounded-4 p-4 m-3 text-center bg-white">
        <i className="bi bi-exclamation-octagon text-danger fs-1 mb-3"></i>
        <h4 className="fw-bold text-gray-800">Đã xảy ra lỗi khi lấy số liệu</h4>
        <p className="text-secondary mb-4">{error || 'Không tìm thấy dữ liệu thống kê.'}</p>
        <button className="btn btn-danger px-4 py-2 rounded-3 fw-bold" onClick={fetchDashboardData}>
          Thử lại <i className="bi bi-arrow-clockwise ms-1"></i>
        </button>
      </div>
    );
  }

  const { stats, revenueChart, topProducts } = data;

  return (
    <>
      <Toaster position="top-right" />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 text-gray-800 fw-bold mb-1">Báo cáo kinh doanh</h1>
          <p className="text-muted small mb-0">Thống kê số liệu bán hàng và tình trạng vận hành kho thực tế</p>
        </div>
        <button onClick={handleLogout} className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 rounded-3 px-3 py-2 fw-semibold">
          <i className="bi bi-box-arrow-right"></i> Đăng xuất
        </button>
      </div>

      <div className="row g-3 mb-4">
        {/* Doanh thu tháng hiện tại */}
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 border-start border-danger border-4 shadow-sm h-100 py-2 rounded-4 bg-white">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-danger text-uppercase mb-1" style={{ fontSize: '0.75rem' }}>
                    Doanh thu (Tháng này)
                  </div>
                  <div className="h4 mb-0 font-weight-bold text-gray-800">
                    {stats.monthlyRevenue.toLocaleString()}đ
                  </div>
                  <div className="text-muted small mt-1">
                    Năm nay: {stats.yearlyRevenue.toLocaleString()}đ
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-cash-stack fs-1 text-danger-emphasisOpacity opacity-25"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Đơn hàng cần duyệt */}
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 border-start border-warning border-4 shadow-sm h-100 py-2 rounded-4 bg-white">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1" style={{ fontSize: '0.75rem' }}>
                    Đơn hàng chờ duyệt
                  </div>
                  <div className="h4 mb-0 font-weight-bold text-gray-800">
                    {stats.pendingOrders}
                  </div>
                  <div className="text-muted small mt-1">
                    Tổng đơn hàng: {stats.totalOrders}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-receipt fs-1 text-warning-emphasisOpacity opacity-25"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Người dùng đăng ký */}
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 border-start border-primary border-4 shadow-sm h-100 py-2 rounded-4 bg-white">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1" style={{ fontSize: '0.75rem' }}>
                    Tổng số khách hàng
                  </div>
                  <div className="h4 mb-0 font-weight-bold text-gray-800">
                    {stats.totalUsers}
                  </div>
                  <div className="text-muted small mt-1">
                    Tài khoản đang hoạt động
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-people fs-1 text-primary-emphasisOpacity opacity-25"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sản phẩm tồn kho thấp */}
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 border-start border-info border-4 shadow-sm h-100 py-2 rounded-4 bg-white">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1" style={{ fontSize: '0.75rem' }}>
                    Sản phẩm sắp hết hàng
                  </div>
                  <div className="h4 mb-0 font-weight-bold text-gray-800">
                    {stats.lowStockProducts}
                  </div>
                  <div className="text-muted small mt-1">
                    Tổng số mặt hàng: {stats.totalProducts}
                  </div>
                </div>
                <div className="col-auto">
                  <i className="bi bi-exclamation-triangle fs-1 text-info-emphasisOpacity opacity-25"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Biểu đồ doanh thu */}
        <div className="col-lg-7">
          <RevenueChart data={revenueChart} />
        </div>

        {/* Danh sách sản phẩm bán chạy */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 rounded-4 bg-white p-4 h-100">
            <h5 className="card-title fw-bold text-gray-800 mb-3">Top 5 sản phẩm bán chạy</h5>
            
            {topProducts.length > 0 ? (
              <div className="list-group list-group-flush">
                {topProducts.map((product, index) => (
                  <div key={product._id} className="list-group-item d-flex align-items-center justify-content-between py-3 px-0 border-0 border-bottom">
                    <div className="d-flex align-items-center gap-3">
                      <span className="badge bg-danger rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '22px', height: '22px', fontSize: '0.75rem' }}>
                        {index + 1}
                      </span>
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="rounded object-fit-contain bg-light p-1 border" 
                          style={{ width: '48px', height: '48px' }} 
                        />
                      ) : (
                        <div className="rounded bg-light border d-flex align-items-center justify-content-center text-secondary" style={{ width: '48px', height: '48px' }}>
                          <i className="bi bi-image"></i>
                        </div>
                      )}
                      <div>
                        <h6 className="mb-0 fw-semibold text-truncate text-gray-900" style={{ maxWidth: '170px' }}>
                          {product.name}
                        </h6>
                        <small className="text-muted d-block">{product.price.toLocaleString()}đ</small>
                      </div>
                    </div>
                    <div className="text-end">
                      <span className="badge bg-success-subtle text-success px-2 py-1 rounded-pill fw-bold" style={{ fontSize: '0.75rem' }}>
                        Đã bán: {product.soldQuantity}
                      </span>
                      <small className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>
                        Còn lại: {product.stock_quantity}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-inbox text-muted fs-2 mb-2 d-block"></i>
                <span className="text-muted small">Chưa có dữ liệu bán hàng.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};