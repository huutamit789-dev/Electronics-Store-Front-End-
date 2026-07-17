import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { transactionService, AccountInfo, Transaction } from '@/features/transactions/services/transactionService';
import { formatVND } from '@/lib/formatters';
import { useAuthStore } from '@/store/useAuthStore';

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuthStore();
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDescription, setDepositDescription] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
      return;
    }
    loadAccountInfo();
    loadTransactionHistory(1);
  }, [isLoggedIn, navigate]);

  const loadAccountInfo = async () => {
    try {
      const response = await transactionService.getAccountInfo();
      if (response.success) {
        setAccountInfo(response.data);
      }
    } catch (error) {
      console.error('Failed to load account info:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactionHistory = async (page: number) => {
    try {
      const response = await transactionService.getTransactionHistory(page, 10);
      if (response.success) {
        setTransactions(response.data.transactions);
        setTotalPages(response.data.pagination.total_pages);
        setCurrentPage(response.data.pagination.current_page);
      }
    } catch (error) {
      console.error('Failed to load transaction history:', error);
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    setDepositing(true);
    try {
      const response = await transactionService.depositMoney(amount, depositDescription || 'Nạp tiền vào tài khoản');
      if (response.success) {
        alert('Nạp tiền thành công!');
        setShowDepositModal(false);
        setDepositAmount('');
        setDepositDescription('');
        loadAccountInfo();
        loadTransactionHistory(1);
      } else {
        alert('Nạp tiền thất bại: ' + response.message);
      }
    } catch (error: any) {
      alert('Nạp tiền thất bại: ' + (error.response?.data?.message || error.message));
    } finally {
      setDepositing(false);
    }
  };

  const getVipBadgeColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'bg-warning text-dark';
      case 'silver': return 'bg-secondary';
      case 'gold': return 'bg-warning';
      case 'platinum': return 'bg-info text-dark';
      case 'diamond': return 'bg-primary';
      default: return 'bg-secondary';
    }
  };

  const getVipLabel = (level: string) => {
    switch (level) {
      case 'bronze': return 'Đồng';
      case 'silver': return 'Bạc';
      case 'gold': return 'Vàng';
      case 'platinum': return 'Bạch Kim';
      case 'diamond': return 'Kim Cương';
      default: return level;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit': return 'Nạp tiền';
      case 'purchase': return 'Mua hàng';
      case 'refund': return 'Hoàn tiền';
      default: return type;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'text-success';
      case 'purchase': return 'text-danger';
      case 'refund': return 'text-info';
      default: return 'text-secondary';
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-light justify-content-center align-items-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <button 
              onClick={() => navigate('/')}
              className="btn btn-primary d-flex align-items-center gap-2"
            >
              <i className="bi bi-arrow-left"></i>
              Về trang chủ
            </button>
            <h2 className="mb-0">Tài khoản của tôi</h2>
          </div>
        </div>
      </div>

      {/* Account Info Card */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Thông tin tài khoản</h5>
              <div className="mb-3">
                <label className="text-muted small">Tên đăng nhập</label>
                <div className="fs-5 fw-semibold">{accountInfo?.username || user?.username}</div>
              </div>
              <div className="mb-3">
                <label className="text-muted small">Số dư tài khoản</label>
                <div className="fs-3 fw-bold text-danger">
                  {formatVND(accountInfo?.balance || 0)}
                </div>
              </div>
              <button 
                className="btn btn-danger w-100"
                onClick={() => setShowDepositModal(true)}
              >
                <i className="bi bi-plus-circle me-2"></i>Nạp tiền
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Hạng VIP</h5>
              <div className="d-flex align-items-center gap-3 mb-3">
                <span className={`badge fs-5 ${getVipBadgeColor(accountInfo?.vip_level || 'bronze')}`}>
                  {getVipLabel(accountInfo?.vip_level || 'bronze')}
                </span>
                <div className="small text-muted">
                  Giảm giá: {(accountInfo?.discount_percentage || 0) * 100}%
                </div>
              </div>
              <div className="mb-3">
                <label className="text-muted small">Tổng chi tiêu</label>
                <div className="fs-5 fw-semibold text-primary">
                  {formatVND(accountInfo?.total_spent || 0)}
                </div>
              </div>
              {accountInfo?.next_level && (
                <div>
                  <label className="text-muted small">Cần thêm để lên {getVipLabel(accountInfo.next_level)}</label>
                  <div className="progress mt-1" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar bg-warning" 
                      style={{ 
                        width: `${Math.min(100, ((accountInfo.total_spent || 0) / (accountInfo.total_spent + accountInfo.amount_to_next_level)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <small className="text-muted">
                    {formatVND(accountInfo.amount_to_next_level)}
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">Lịch sử giao dịch</h5>
              
              {transactions.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-receipt fs-1 mb-3"></i>
                  <p>Chưa có giao dịch nào</p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Loại giao dịch</th>
                          <th>Số tiền</th>
                          <th>Số dư trước</th>
                          <th>Số dư sau</th>
                          <th>Mô tả</th>
                          <th>Thời gian</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((transaction) => (
                          <tr key={transaction._id}>
                            <td>
                              <span className={`badge ${getTransactionTypeColor(transaction.type)}`}>
                                {getTransactionTypeLabel(transaction.type)}
                              </span>
                            </td>
                            <td className={getTransactionTypeColor(transaction.type)}>
                              <strong>
                                {transaction.type === 'deposit' || transaction.type === 'refund' ? '+' : '-'}
                                {formatVND(transaction.amount)}
                              </strong>
                            </td>
                            <td className="text-muted">{formatVND(transaction.balance_before)}</td>
                            <td className="fw-semibold">{formatVND(transaction.balance_after)}</td>
                            <td className="text-muted small">{transaction.description}</td>
                            <td className="text-muted small">
                              {new Date(transaction.created_at).toLocaleString('vi-VN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <nav className="mt-4">
                      <ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => loadTransactionHistory(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Trước
                          </button>
                        </li>
                        {[...Array(totalPages)].map((_, index) => (
                          <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => loadTransactionHistory(index + 1)}
                            >
                              {index + 1}
                            </button>
                          </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => loadTransactionHistory(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            Sau
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nạp tiền vào tài khoản</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowDepositModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="mb-3">Thông tin chuyển khoản</h6>
                    <div className="card bg-light mb-3">
                      <div className="card-body">
                        <div className="mb-2">
                          <label className="small text-muted">Ngân hàng</label>
                          <div className="fw-semibold">MB Bank (Quân đội)</div>
                        </div>
                        <div className="mb-2">
                          <label className="small text-muted">Số tài khoản</label>
                          <div className="fw-semibold text-primary fs-5">123456789</div>
                        </div>
                        <div className="mb-2">
                          <label className="small text-muted">Chủ tài khoản</label>
                          <div className="fw-semibold">HUU TAM IT</div>
                        </div>
                        <div className="mb-2">
                          <label className="small text-muted">Nội dung chuyển khoản</label>
                          <div className="fw-semibold text-danger" id="transfer-content">
                            NAP {user?.username?.toUpperCase() || 'USER'}
                          </div>
                        </div>
                        <button 
                          className="btn btn-sm btn-outline-primary mt-2"
                          onClick={() => {
                            const content = document.getElementById('transfer-content')?.textContent;
                            if (content) {
                              navigator.clipboard.writeText(content);
                              alert('Đã sao chép nội dung chuyển khoản!');
                            }
                          }}
                        >
                          <i className="bi bi-clipboard me-1"></i>Sao chép nội dung
                        </button>
                      </div>
                    </div>
                    <div className="alert alert-warning small">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Sau khi chuyển khoản, vui lòng nhập số tiền đã chuyển bên dưới để hệ thống ghi nhận.
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6 className="mb-3">Xác nhận nạp tiền</h6>
                    <div className="mb-3">
                      <label className="form-label">Số tiền đã chuyển (VNĐ) <span className="text-danger">*</span></label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="Nhập số tiền đã chuyển"
                        min="1000"
                        step="1000"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Ghi chú (tùy chọn)</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={depositDescription}
                        onChange={(e) => setDepositDescription(e.target.value)}
                        placeholder="Mã giao dịch ngân hàng hoặc ghi chú khác"
                      />
                    </div>
                    <div className="alert alert-info small">
                      <i className="bi bi-info-circle me-2"></i>
                      Số tiền sẽ được cộng vào tài khoản sau khi admin xác nhận giao dịch.
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowDepositModal(false)}
                >
                  Hủy
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleDeposit}
                  disabled={depositing || !depositAmount}
                >
                  {depositing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    'Xác nhận nạp tiền'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
