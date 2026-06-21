import React, { useEffect, useState } from 'react';
import { footerService, Footer } from '@/features/footers/services/footerService';
import axiosClient from '@/api/axiosClient';
import { API_BASE_URL } from '@/config/constants';

export const AdminFooterPage: React.FC = () => {
  const [footers, setFooters] = useState<Footer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingFooter, setEditingFooter] = useState<Footer | null>(null);
  const [formData, setFormData] = useState({
    company_name: '',
    company_description: '',
    policy_title: '',
    policies: [{ title: '', link: '' }],
    contact_title: '',
    contacts: [{ icon: 'bi-telephone', text: '' }],
    is_active: true
  });

  const fetchFooters = async () => {
    try {
      setLoading(true);
      const response = await footerService.getAllFooters();
      if (response.success) {
        setFooters(response.data);
      }
    } catch (err) {
      setError('Failed to fetch footers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFooters();
  }, []);

  const handleAddFooter = () => {
    setEditingFooter(null);
    setFormData({
      company_name: '',
      company_description: '',
      policy_title: '',
      policies: [{ title: '', link: '' }],
      contact_title: '',
      contacts: [{ icon: 'bi-telephone', text: '' }],
      is_active: true
    });
    setShowModal(true);
  };

  const handleEditFooter = (footer: Footer) => {
    setEditingFooter(footer);
    setFormData({
      company_name: footer.company_name,
      company_description: footer.company_description || '',
      policy_title: footer.policy_title || '',
      policies: footer.policies || [{ title: '', link: '' }],
      contact_title: footer.contact_title || '',
      contacts: footer.contacts || [{ icon: 'bi-telephone', text: '' }],
      is_active: footer.is_active
    });
    setShowModal(true);
  };

  const handleDeleteFooter = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa footer này?')) return;

    try {
      const token = localStorage.getItem('token');
      await axiosClient.delete(`${API_BASE_URL}/footers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFooters();
    } catch (err) {
      alert('Failed to delete footer');
    }
  };

  const handleAddPolicy = () => {
    setFormData({
      ...formData,
      policies: [...formData.policies, { title: '', link: '' }]
    });
  };

  const handleRemovePolicy = (index: number) => {
    setFormData({
      ...formData,
      policies: formData.policies.filter((_, i) => i !== index)
    });
  };

  const handlePolicyChange = (index: number, field: 'title' | 'link', value: string) => {
    const newPolicies = [...formData.policies];
    newPolicies[index][field] = value;
    setFormData({ ...formData, policies: newPolicies });
  };

  const handleAddContact = () => {
    setFormData({
      ...formData,
      contacts: [...formData.contacts, { icon: 'bi-envelope', text: '' }]
    });
  };

  const handleRemoveContact = (index: number) => {
    setFormData({
      ...formData,
      contacts: formData.contacts.filter((_, i) => i !== index)
    });
  };

  const handleContactChange = (index: number, field: 'icon' | 'text', value: string) => {
    const newContacts = [...formData.contacts];
    newContacts[index][field] = value;
    setFormData({ ...formData, contacts: newContacts });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (editingFooter) {
        await axiosClient.put(`${API_BASE_URL}/footers/${editingFooter._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axiosClient.post(`${API_BASE_URL}/footers`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setShowModal(false);
      fetchFooters();
    } catch (err) {
      alert('Failed to save footer');
    }
  };

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 text-gray-800">Quản lý Footer</h1>
        <button className="btn btn-primary" onClick={handleAddFooter}>
          <i className="fas fa-plus mr-2"></i>Thêm Footer
        </button>
      </div>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Danh sách Footer</h6>
        </div>
        <div className="card-body">
          {error ? (
            <div className="alert alert-danger">{error}</div>
          ) : footers.length === 0 ? (
            <div className="text-center py-5 text-muted">
              Chưa có footer nào. Hãy thêm footer mới!
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Tên công ty</th>
                    <th>Mô tả</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {footers.map((footer) => (
                    <tr key={footer._id}>
                      <td>{footer.company_name}</td>
                      <td>{footer.company_description || '-'}</td>
                      <td>
                        <span className={`badge ${footer.is_active ? 'badge-success' : 'badge-secondary'}`}>
                          {footer.is_active ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-info mr-2"
                          onClick={() => handleEditFooter(footer)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteFooter(footer._id)}
                        >
                          <i className="fas fa-trash"></i>
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

      {/* Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingFooter ? 'Cập nhật Footer' : 'Thêm Footer mới'}
                </h5>
                <button 
                  type="button" 
                  className="close" 
                  onClick={() => setShowModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Tên công ty</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Mô tả công ty</label>
                    <textarea
                      className="form-control"
                      value={formData.company_description}
                      onChange={(e) => setFormData({ ...formData, company_description: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tiêu đề chính sách</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.policy_title}
                      onChange={(e) => setFormData({ ...formData, policy_title: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Chính sách</label>
                    {formData.policies.map((policy, index) => (
                      <div key={index} className="input-group mb-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Tiêu đề"
                          value={policy.title}
                          onChange={(e) => handlePolicyChange(index, 'title', e.target.value)}
                        />
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Link"
                          value={policy.link}
                          onChange={(e) => handlePolicyChange(index, 'link', e.target.value)}
                        />
                        <div className="input-group-append">
                          <button 
                            type="button" 
                            className="btn btn-danger"
                            onClick={() => handleRemovePolicy(index)}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                    <button 
                      type="button" 
                      className="btn btn-sm btn-secondary"
                      onClick={handleAddPolicy}
                    >
                      <i className="fas fa-plus mr-1"></i> Thêm chính sách
                    </button>
                  </div>
                  <div className="form-group">
                    <label>Tiêu đề liên hệ</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.contact_title}
                      onChange={(e) => setFormData({ ...formData, contact_title: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Thông tin liên hệ</label>
                    {formData.contacts.map((contact, index) => (
                      <div key={index} className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Icon (bi-telephone, bi-envelope, ...)"
                      value={contact.icon}
                      onChange={(e) => handleContactChange(index, 'icon', e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nội dung"
                      value={contact.text}
                      onChange={(e) => handleContactChange(index, 'text', e.target.value)}
                    />
                    <div className="input-group-append">
                      <button 
                        type="button" 
                        className="btn btn-danger"
                        onClick={() => handleRemoveContact(index)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                ))}
                <button 
                  type="button" 
                  className="btn btn-sm btn-secondary"
                  onClick={handleAddContact}
                >
                  <i className="fas fa-plus mr-1"></i> Thêm liên hệ
                </button>
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  className="form-control"
                  value={formData.is_active.toString()}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                >
                  <option value="true">Hoạt động</option>
                  <option value="false">Không hoạt động</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Hủy
              </button>
              <button type="submit" className="btn btn-primary">
                {editingFooter ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )}

  {showModal && <div className="modal-backdrop fade show" style={{ display: 'block' }}></div>}
</>
);
};
