import React, { useEffect, useState } from 'react';
import { Product, ProductApiResponse } from '@/types/product';
import axiosClient from "@/api/axiosClient";
import imageCompression from 'browser-image-compression'; // Import thư viện nén ảnh
import axios from 'axios'; // Import axios
import toast, { Toaster } from 'react-hot-toast'; // Import toast và Toaster

export const ProductManagementPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // States cho phân trang
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [productsPerPage, setProductsPerPage] = useState<number>(10); // Số sản phẩm trên mỗi trang
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // States cho các Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // States cho dữ liệu
  const [currentProduct, setCurrentProduct] = useState<Product>({
    _id: '',
    name: '',
    description: '',
    price: 0,
    stock_quantity: 0,
    image_url: '',
    cate_id: '',
    __v: 0
  });
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    stock_quantity: 0,
    image_url: '',
    cate_id: ''
  });
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
// 1. Thêm state để lưu danh mục
  const [categories, setCategories] = useState<any[]>([]);
  // useEffect(() => { // Đã gộp vào useEffect chính
  //   fetchProducts();
  // }, []);
  const response =  axiosClient.get('http://localhost:8090/api/categories');

  const handleAddProduct = () => {
    setIsAddModalOpen(true);
  };

  const handleEditProduct = (productId: string) => {
    const product = products.find(p => p._id === productId);
    if (product) {
      setCurrentProduct(product);
      setEditImageFile(null);
      setIsEditModalOpen(true);
    }
  };
// 2. Thêm hàm fetchCategories
  const fetchCategories = async () => {
    try {
      const response = await axiosClient.get('http://localhost:8090/api/categories'); // Thay đổi endpoint này phù hợp với API của bạn
      setCategories(response.data.data.categories); // Điều chỉnh đường dẫn data tùy theo response thực tế
    } catch (err) {
      console.error('Lỗi khi lấy danh mục:', err);
      toast.error('Lỗi khi tải danh mục!'); // Thông báo lỗi bằng toast
    }
  };

// 3. Gọi fetchCategories trong useEffect
  useEffect(() => {
    fetchProducts(currentPage, productsPerPage); // Gọi fetchProducts với trang hiện tại và giới hạn
    fetchCategories();
  }, [currentPage, productsPerPage]); // Thêm currentPage và productsPerPage vào dependency array

  const confirmDeleteProduct = (productId: string) => {
    const product = products.find(p => p._id === productId);
    if (product) {
      setCurrentProduct(product);
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await axiosClient.delete(`http://localhost:8090/api/products/${currentProduct._id}`);
      setIsDeleteModalOpen(false);
      fetchProducts(currentPage, productsPerPage); // Cập nhật lại danh sách sản phẩm sau khi xóa
      toast.success('Xóa sản phẩm thành công!'); // Thông báo thành công bằng toast
    } catch (err) {
      console.error('Lỗi khi xóa sản phẩm:', err);
      toast.error('Xóa sản phẩm thất bại!'); // Thông báo lỗi bằng toast
    }
  };

  // Hàm mới để tải hình ảnh lên dịch vụ bên ngoài và lấy URL
  const uploadImageAndGetUrl = async (file: File): Promise<string> => {
    try {
      // --- BẮT ĐẦU PHẦN BẠN CẦN THAY THẾ BẰNG LOGIC TẢI LÊN THỰC TẾ ---
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'tamit789'); // Dùng upload preset từ Cloudinary dashboard
      const cloudinaryUploadUrl = 'https://api.cloudinary.com/v1_1/ds51sgdnl/image/upload'; // Đã cập nhật Cloud Name

      const uploadResponse = await axios.post(cloudinaryUploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Cloudinary trả về URL của hình ảnh đã tải lên trong uploadResponse.data.secure_url
      return uploadResponse.data.secure_url;
      // --- KẾT THÚC PHẦN CẦN THAY THẾ ---

    } catch (error) {
      console.error('Lỗi khi tải lên hình ảnh:', error);
      toast.error('Lỗi khi tải lên hình ảnh!'); // Thông báo lỗi bằng toast
      throw error;
    }
  };

  const handleAdd = async () => {
    try {
      let productToAdd = { ...newProduct };
      
      if (newImageFile) {
        const imageUrl = await uploadImageAndGetUrl(newImageFile);
        productToAdd = { ...productToAdd, image_url: imageUrl };
      }
      
      await axiosClient.post('http://localhost:8090/api/products', productToAdd);
      setIsAddModalOpen(false);
      setNewProduct({ name: '', description: '', price: 0, stock_quantity: 0, image_url: '', cate_id: '' });
      setNewImageFile(null);
      fetchProducts(currentPage, productsPerPage); // Cập nhật lại danh sách sản phẩm sau khi thêm
      toast.success('Thêm sản phẩm thành công!'); // Thông báo thành công bằng toast
    } catch (err) {
      console.error('Lỗi khi thêm sản phẩm:', err);
      toast.error('Thêm sản phẩm thất bại!'); // Thông báo lỗi bằng toast
    }
  };

  const handleUpdate = async () => {
    try {
      let productToUpdate = { ...currentProduct };
      
      if (editImageFile) {
        const imageUrl = await uploadImageAndGetUrl(editImageFile);
        productToUpdate = { ...productToUpdate, image_url: imageUrl };
      }
      
      await axiosClient.put(`http://localhost:8090/api/products/${currentProduct._id}`, productToUpdate);
      setIsEditModalOpen(false);
      setEditImageFile(null);
      fetchProducts(currentPage, productsPerPage); // Cập nhật lại danh sách sản phẩm sau khi cập nhật
      toast.success('Cập nhật sản phẩm thành công!'); // Thông báo thành công bằng toast
    } catch (err) {
      console.error('Lỗi khi cập nhật sản phẩm:', err);
      toast.error('Cập nhật sản phẩm thất bại!'); // Thông báo lỗi bằng toast
    }
  };
console.log("pruct filter", products)
  const fetchProducts = async (page: number, limit: number) => {
    try {
      setLoading(true);
      const response = await axiosClient.get<ProductApiResponse>(`http://localhost:8090/api/products/getAllProduct?page=${page}&limit=${limit}`);
      const fetchedProducts: Product[] = response.data.data.products || [];
      setProducts(fetchedProducts);
      setTotalProducts(response.data.data.total);
      setCurrentPage(response.data.data.currentPage);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Failed to load products. Please try again later.'); // Thông báo lỗi bằng toast
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // const handleLogout = () => { // Đã di chuyển sang AdminDashboardPage
  //   // Xóa token xác thực khỏi localStorage
  //   localStorage.removeItem('authToken'); // Giả định token được lưu với key 'authToken'
  //   // Chuyển hướng người dùng đến trang đăng nhập
  //   window.location.href = '/login'; // Giả định trang đăng nhập là '/login'
  // };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải sản phẩm...</span>
        </div>
        <span className="ms-2">Đang tải sản phẩm...</span>
      </div>
    );
  }

  return (
    <>
      <Toaster /> {/* Component Toaster để hiển thị các toast */}
      <h1 className="h3 mb-4 text-gray-800">Quản lý Sản phẩm</h1>
      <div className="d-flex justify-content-between mb-3">
        <div>
          <button type="button" className="btn btn-primary me-2" onClick={handleAddProduct}>
            <i className="fas fa-plus me-2"></i> Thêm sản phẩm mới
          </button>
          {/* <button type="button" className="btn btn-danger" onClick={handleLogout}> // Đã di chuyển sang AdminDashboardPage
            <i className="fas fa-sign-out-alt me-2"></i> Đăng xuất
          </button> */}
        </div>
      </div>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Danh sách Sản phẩm</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th hidden>ID</th>
                  <th>Tên sản phẩm</th>
                  <th>Giá</th>
                  <th>Số lượng tồn kho</th>
                  <th>Danh mục</th>
                  <th>Hình ảnh</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td hidden><span className="d-inline-block text-truncate" style={{ maxWidth: '100px' }}>{product._id}</span></td>
                    <td>{product.name}</td>
                    <td>{product.price.toLocaleString()} VNĐ</td>
                    <td>{product.stock_quantity}</td>
                    <td>{typeof product.cate_id === 'object' ? product.cate_id.name : product.cate_id}</td>
                    <td>
                      {product.image_url && <img src={product.image_url} alt={product.name} className="img-thumbnail" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />}
                    </td>
                    <td>
                      <button type="button" className="btn btn-warning btn-sm me-2" onClick={() => handleEditProduct(product._id)}>
                        <i className="fas fa-edit"></i> Sửa
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => confirmDeleteProduct(product._id)}>
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
              Hiển thị {products.length} trên {totalProducts} sản phẩm (Trang {currentPage} / {totalPages})
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
      {/* MODAL THÊM MỚI */}
      {isAddModalOpen && (
          <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog"><div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Thêm sản phẩm</h5></div>
              <div className="modal-body">
                <input className="form-control mb-2" placeholder="Tên sản phẩm" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
                <textarea className="form-control mb-2" placeholder="Mô tả" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} />
                <input className="form-control mb-2" type="number" placeholder="Giá" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})} />
                <input className="form-control mb-2" type="number" placeholder="Số lượng tồn kho" value={newProduct.stock_quantity} onChange={(e) => setNewProduct({...newProduct, stock_quantity: Number(e.target.value)})} />
                <div className="mb-2">
                  <label className="form-label">Hình ảnh</label>
                  <input className="form-control" type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) setNewImageFile(file); }} />
                  {newImageFile && <img src={URL.createObjectURL(newImageFile)} alt="Preview" className="img-thumbnail mt-2" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />}
                </div>
                <div className="mb-2">
                  <label className="form-label">Danh mục</label>
                  <select className="form-select" value={newProduct.cate_id} onChange={(e) => setNewProduct({...newProduct, cate_id: e.target.value})}>
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => { setIsAddModalOpen(false); setNewImageFile(null); }}>Hủy</button>
                <button className="btn btn-primary" onClick={handleAdd}>Thêm</button>
              </div>
            </div></div>
          </div>
      )}

      {/* MODAL SỬA */}
      {isEditModalOpen && (
          <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog"><div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Chỉnh sửa sản phẩm</h5></div>
              <div className="modal-body">
                <input className="form-control mb-2" placeholder="Tên sản phẩm" value={currentProduct.name} onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})} />
                <textarea className="form-control mb-2" placeholder="Mô tả" value={currentProduct.description} onChange={(e) => setCurrentProduct({...currentProduct, description: e.target.value})} />
                <input className="form-control mb-2" type="number" placeholder="Giá" value={currentProduct.price} onChange={(e) => setCurrentProduct({...currentProduct, price: Number(e.target.value)})} />
                <input className="form-control mb-2" type="number" placeholder="Số lượng tồn kho" value={currentProduct.stock_quantity} onChange={(e) => setCurrentProduct({...currentProduct, stock_quantity: Number(e.target.value)})} />
                <div className="mb-2">
                  <label className="form-label">Hình ảnh</label>
                  <input className="form-control" type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) setEditImageFile(file); }} />
                  {editImageFile ? <img src={URL.createObjectURL(editImageFile)} alt="Preview" className="img-thumbnail mt-2" style={{ width: '100px', height: '100px', objectFit: 'cover' }} /> : currentProduct.image_url && <img src={currentProduct.image_url} alt="Current" className="img-thumbnail mt-2" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />}
                </div>
                <div className="mb-2">
                  <label className="form-label">Danh mục</label>
                  <select className="form-select" value={typeof currentProduct.cate_id === 'object' && currentProduct.cate_id !== null ? (currentProduct.cate_id as any)._id : currentProduct.cate_id} onChange={(e) => setCurrentProduct({...currentProduct, cate_id: e.target.value})}>
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => { setIsEditModalOpen(false); setEditImageFile(null); }}>Hủy</button>
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
            <div className="modal-body">Bạn có chắc chắn muốn xóa <strong>{currentProduct.name}</strong> không?</div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Hủy</button>
              <button className="btn btn-danger" onClick={handleDeleteProduct}>Xóa</button>
            </div>
          </div></div>
        </div>
      )}
    </>
  );
};