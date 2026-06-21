import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { bannerService, Banner } from '@/features/banners/services/bannerService';
import axiosClient from '@/api/axiosClient';
import { API_BASE_URL } from '@/config/constants';

export const AdminBannerPage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    position: 'main' as 'main' | 'sub1' | 'sub2',
    is_active: true,
    order: 0
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await bannerService.getAllBanners();
      if (response.success) {
        setBanners(response.data);
      }
    } catch (err) {
      setError('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleAddBanner = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      position: 'main',
      is_active: true,
      order: 0
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || '',
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      position: banner.position,
      is_active: banner.is_active,
      order: banner.order
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa banner này?')) return;

    try {
      const token = localStorage.getItem('token');
      await axiosClient.delete(`${API_BASE_URL}/banners/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBanners();
    } catch (err) {
      alert('Failed to delete banner');
    }
  };

  const uploadImageAndGetUrl = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'tamit789');
      const cloudinaryUploadUrl = 'https://api.cloudinary.com/v1_1/ds51sgdnl/image/upload';

      const uploadResponse = await axios.post(cloudinaryUploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return uploadResponse.data.secure_url;
    } catch (error) {
      console.error('Lỗi khi tải lên hình ảnh:', error);
      alert('Lỗi khi tải lên hình ảnh!');
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      let imageUrl = formData.image_url;

      // Upload image to Cloudinary if a new file is selected
      if (imageFile) {
        setUploadingImage(true);
        imageUrl = await uploadImageAndGetUrl(imageFile);
        setUploadingImage(false);
      }

      const bannerData = {
        ...formData,
        image_url: imageUrl
      };
      
      if (editingBanner) {
        await axiosClient.put(`${API_BASE_URL}/banners/${editingBanner._id}`, bannerData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axiosClient.post(`${API_BASE_URL}/banners`, bannerData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setShowModal(false);
      fetchBanners();
    } catch (err) {
      alert('Failed to save banner');
    }
  };

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 text-gray-800">Quản lý Banner</h1>
        <button className="btn btn-primary" onClick={handleAddBanner}>
          <i className="fas fa-plus mr-2"></i>Thêm Banner
        </button>
      </div>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Danh sách Banner</h6>
        </div>
        <div className="card-body">
          {error ? (
            <div className="alert alert-danger">{error}</div>
          ) : banners.length === 0 ? (
            <div className="text-center py-5 text-muted">
              Chưa có banner nào. Hãy thêm banner mới!
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>Tiêu đề</th>
                    <th>Vị trí</th>
                    <th>Trạng thái</th>
                    <th>Thứ tự</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map((banner) => (
                    <tr key={banner._id}>
                      <td>
                        <img 
                          src={banner.image_url} 
                          alt={banner.title} 
                          style={{ width: '100px', height: '60px', objectFit: 'cover' }}
                        />
                      </td>
                      <td>{banner.title}</td>
                      <td>
                        <span className={`badge ${
                          banner.position === 'main' ? 'badge-primary' : 'badge-info'
                        }`}>
                          {banner.position === 'main' ? 'Chính' : banner.position === 'sub1' ? 'Phụ 1' : 'Phụ 2'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${banner.is_active ? 'badge-success' : 'badge-secondary'}`}>
                          {banner.is_active ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </td>
                      <td>{banner.order}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-info mr-2"
                          onClick={() => handleEditBanner(banner)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteBanner(banner._id)}
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
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingBanner ? 'Cập nhật Banner' : 'Thêm Banner mới'}
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
                    <label>Tiêu đề</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Mô tả</label>
                    <textarea
                      className="form-control"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Hình ảnh</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageFile(file);
                          // Create preview URL
                          const previewUrl = URL.createObjectURL(file);
                          setFormData({ ...formData, image_url: previewUrl });
                        }
                      }}
                    />
                    {formData.image_url && (
                      <img 
                        src={formData.image_url} 
                        alt="Preview" 
                        style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', marginTop: '10px' }}
                      />
                    )}
                  </div>
                  <div className="form-group">
                    <label>Link khi click</label>
                    <input
                      type="url"
                      className="form-control"
                      value={formData.link_url}
                      onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Vị trí</label>
                    <select
                      className="form-control"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value as 'main' | 'sub1' | 'sub2' })}
                    >
                      <option value="main">Chính (Banner lớn)</option>
                      <option value="sub1">Phụ 1 (Banner nhỏ 1)</option>
                      <option value="sub2">Phụ 2 (Banner nhỏ 2)</option>
                    </select>
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
                  <div className="form-group">
                    <label>Thứ tự</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={uploadingImage}>
                    {uploadingImage ? 'Đang tải hình...' : (editingBanner ? 'Cập nhật' : 'Thêm')}
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
