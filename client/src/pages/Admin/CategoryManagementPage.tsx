import React, { useEffect, useState } from 'react';

import toast, { Toaster } from 'react-hot-toast';
import axiosClient from "@/api/axiosClient"; // Import toast và Toaster
import { API_BASE_URL } from '@/config/constants';

interface Category {
  _id: string;
  name: string;
  description: string;
}

interface CategoryApiResponse {
  success: boolean;
  message: string;
  data: {
    categories: Category[];
    total: number;
    currentPage: number;
    totalPages: number;
  };
}

export const CategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // States cho phân trang
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [categoriesPerPage, setCategoriesPerPage] = useState<number>(10); // Số danh mục trên mỗi trang
  const [totalCategories, setTotalCategories] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // States cho các Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // States cho dữ liệu
  const [currentCategory, setCurrentCategory] = useState<Category>({ _id: '', name: '', description: '' });
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCategories(currentPage, categoriesPerPage);
  }, [currentPage, categoriesPerPage]);

  const fetchCategories = async (page: number, limit: number) => {
    try {
      setLoading(true);
      const response = await axiosClient.get<CategoryApiResponse>(`${API_BASE_URL}/categories?page=${page}&limit=${limit}`);
      setCategories(response.data.data?.categories || []);
      setTotalCategories(response.data.data.total);
      setCurrentPage(response.data.data.currentPage);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      console.error('Lỗi khi tải danh mục:', err);
      toast.error('Lỗi khi tải danh mục!');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleAdd = async () => {
    try {
      await axiosClient.post(`${API_BASE_URL}/categories`, newCategory);
      setIsAddModalOpen(false);
      setNewCategory({ name: '', description: '' });
      fetchCategories(currentPage, categoriesPerPage); // Làm mới lại danh sách sau khi thêm thành công
      toast.success('Thêm danh mục thành công!');
    } catch (err) {
      console.error('Lỗi khi thêm danh mục:', err);
      toast.error('Thêm danh mục thất bại!');
    }
  };

  const handleEditClick = (category: Category) => {
    setCurrentCategory(category);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await axiosClient.put(`${API_BASE_URL}/categories/${currentCategory._id}`, currentCategory);
      setIsEditModalOpen(false);
      fetchCategories(currentPage, categoriesPerPage); // Làm mới lại danh sách sau khi cập nhật thành công
      toast.success('Cập nhật danh mục thành công!');
    } catch (err) {
      console.error('Lỗi khi cập nhật danh mục:', err);
      toast.error('Cập nhật danh mục thất bại!');
    }
  };

  const confirmDelete = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axiosClient.delete(`${API_BASE_URL}/categories/${currentCategory._id}`);
      setIsDeleteModalOpen(false);
      fetchCategories(currentPage, categoriesPerPage); // Làm mới lại danh sách sau khi xóa thành công
      toast.success('Xóa danh mục thành công!');
    } catch (err) {
      console.error('Lỗi khi xóa danh mục:', err);
      toast.error('Xóa danh mục thất bại!');
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const filteredCategories = categories.filter((cat) => {
    const keyword = searchTerm.toLowerCase();
    return cat.name?.toLowerCase().includes(keyword) || cat.description?.toLowerCase().includes(keyword);
  });

  if (loading) return <div className="text-center mt-5">Đang tải dữ liệu...</div>;

  return (
      <>
        <Toaster /> {/* Component Toaster để hiển thị các toast */}
        <h1 className="h3 mb-4 text-gray-800">Quản lý Danh mục</h1>
        <button className="btn btn-primary mb-3" onClick={() => setIsAddModalOpen(true)}>
          <i className="fas fa-plus me-2"></i> Thêm danh mục mới
        </button>

        <div className="card shadow mb-4">
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-4 ms-auto">
                <div className="input-group">
                  <span className="input-group-text"><i className="fas fa-search"></i></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm danh mục..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
            </div>
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
                {filteredCategories.map((cat) => (
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
            {/* Pagination Controls */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                Hiển thị {filteredCategories.length} trên {totalCategories} danh mục (Trang {currentPage} / {totalPages})
              </div>
              <nav>
                <ul className="pagination mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                      Previous
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => (
                      <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(i + 1)}>
                          {i + 1}
                        </button>
                      </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
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