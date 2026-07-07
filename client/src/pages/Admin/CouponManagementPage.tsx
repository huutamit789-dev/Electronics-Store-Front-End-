/**
 * @file CouponManagementPage.tsx
 * @description Admin page for managing discount coupons.
 * Allows administrators to view all existing coupons, create new coupon codes,
 * and delete coupons that are no longer needed.
 */

import React, { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/api/axiosClient';
import toast, { Toaster } from 'react-hot-toast';

// ----- TYPE DEFINITIONS -----

interface Coupon {
  _id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_discount_amount: number | null;
  expiration_date: string;
  max_uses: number | null;
  uses_count: number;
  is_active: boolean;
  created_at: string;
}

interface CreateCouponForm {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number | '';
  min_order_value: number | '';
  max_discount_amount: number | '';
  expiration_date: string;
  max_uses: number | '';
}

const initialForm: CreateCouponForm = {
  code: '',
  discount_type: 'percentage',
  discount_value: '',
  min_order_value: '',
  max_discount_amount: '',
  expiration_date: '',
  max_uses: ''
};

/**
 * @component CouponManagementPage
 * @description Main admin panel for listing, creating, and removing discount codes.
 */
export const CouponManagementPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateCouponForm>(initialForm);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ----- DATA FETCHING -----

  /**
   * @function fetchCoupons
   * @description Fetches the full list of coupons from the backend.
   */
  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/coupons');
      if (res.data?.success) {
        setCoupons(res.data.data || []);
      } else {
        toast.error('Lỗi khi tải danh sách mã giảm giá');
      }
    } catch (err: any) {
      console.error('Fetch coupons error:', err);
      toast.error(err.response?.data?.message || 'Không thể tải danh sách mã giảm giá');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // ----- FORM HANDLERS -----

  /**
   * @function handleFormChange
   * @description Updates a single form field value.
   */
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  /**
   * @function handleCreate
   * @description Submits the create coupon form to the backend API.
   * Validates required fields, formats the payload, and refreshes the list on success.
   */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.discount_value || !form.expiration_date) {
      toast.error('Vui lòng điền đầy đủ: Mã, Giá trị giảm, và Ngày hết hạn');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_order_value: form.min_order_value !== '' ? Number(form.min_order_value) : 0,
        max_discount_amount: form.max_discount_amount !== '' ? Number(form.max_discount_amount) : null,
        expiration_date: new Date(form.expiration_date).toISOString(),
        max_uses: form.max_uses !== '' ? Number(form.max_uses) : null
      };

      const res = await axiosClient.post('/coupons', payload);
      if (res.data?.success) {
        toast.success(`Tạo mã ${payload.code} thành công!`);
        setForm(initialForm);
        setShowForm(false);
        fetchCoupons();
      } else {
        toast.error(res.data?.message || 'Lỗi khi tạo mã giảm giá');
      }
    } catch (err: any) {
      console.error('Create coupon error:', err);
      toast.error(err.response?.data?.message || 'Lỗi khi tạo mã giảm giá');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * @function handleDelete
   * @description Sends a DELETE request for a specific coupon by ID.
   * @param {string} id - The coupon's MongoDB ObjectId.
   * @param {string} code - Coupon code string for display in success message.
   */
  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa mã giảm giá "${code}" không?`)) return;

    setDeletingId(id);
    try {
      const res = await axiosClient.delete(`/coupons/${id}`);
      if (res.data?.success) {
        toast.success(`Đã xóa mã ${code}`);
        setCoupons(prev => prev.filter(c => c._id !== id));
      } else {
        toast.error('Lỗi khi xóa mã giảm giá');
      }
    } catch (err: any) {
      console.error('Delete coupon error:', err);
      toast.error(err.response?.data?.message || 'Lỗi khi xóa mã giảm giá');
    } finally {
      setDeletingId(null);
    }
  };

  // ----- HELPERS -----

  /**
   * @function isExpired
   * @description Checks if a coupon's expiration date is in the past.
   * @param {string} dateStr - ISO date string.
   * @returns {boolean} True if the coupon has expired.
   */
  const isExpired = (dateStr: string) => new Date(dateStr) < new Date();

  const statusBadge = (coupon: Coupon) => {
    if (!coupon.is_active) return <span className="badge bg-secondary">Vô hiệu hóa</span>;
    if (isExpired(coupon.expiration_date)) return <span className="badge bg-danger">Hết hạn</span>;
    if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) return <span className="badge bg-warning text-dark">Hết lượt</span>;
    return <span className="badge bg-success">Hoạt động</span>;
  };

  // ----- RENDER -----

  return (
    <div className="container-fluid py-4">
      <Toaster position="top-right" />

      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-gray-800 mb-0 fs-4">
            <i className="bi bi-ticket-perforated-fill text-danger me-2"></i>
            Quản lý Mã giảm giá
          </h2>
          <p className="text-secondary small mt-1 mb-0">Tạo, xem và quản lý tất cả mã khuyến mãi trong hệ thống.</p>
        </div>
        <button
          className="btn btn-danger rounded-3 fw-bold px-4 py-2 shadow-sm d-flex align-items-center gap-2"
          onClick={() => { setShowForm(prev => !prev); setForm(initialForm); }}
        >
          <i className={`bi ${showForm ? 'bi-x-circle' : 'bi-plus-circle-fill'}`}></i>
          {showForm ? 'Hủy' : 'Tạo mã mới'}
        </button>
      </div>

      {/* Create Coupon Form */}
      {showForm && (
        <div className="card border-0 rounded-4 shadow-sm mb-4 overflow-hidden">
          <div className="card-header bg-danger text-white fw-bold py-3 ps-4">
            <i className="bi bi-plus-circle me-2"></i> Tạo mã giảm giá mới
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleCreate}>
              <div className="row g-3">
                {/* Mã coupon */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold small text-secondary">Mã giảm giá *</label>
                  <input
                    type="text"
                    name="code"
                    value={form.code}
                    onChange={handleFormChange}
                    className="form-control rounded-3 text-uppercase fw-bold"
                    placeholder="VD: SUMMER20"
                    required
                  />
                </div>

                {/* Loại giảm */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold small text-secondary">Loại giảm giá *</label>
                  <select
                    name="discount_type"
                    value={form.discount_type}
                    onChange={handleFormChange}
                    className="form-select rounded-3"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>

                {/* Giá trị giảm */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold small text-secondary">
                    Giá trị giảm * {form.discount_type === 'percentage' ? '(%)' : '(VNĐ)'}
                  </label>
                  <input
                    type="number"
                    name="discount_value"
                    value={form.discount_value}
                    onChange={handleFormChange}
                    className="form-control rounded-3"
                    placeholder={form.discount_type === 'percentage' ? 'VD: 10' : 'VD: 50000'}
                    min="1"
                    required
                  />
                </div>

                {/* Giá trị đơn hàng tối thiểu */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold small text-secondary">Đơn hàng tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    name="min_order_value"
                    value={form.min_order_value}
                    onChange={handleFormChange}
                    className="form-control rounded-3"
                    placeholder="VD: 100000"
                    min="0"
                  />
                </div>

                {/* Giảm tối đa (chỉ áp dụng cho % ) */}
                {form.discount_type === 'percentage' && (
                  <div className="col-md-4">
                    <label className="form-label fw-semibold small text-secondary">Giảm tối đa (VNĐ)</label>
                    <input
                      type="number"
                      name="max_discount_amount"
                      value={form.max_discount_amount}
                      onChange={handleFormChange}
                      className="form-control rounded-3"
                      placeholder="VD: 100000"
                      min="0"
                    />
                  </div>
                )}

                {/* Ngày hết hạn */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold small text-secondary">Ngày hết hạn *</label>
                  <input
                    type="datetime-local"
                    name="expiration_date"
                    value={form.expiration_date}
                    onChange={handleFormChange}
                    className="form-control rounded-3"
                    required
                  />
                </div>

                {/* Số lượt dùng tối đa */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold small text-secondary">Số lượt dùng tối đa</label>
                  <input
                    type="number"
                    name="max_uses"
                    value={form.max_uses}
                    onChange={handleFormChange}
                    className="form-control rounded-3"
                    placeholder="Bỏ trống = không giới hạn"
                    min="1"
                  />
                </div>
              </div>

              <div className="mt-4 d-flex gap-2">
                <button type="submit" className="btn btn-danger rounded-3 px-4 fw-bold" disabled={submitting}>
                  {submitting ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Đang tạo...</>
                  ) : (
                    <><i className="bi bi-check-circle me-2"></i>Tạo mã giảm giá</>
                  )}
                </button>
                <button type="button" className="btn btn-light rounded-3 px-4 fw-semibold border" onClick={() => { setShowForm(false); setForm(initialForm); }}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupons Table */}
      <div className="card border-0 rounded-4 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <div className="spinner-border text-danger me-3" role="status"></div>
              <span className="text-secondary fw-semibold">Đang tải danh sách mã giảm giá...</span>
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-ticket-perforated text-muted" style={{ fontSize: '3rem' }}></i>
              <p className="text-secondary mt-3 fw-semibold">Chưa có mã giảm giá nào. Nhấn "Tạo mã mới" để bắt đầu!</p>
            </div>
          ) : (
            <div className="table-responsive rounded-4">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4 py-3 text-secondary small fw-bold border-0">MÃ KM</th>
                    <th className="py-3 text-secondary small fw-bold border-0">LOẠI</th>
                    <th className="py-3 text-secondary small fw-bold border-0">GIÁ TRỊ GIẢM</th>
                    <th className="py-3 text-secondary small fw-bold border-0">ĐH TỐI THIỂU</th>
                    <th className="py-3 text-secondary small fw-bold border-0">LƯỢT DÙNG</th>
                    <th className="py-3 text-secondary small fw-bold border-0">NGÀY HẾT HẠN</th>
                    <th className="py-3 text-secondary small fw-bold border-0">TRẠNG THÁI</th>
                    <th className="py-3 text-secondary small fw-bold border-0 text-center">HÀNH ĐỘNG</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map(coupon => (
                    <tr key={coupon._id}>
                      <td className="ps-4 fw-bold text-gray-800">
                        <span className="badge bg-light text-dark border px-3 py-2 rounded-3" style={{ fontFamily: 'monospace', letterSpacing: '1px', fontSize: '0.85rem' }}>
                          {coupon.code}
                        </span>
                      </td>
                      <td>
                        <span className={`badge rounded-pill px-3 py-1 ${coupon.discount_type === 'percentage' ? 'bg-info text-dark' : 'bg-purple text-white'}`}
                          style={{ backgroundColor: coupon.discount_type === 'fixed' ? '#6f42c1' : undefined, color: coupon.discount_type === 'fixed' ? 'white' : undefined }}>
                          {coupon.discount_type === 'percentage' ? 'Phần trăm' : 'Cố định'}
                        </span>
                      </td>
                      <td className="fw-bold text-danger">
                        {coupon.discount_type === 'percentage'
                          ? `${coupon.discount_value}%${coupon.max_discount_amount ? ` (tối đa ${coupon.max_discount_amount.toLocaleString()}đ)` : ''}`
                          : `${coupon.discount_value.toLocaleString()}đ`}
                      </td>
                      <td className="text-secondary small">
                        {coupon.min_order_value > 0 ? `${coupon.min_order_value.toLocaleString()}đ` : 'Không giới hạn'}
                      </td>
                      <td>
                        <span className="fw-semibold text-gray-800">{coupon.uses_count}</span>
                        <span className="text-secondary small"> / {coupon.max_uses ?? '∞'}</span>
                      </td>
                      <td className="small text-secondary">
                        {new Date(coupon.expiration_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td>{statusBadge(coupon)}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-outline-danger btn-sm rounded-3 px-3"
                          onClick={() => handleDelete(coupon._id, coupon.code)}
                          disabled={deletingId === coupon._id}
                        >
                          {deletingId === coupon._id
                            ? <span className="spinner-border spinner-border-sm"></span>
                            : <><i className="bi bi-trash me-1"></i>Xóa</>
                          }
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Summary stats */}
      {coupons.length > 0 && (
        <div className="row g-3 mt-3">
          <div className="col-md-3">
            <div className="card border-0 rounded-4 p-3 text-center text-white" style={{ background: 'linear-gradient(135deg, #28a745, #20c997)' }}>
              <div className="fw-bold fs-4">{coupons.filter(c => c.is_active && !isExpired(c.expiration_date) && (c.max_uses === null || c.uses_count < c.max_uses)).length}</div>
              <div className="small opacity-90 mt-1">Mã đang hoạt động</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 rounded-4 p-3 text-center text-white" style={{ background: 'linear-gradient(135deg, #dc3545, #e83e5c)' }}>
              <div className="fw-bold fs-4">{coupons.filter(c => isExpired(c.expiration_date)).length}</div>
              <div className="small opacity-90 mt-1">Mã đã hết hạn</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 rounded-4 p-3 text-center text-dark" style={{ background: 'linear-gradient(135deg, #ffc107, #ffdb4d)' }}>
              <div className="fw-bold fs-4">{coupons.filter(c => c.max_uses !== null && c.uses_count >= c.max_uses).length}</div>
              <div className="small mt-1" style={{ opacity: 0.75 }}>Mã đã hết lượt</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 rounded-4 p-3 text-center text-white" style={{ background: 'linear-gradient(135deg, #0dcaf0, #0da5cc)' }}>
              <div className="fw-bold fs-4">{coupons.reduce((sum, c) => sum + c.uses_count, 0)}</div>
              <div className="small opacity-90 mt-1">Tổng lượt đã dùng</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
