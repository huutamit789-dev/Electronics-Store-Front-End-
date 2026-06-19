import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Category {
  _id: string;
  name: string;
  description: string;
}

export const CategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // States cho các Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // States cho dữ liệu
  const [currentCategory, setCurrentCategory] = useState<Category>({ _id: '', name: '', description: '' });
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8090/api/categories');
      setCategories(response.data.data?.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleAdd = async () => {
    try {
      await axios.post('http://localhost:8090/api/categories', newCategory);
      setIsAddModalOpen(false);
      setNewCategory({ name: '', description: '' });
      fetchCategories(); // Làm mới lại danh sách sau khi thêm thành công
    } catch (err) {
      console.error('Lỗi khi thêm danh mục:', err);
      alert('Thêm danh mục thất bại!');
    }
  };

  const handleEditClick = (category: Category) => {
    setCurrentCategory(category);
    setIsEditModalOpen(true);
  };

  const handleUpdate = () => {
    console.log('Cập nhật:', currentCategory);
    // axios.put(...)
    setIsEditModalOpen(false);
  };

  const confirmDelete = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      // Gọi API xóa dựa trên ID của category đang được chọn
      await axios.delete(`http://localhost:8090/api/categories/${currentCategory._id}`);
      setIsDeleteModalOpen(false);
      fetchCategories(); // Làm mới lại danh sách sau khi xóa thành công
    } catch (err) {
      console.error('Lỗi khi xóa danh mục:', err);
      alert('Xóa danh mục thất bại!');
    }
  };

  if (loading) return <div className="text-center mt-5">Đang tải dữ liệu...</div>;

  return (
      <>
        <h1 className="h3 mb-4 text-gray-800">Quản lý Danh mục</h1>
        <button className="btn btn-primary mb-3" onClick={() => setIsAddModalOpen(true)}>
          <i className="fas fa-plus me-2"></i> Thêm danh mục mới
        </button>

        <div className="card shadow mb-4">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                <tr>
                  <th>Tên danh mục</th>
                  <th>Mô tả</th>
                  <th>Hành động</th>
                </tr>
                </thead>
                <tbody>
                {categories.map((cat) => (
                    <tr key={cat._id}>
                      <td>{cat.name}</td>
                      <td>{cat.description}</td>
                      <td>
                        <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditClick(cat)}>
                          <i className="fas fa-edit"></i> Sửa
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => confirmDelete(cat)}>
                          <i className="fas fa-trash"></i> Xóa
                        </button>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* MODAL THÊM MỚI */}
        {isAddModalOpen && (
            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog"><div className="modal-content">
                <div className="modal-header"><h5 className="modal-title">Thêm danh mục</h5></div>
                <div className="modal-body">
                  <input className="form-control mb-2" placeholder="Tên" onChange={(e) => setNewCategory({...newCategory, name: e.target.value})} />
                  <textarea className="form-control" placeholder="Mô tả" onChange={(e) => setNewCategory({...newCategory, description: e.target.value})} />
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Hủy</button>
                  <button className="btn btn-primary" onClick={handleAdd}>Thêm</button>
                </div>
              </div></div>
            </div>
        )}

        {/* MODAL SỬA */}
        {isEditModalOpen && (
            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog"><div className="modal-content">
                <div className="modal-header"><h5 className="modal-title">Chỉnh sửa</h5></div>
                <div className="modal-body">
                  <input className="form-control mb-2" value={currentCategory.name} onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value})} />
                  <textarea className="form-control" value={currentCategory.description} onChange={(e) => setCurrentCategory({...currentCategory, description: e.target.value})} />
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Hủy</button>
                  <button className="btn btn-primary" onClick={handleUpdate}>Lưu thay đổi</button>
                </div>
              </div></div>
            </div>
        )}

        {/* MODAL XÓA */}
        {isDeleteModalOpen && (
            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog"><div className="modal-content">
                <div className="modal-header"><h5 className="modal-title">Xác nhận xóa</h5></div>
                <div className="modal-body">Bạn có chắc chắn muốn xóa <strong>{currentCategory.name}</strong> không?</div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Hủy</button>
                  <button className="btn btn-danger" onClick={handleDelete}>Xóa</button>
                </div>
              </div></div>
            </div>
        )}
      </>
  );
};