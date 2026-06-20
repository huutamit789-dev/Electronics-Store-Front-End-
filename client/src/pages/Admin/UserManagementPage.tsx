import React, { useEffect, useState } from 'react';
import axiosClient from "@/api/axiosClient";
import toast, { Toaster } from 'react-hot-toast';
import { API_BASE_URL } from '@/config/constants'; // Import toast và Toaster

// Định nghĩa kiểu dữ liệu cho User
interface User {
  _id: string;
  username: string;
  email: string;
  role: string; // Ví dụ: 'admin', 'user'
  // Thêm các trường khác nếu có
}

// Định nghĩa kiểu dữ liệu cho User API Response (đã cập nhật)
interface UserApiResponse {
    success: boolean;
    message: string;
    data: {
      users: User[];
      total: number;
      currentPage: number;
      totalPages: number;
    };
}

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null); // Không cần state error riêng nữa

  // States cho phân trang
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [usersPerPage, setUsersPerPage] = useState<number>(10); // Số người dùng trên mỗi trang
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // States cho các Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // States cho dữ liệu
  const [currentUser, setCurrentUser] = useState<User>({ _id: '', username: '', email: '', role: '' });
  const [newUser, setNewUser] = useState({ username: '', email: '', role: '' });

  useEffect(() => {
    fetchUsers(currentPage, usersPerPage);
  }, [currentPage, usersPerPage]);

  const fetchUsers = async (page: number, limit: number) => {
    try {
      setLoading(true);
      const response = await axiosClient.get<UserApiResponse>(`${API_BASE_URL}/users?page=${page}&limit=${limit}`);
      console.log("user data", response);
      setUsers(response.data.data?.users || []); // Lấy mảng users từ data.data.users
      setTotalUsers(response.data.data.total);
      setCurrentPage(response.data.data.currentPage);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users. Please try again later.'); // Thông báo lỗi bằng toast
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setIsAddModalOpen(true);
  };

  const handleAdd = async () => {
    try {
      await axiosClient.post(`${API_BASE_URL}/users`, newUser);
      setIsAddModalOpen(false);
      setNewUser({ username: '', email: '', role: '' });
      fetchUsers(currentPage, usersPerPage); // Cập nhật lại danh sách sau khi thêm
      toast.success('Thêm người dùng thành công!'); // Thông báo thành công bằng toast
    } catch (err) {
      console.error('Lỗi khi thêm người dùng:', err);
      toast.error('Thêm người dùng thất bại!'); // Thông báo lỗi bằng toast
    }
  };

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u._id === userId);
    if (user) {
      setCurrentUser(user);
      setIsEditModalOpen(true);
    }
  };

  const handleUpdate = async () => {
    try {
      await axiosClient.put(`${API_BASE_URL}/users/${currentUser._id}`, currentUser);
      setIsEditModalOpen(false);
      fetchUsers(currentPage, usersPerPage); // Cập nhật lại danh sách sau khi cập nhật
      toast.success('Cập nhật người dùng thành công!'); // Thông báo thành công bằng toast
    } catch (err) {
      console.error('Lỗi khi cập nhật người dùng:', err);
      toast.error('Cập nhật người dùng thất bại!'); // Thông báo lỗi bằng toast
    }
  };

  const confirmDeleteUser = (userId: string) => {
    const user = users.find(u => u._id === userId);
    if (user) {
      setCurrentUser(user);
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await axiosClient.delete(`${API_BASE_URL}/users/${currentUser._id}`);
      setIsDeleteModalOpen(false);
      fetchUsers(currentPage, usersPerPage); // Cập nhật lại danh sách sau khi xóa
      toast.success('Xóa người dùng thành công!'); // Thông báo thành công bằng toast
    } catch (err) {
      console.error('Lỗi khi xóa người dùng:', err);
      toast.error('Xóa người dùng thất bại!'); // Thông báo lỗi bằng toast
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải người dùng...</span>
        </div>
        <span className="ms-2">Đang tải người dùng...</span>
      </div>
    );
  }

  // if (error) { // Đã thay thế bằng toast.error
  //   return (
  //     <div className="alert alert-danger" role="alert">
  //       <h4 className="alert-heading">Lỗi!</h4>
  //       <p>{error}</p>
  //     </div>
  //   );
  // }

  return (
    <>
      <Toaster /> {/* Component Toaster để hiển thị các toast */}
      <h1 className="h3 mb-4 text-gray-800">Quản lý Người dùng</h1>
      <button type="button" className="btn btn-primary mb-3" onClick={handleAddUser}>
        <i className="fas fa-plus me-2"></i> Thêm người dùng mới
      </button>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Danh sách Người dùng</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th hidden>ID</th>
                  <th>Tên đăng nhập</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td hidden><span className="d-inline-block text-truncate" style={{ maxWidth: '100px' }}>{user._id}</span></td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <button type="button" className="btn btn-warning btn-sm me-2" onClick={() => handleEditUser(user._id)}>
                        <i className="fas fa-edit"></i> Sửa
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => confirmDeleteUser(user._id)}>
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
              Hiển thị {users.length} trên {totalUsers} người dùng (Trang {currentPage} / {totalPages})
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
            <div className="modal-header"><h5 className="modal-title">Thêm người dùng</h5></div>
            <div className="modal-body">
              <input className="form-control mb-2" placeholder="Tên đăng nhập" value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} />
              <input className="form-control mb-2" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
              <input className="form-control" placeholder="Vai trò (admin/user)" value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} />
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
            <div className="modal-header"><h5 className="modal-title">Chỉnh sửa người dùng</h5></div>
            <div className="modal-body">
              <input className="form-control mb-2" placeholder="Tên đăng nhập" value={currentUser.username} onChange={(e) => setCurrentUser({...currentUser, username: e.target.value})} />
              <input className="form-control mb-2" placeholder="Email" value={currentUser.email} onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})} />
              <input className="form-control" placeholder="Vai trò (admin/user)" value={currentUser.role} onChange={(e) => setCurrentUser({...currentUser, role: e.target.value})} />
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
            <div className="modal-body">Bạn có chắc chắn muốn xóa người dùng <strong>{currentUser.username}</strong> không?</div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Hủy</button>
              <button className="btn btn-danger" onClick={handleDeleteUser}>Xóa</button>
            </div>
          </div></div>
        </div>
      )}
    </>
  );
};