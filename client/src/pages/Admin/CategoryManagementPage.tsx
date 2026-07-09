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
  const [categoriesPerPage, setCategoriesPerPage] = useState<number>(20); // Số danh mục trên mỗi trang
  const [totalCategories, setTotalCategories] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // States cho các Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);

  // States cho dữ liệu
  const [currentCategory, setCurrentCategory] = useState<Category>({ _id: '', name: '', description: '' });
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [excelFile, setExcelFile] = useState<File | null>(null);

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

  const handleBulkUpload = async () => {
    try {
      if (!excelFile) {
        toast.error('Vui lòng chọn file Excel!');
        return;
      }

      const formData = new FormData();
      formData.append('file', excelFile);

      const response = await axiosClient.post(`${API_BASE_URL}/categories/bulk/excel`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setIsBulkUploadModalOpen(false);
      setExcelFile(null);
      fetchCategories(currentPage, categoriesPerPage);
      
      const result = response.data.data;
      if (result.skipped > 0) {
        toast.success(`${result.message || `Đã thêm ${result.created} danh mục, bỏ qua ${result.skipped} danh mục trùng`}`);
      } else {
        toast.success(`Đã thêm ${result.created} danh mục thành công!`);
      }
    } catch (err) {
      console.error('Lỗi khi upload hàng loạt:', err);
      toast.error('Upload hàng loạt thất bại! Kiểm tra file Excel.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      if (!allowedTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.error('Chỉ chấp nhận file Excel (.xlsx, .xls)!');
        return;
      }
      setExcelFile(file);
    }
  };

  const filteredCategories = categories.filter((cat) => {
    const keyword = searchTerm.toLowerCase();
    return cat.name?.toLowerCase().includes(keyword) || cat.description?.toLowerCase().includes(keyword);
  });

  if (loading) return <div className="text-center mt-5">Đang tải dữ liệu...</div>;

  return (
      <>
        <Toaster /> {/* Component Toaster để hiển thị các toast */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <h1 className="h3 text-gray-800 mb-0">Quản lý Danh mục</h1>
          <div className="d-flex gap-2 flex-wrap">
            <button className="btn btn-primary flex-shrink-0" onClick={() => setIsAddModalOpen(true)}>
              <i className="fas fa-plus me-2"></i> Thêm danh mục mới
            </button>
            <button className="btn btn-success flex-shrink-0" onClick={() => setIsBulkUploadModalOpen(true)}>
              <i className="fas fa-upload me-2"></i> Upload nhiều danh mục
            </button>
          </div>
        </div>

        <div className="card shadow mb-4">
          <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold text-primary">Danh sách Danh mục</h6>
          </div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-12 col-md-4 ms-auto">
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
            <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxWidth: '100%' }}>
              <table className="table table-bordered table-striped" style={{ tableLayout: 'fixed', minWidth: '600px', width: '100%' }}>
                <thead>
                <tr>
                  <th style={{ width: '35%', minWidth: '200px' }}>Tên danh mục</th>
                  <th style={{ width: '50%', minWidth: '300px' }}>Mô tả</th>
                  <th style={{ width: '15%', minWidth: '100px' }}>Hành động</th>
                </tr>
                </thead>
                <tbody>
                {filteredCategories.map((cat) => (
                    <tr key={cat._id}>
                      <td className="text-truncate" style={{ maxWidth: '0' }} title={cat.name}>{cat.name}</td>
                      <td className="text-truncate" style={{ maxWidth: '0' }} title={cat.description}>{cat.description}</td>
                      <td className="text-center">
                        <div className="d-flex gap-1 justify-content-center flex-wrap">
                          <button className="btn btn-warning btn-sm" onClick={() => handleEditClick(cat)}>
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => confirmDelete(cat)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2">
              <div className="text-center text-md-start">
                <small className="d-block d-md-inline">Hiển thị {filteredCategories.length} trên {totalCategories} danh mục (Trang {currentPage} / {totalPages})</small>
              </div>
              <nav className="d-flex justify-content-center">
                <ul className="pagination mb-0 flex-wrap">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                      <i className="fas fa-chevron-left"></i>
                    </button>
                  </li>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(pageNum)}>
                          {pageNum}
                        </button>
                      </li>
                    );
                  })}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                      <i className="fas fa-chevron-right"></i>
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

        {/* MODAL UPLOAD HÀNG LOẠT */}
        {isBulkUploadModalOpen && (
            <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-lg"><div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Upload nhiều danh mục từ Excel</h5>
                  <button type="button" className="btn-close" onClick={() => setIsBulkUploadModalOpen(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Chọn file Excel:</label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                    />
                  </div>
                  {excelFile && (
                    <div className="mb-3">
                      <div className="alert alert-success">
                        <strong>File đã chọn:</strong> {excelFile.name}
                      </div>
                    </div>
                  )}
                  <div className="alert alert-info">
                    <strong>Hướng dẫn:</strong> Upload file Excel (.xlsx, .xls) với các cột: "name" hoặc "Tên" (bắt buộc), "description" hoặc "Mô tả" (tùy chọn).
                  </div>
                  <div className="alert alert-secondary">
                    <strong>Ví dụ cấu trúc file Excel:</strong><br/>
                    | name | description |<br/>
                    | Điện thoại | Các loại điện thoại di động |<br/>
                    | Laptop | Máy tính xách tay |
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setIsBulkUploadModalOpen(false)}>Hủy</button>
                  <button className="btn btn-success" onClick={handleBulkUpload} disabled={!excelFile}>Upload</button>
                </div>
              </div></div>
            </div>
        )}
      </>
  );
};