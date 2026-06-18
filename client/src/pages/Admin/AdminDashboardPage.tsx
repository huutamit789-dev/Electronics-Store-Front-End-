import React from 'react';
// Không cần import AdminLayout ở đây nữa vì nó đã được bọc ở AppRoutes

export const AdminDashboardPage: React.FC = () => {
  return (
    // Chỉ giữ lại phần nội dung chính của dashboard, bỏ AdminLayout bọc ngoài
    <>
      <h1 className="h3 mb-4 text-gray-800">Dashboard</h1>

      <div className="row">
        {/* Earnings (Monthly) Card Example */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Tổng doanh thu (Tháng)
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">$40,000</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-calendar fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings (Annual) Card Example */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Đơn hàng mới
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">215</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Card Example */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Người dùng mới
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">50</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-clipboard-list fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Requests Card Example */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Sản phẩm tồn kho
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">18</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-comments fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Biểu đồ doanh thu</h6>
            </div>
            <div className="card-body">
              <p>Placeholder cho biểu đồ doanh thu.</p>
            </div>
          </div>
        </div>

        <div className="col-lg-6 mb-4">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Sản phẩm bán chạy</h6>
            </div>
            <div className="card-body">
              <p>Placeholder cho danh sách sản phẩm bán chạy.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};