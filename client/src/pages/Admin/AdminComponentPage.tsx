import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { componentService, ComponentItem } from '@/features/components/services/componentService';
import { ComponentProduct } from '@/types/component';
import axiosClient from '@/api/axiosClient';
import { API_BASE_URL } from '@/config/constants';

export const AdminComponentPage: React.FC = () => {
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState<ComponentItem | null>(null);
  const [formData, setFormData] = useState({
    type: 'flash_sale' as 'flash_sale' | 'best_selling' | 'new_arrival' | 'custom',
    title: 'FLASH SALE',
    description: '',
    background_color: '#dc3545',
    text_color: '#ffffff',
    button_color: '#ffffff',
    button_text_color: '#dc3545',
    show_countdown: true,
    countdown_end: '',
    products: [] as ComponentProduct[],
    position: 'home_top' as 'home_top' | 'home_middle' | 'home_bottom',
    is_active: true,
    order: 0
  });

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const response = await componentService.getAllComponents();
      if (response.success) {
        setComponents(response.data);
      }
    } catch (err) {
      setError('Failed to fetch components');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  const handleAddComponent = () => {
    setEditingComponent(null);
    setFormData({
      type: 'flash_sale',
      title: 'FLASH SALE',
      description: '',
      background_color: '#dc3545',
      text_color: '#ffffff',
      button_color: '#ffffff',
      button_text_color: '#dc3545',
      show_countdown: true,
      countdown_end: '',
      products: [],
      position: 'home_top',
      is_active: true,
      order: 0
    });
    setShowModal(true);
  };

  const handleEditComponent = (component: ComponentItem) => {
    setEditingComponent(component);
    setFormData({
      type: component.type,
      title: component.title,
      description: component.description || '',
      background_color: component.background_color,
      text_color: component.text_color,
      button_color: component.button_color,
      button_text_color: component.button_text_color,
      show_countdown: component.show_countdown,
      countdown_end: component.countdown_end ? new Date(component.countdown_end).toISOString().slice(0, 16) : '',
      products: component.products,
      position: component.position,
      is_active: component.is_active,
      order: component.order
    });
    setShowModal(true);
  };

  const handleDeleteComponent = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa component này?')) return;

    try {
      const token = localStorage.getItem('token');
      await axiosClient.delete(`${API_BASE_URL}/components/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComponents();
    } catch (err) {
      alert('Failed to delete component');
    }
  };

  const handleAddProduct = () => {
    setFormData({
      ...formData,
      products: [...formData.products, {
        product_id: '',
        product_name: '',
        product_image: '',
        original_price: 0,
        discount_price: 0,
        sold_percentage: 0,
        discount_percentage: 0
      }]
    });
  };

  const handleRemoveProduct = (index: number) => {
    setFormData({
      ...formData,
      products: formData.products.filter((_, i) => i !== index)
    });
  };

  const handleProductChange = (index: number, field: keyof ComponentProduct, value: string | number) => {
    const newProducts = [...formData.products];
    newProducts[index][field] = value as never;
    setFormData({ ...formData, products: newProducts });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const componentData = {
        ...formData,
        countdown_end: formData.countdown_end ? new Date(formData.countdown_end) : null
      };
      
      if (editingComponent) {
        await axiosClient.put(`${API_BASE_URL}/components/${editingComponent._id}`, componentData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axiosClient.post(`${API_BASE_URL}/components`, componentData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setShowModal(false);
      fetchComponents();
    } catch (err) {
      alert('Failed to save component');
    }
  };

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 text-gray-800">Quản lý Component</h1>
        <button className="btn btn-primary" onClick={handleAddComponent}>
          <i className="fas fa-plus mr-2"></i>Thêm Component
        </button>
      </div>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Danh sách Component</h6>
        </div>
        <div className="card-body">
          {error ? (
            <div className="alert alert-danger">{error}</div>
          ) : components.length === 0 ? (
            <div className="text-center py-5 text-muted">
              Chưa có component nào. Hãy thêm component mới!
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Loại</th>
                    <th>Tiêu đề</th>
                    <th>Vị trí</th>
                    <th>Màu nền</th>
                    <th>Số sản phẩm</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {components.map((component) => (
                    <tr key={component._id}>
                      <td>
                        <span className={`badge ${
                          component.type === 'flash_sale' ? 'badge-danger' :
                          component.type === 'best_selling' ? 'badge-success' :
                          component.type === 'new_arrival' ? 'badge-info' : 'badge-secondary'
                        }`}>
                          {component.type === 'flash_sale' ? 'Flash Sale' :
                           component.type === 'best_selling' ? 'Bán chạy' :
                           component.type === 'new_arrival' ? 'Hàng mới' : 'Tùy chỉnh'}
                        </span>
                      </td>
                      <td>{component.title}</td>
                      <td>
                        <span className={`badge ${
                          component.position === 'home_top' ? 'badge-primary' :
                          component.position === 'home_middle' ? 'badge-warning' : 'badge-info'
                        }`}>
                          {component.position === 'home_top' ? 'Trang chủ - Trên' :
                           component.position === 'home_middle' ? 'Trang chủ - Giữa' : 'Trang chủ - Dưới'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div 
                            style={{ 
                              width: '30px', 
                              height: '30px', 
                              backgroundColor: component.background_color,
                              border: '1px solid #ddd',
                              marginRight: '10px'
                            }}
                          />
                          <span>{component.background_color}</span>
                        </div>
                      </td>
                      <td>{component.products.length}</td>
                      <td>
                        <span className={`badge ${component.is_active ? 'badge-success' : 'badge-secondary'}`}>
                          {component.is_active ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-info mr-2"
                          onClick={() => handleEditComponent(component)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteComponent(component._id)}
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
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingComponent ? 'Cập nhật Component' : 'Thêm Component mới'}
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
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Loại Component</label>
                        <select
                          className="form-control"
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        >
                          <option value="flash_sale">Flash Sale</option>
                          <option value="best_selling">Sản phẩm bán chạy</option>
                          <option value="new_arrival">Sản phẩm mới</option>
                          <option value="custom">Tùy chỉnh</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Vị trí hiển thị</label>
                        <select
                          className="form-control"
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value as any })}
                        >
                          <option value="home_top">Trang chủ - Trên</option>
                          <option value="home_middle">Trang chủ - Giữa</option>
                          <option value="home_bottom">Trang chủ - Dưới</option>
                        </select>
                      </div>
                    </div>
                  </div>

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

                  <div className="row">
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Màu nền</label>
                        <input
                          type="color"
                          className="form-control"
                          value={formData.background_color}
                          onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Màu chữ</label>
                        <input
                          type="color"
                          className="form-control"
                          value={formData.text_color}
                          onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Màu nút</label>
                        <input
                          type="color"
                          className="form-control"
                          value={formData.button_color}
                          onChange={(e) => setFormData({ ...formData, button_color: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Màu chữ nút</label>
                        <input
                          type="color"
                          className="form-control"
                          value={formData.button_text_color}
                          onChange={(e) => setFormData({ ...formData, button_text_color: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.show_countdown}
                        onChange={(e) => setFormData({ ...formData, show_countdown: e.target.checked })}
                      /> Hiển thị đếm ngược
                    </label>
                  </div>

                  {formData.show_countdown && (
                    <div className="form-group">
                      <label>Thời gian kết thúc đếm ngược</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.countdown_end}
                        onChange={(e) => setFormData({ ...formData, countdown_end: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label>Sản phẩm</label>
                    {formData.products.map((product, index) => (
                      <div key={index} className="card mb-3">
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-group">
                                <label>Tên sản phẩm</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={product.product_name}
                                  onChange={(e) => handleProductChange(index, 'product_name', e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label>ID sản phẩm</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={product.product_id}
                                  onChange={(e) => handleProductChange(index, 'product_id', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-group">
                                <label>Link ảnh</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={product.product_image}
                                  onChange={(e) => handleProductChange(index, 'product_image', e.target.value)}
                                />
                                {product.product_image && (
                                  <img
                                    src={product.product_image}
                                    alt="Preview"
                                    style={{
                                      width: '100%',
                                      maxHeight: '150px',
                                      objectFit: 'contain',
                                      marginTop: '10px',
                                      border: '1px solid #ddd',
                                      borderRadius: '4px'
                                    }}
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label>Giá gốc</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={product.original_price}
                                  onChange={(e) => handleProductChange(index, 'original_price', parseFloat(e.target.value))}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-4">
                              <div className="form-group">
                                <label>Giá giảm</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={product.discount_price}
                                  onChange={(e) => handleProductChange(index, 'discount_price', parseFloat(e.target.value))}
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="form-group">
                                <label>% Đã bán</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={product.sold_percentage}
                                  onChange={(e) => handleProductChange(index, 'sold_percentage', parseFloat(e.target.value))}
                                  min="0"
                                  max="100"
                                />
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="form-group">
                                <label>% Giảm giá</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={product.discount_percentage}
                                  onChange={(e) => handleProductChange(index, 'discount_percentage', parseFloat(e.target.value))}
                                  min="0"
                                  max="100"
                                />
                              </div>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRemoveProduct(index)}
                          >
                            <i className="fas fa-trash mr-1"></i> Xóa sản phẩm
                          </button>
                        </div>
                      </div>
                    ))}
                    <button 
                      type="button" 
                      className="btn btn-sm btn-secondary"
                      onClick={handleAddProduct}
                    >
                      <i className="fas fa-plus mr-1"></i> Thêm sản phẩm
                    </button>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
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
                    <div className="col-md-6">
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
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingComponent ? 'Cập nhật' : 'Thêm'}
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
