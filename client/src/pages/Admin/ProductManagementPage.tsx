import React, { useEffect, useState } from 'react';
import { Product, ProductApiResponse } from '@/types/product';
import axiosClient from "@/api/axiosClient";
import imageCompression from 'browser-image-compression';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { API_BASE_URL } from '@/config/constants';
import { formatCurrency, parseCurrency } from '@/lib/formatters';

export const ProductManagementPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // States cho phân trang
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [productsPerPage, setProductsPerPage] = useState<number>(10); // Số sản phẩm trên mỗi trang
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Hiển thị giá dưới dạng chuỗi để format với dấu phẩy (thousand separators)
  const [newPriceDisplay, setNewPriceDisplay] = useState<string>('');
  const [editPriceDisplay, setEditPriceDisplay] = useState<string>('');

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
    images: [],
    cate_id: '',
    __v: 0
  });
  const [newProduct, setNewProduct] = useState<{
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    image_url: string;
    images: string[];
    cate_id: string;
  }>({
    name: '',
    description: '',
    price: 0,
    stock_quantity: 0,
    image_url: '',
    images: [],
    cate_id: ''
  });

  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
// 1. Thêm state để lưu danh mục
  const [categories, setCategories] = useState<any[]>([]);
  // useEffect(() => { // Đã gộp vào useEffect chính
  //   fetchProducts();
  // }, []);
  const response =  axiosClient.get(`${API_BASE_URL}/categories`);

  const handleAddProduct = () => {
    setNewPriceDisplay('');
    setNewImageFiles([]);
    setIsAddModalOpen(true);
  };

  const handleEditProduct = (productId: string) => {
    const product = products.find(p => p._id === productId);
    if (product) {
      setCurrentProduct(product);
      setEditImageFile(null);
      setEditImageFiles([]);
      // set edit price display
      setEditPriceDisplay(formatCurrency(product.price || 0));
      setIsEditModalOpen(true);
    }
  };
// 2. Thêm hàm fetchCategories
  const fetchCategories = async () => {
    try {
      const response = await axiosClient.get(`${API_BASE_URL}/categories`); // Thay đổi endpoint này phù hợp với API của bạn
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
      await axiosClient.delete(`${API_BASE_URL}/products/${currentProduct._id}`);
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

  // Hàm upload nhiều ảnh
  const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(file => uploadImageAndGetUrl(file));
    return Promise.all(uploadPromises);
  };

  const handleAdd = async () => {
    try {
      // parse and validate price and quantity
      const priceValue = parseCurrency(newPriceDisplay) || newProduct.price;
      if (priceValue <= 0) {
        toast.error('Giá sản phẩm phải lớn hơn 0');
        return;
      }
      if ((newProduct.stock_quantity || 0) <= 0) {
        toast.error('Số lượng tồn kho phải lớn hơn 0');
        return;
      }

      let productToAdd = { ...newProduct, price: priceValue };

      // Upload ảnh chính
      if (newImageFile) {
        const imageUrl = await uploadImageAndGetUrl(newImageFile);
        productToAdd = { ...productToAdd, image_url: imageUrl };
      }

      // Upload nhiều ảnh phụ
      if (newImageFiles.length > 0) {
        const imageUrls = await uploadMultipleImages(newImageFiles);
        productToAdd = { ...productToAdd, images: imageUrls };
      }

      await axiosClient.post(`${API_BASE_URL}/products`, productToAdd);
      setIsAddModalOpen(false);
      setNewProduct({ name: '', description: '', price: 0, stock_quantity: 0, image_url: '', images: [], cate_id: '' });
      setNewPriceDisplay('');
      setNewImageFile(null);
      setNewImageFiles([]);
      fetchProducts(currentPage, productsPerPage); // Cập nhật lại danh sách sản phẩm sau khi thêm
      toast.success('Thêm sản phẩm thành công!'); // Thông báo thành công bằng toast
    } catch (err) {
      console.error('Lỗi khi thêm sản phẩm:', err);
      toast.error('Thêm sản phẩm thất bại!'); // Thông báo lỗi bằng toast
    }
  };

  const handleUpdate = async () => {
    try {
      // parse and validate price and quantity
      const priceValue = parseCurrency(editPriceDisplay) || currentProduct.price;
      if (priceValue <= 0) {
        toast.error('Giá sản phẩm phải lớn hơn 0');
        return;
      }
      if ((currentProduct.stock_quantity || 0) <= 0) {
        toast.error('Số lượng tồn kho phải lớn hơn 0');
        return;
      }

      let productToUpdate = { ...currentProduct, price: priceValue };

      // Upload ảnh chính
      if (editImageFile) {
        const imageUrl = await uploadImageAndGetUrl(editImageFile);
        productToUpdate = { ...productToUpdate, image_url: imageUrl };
      }

      // Upload nhiều ảnh phụ
      if (editImageFiles.length > 0) {
        const imageUrls = await uploadMultipleImages(editImageFiles);
        productToUpdate = { ...productToUpdate, images: imageUrls };
      }

      await axiosClient.put(`${API_BASE_URL}/products/${currentProduct._id}`, productToUpdate);
      setIsEditModalOpen(false);
      setEditImageFile(null);
      setEditImageFiles([]);
      setEditPriceDisplay('');
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
      const response = await axiosClient.get<ProductApiResponse>(`${API_BASE_URL}/products/getAllProduct?page=${page}&limit=${limit}`);
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

  const filteredProducts = products.filter((product) => {
    const keyword = searchTerm.toLowerCase();
    return (
      product.name?.toLowerCase().includes(keyword) ||
      product.description?.toLowerCase().includes(keyword) ||
      (typeof product.cate_id === 'object' ? product.cate_id.name : String(product.cate_id)).toLowerCase().includes(keyword)
    );
  });

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
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <h1 className="h3 text-gray-800 mb-0">Quản lý Sản phẩm</h1>
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-primary flex-shrink-0" onClick={handleAddProduct}>
            <i className="fas fa-plus me-2"></i> Thêm sản phẩm mới
          </button>
        </div>
      </div>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Danh sách Sản phẩm</h6>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-12 col-md-4 ms-auto">
              <div className="input-group">
                <span className="input-group-text"><i className="fas fa-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm sản phẩm..."
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
                {filteredProducts.map((product) => (
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
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2">
            <div className="text-center text-md-start">
              <small className="d-block d-md-inline">Hiển thị {filteredProducts.length} trên {totalProducts} sản phẩm (Trang {currentPage} / {totalPages})</small>
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
      {/* MODAL THÊM MỚI */}
      {isAddModalOpen && (
          <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog"><div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Thêm sản phẩm</h5></div>
              <div className="modal-body">
                <input className="form-control mb-2" placeholder="Tên sản phẩm" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
                <textarea className="form-control mb-2" placeholder="Mô tả" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} />
                {/* Thay bằng input dạng text để hiển thị format với dấu phẩy */}
                <input
                  className="form-control mb-2"
                  type="text"
                  inputMode="numeric"
                  placeholder="Giá"
                  value={newPriceDisplay}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/[^0-9]/g, '');
                    if (!digits) {
                      setNewPriceDisplay('');
                      setNewProduct({ ...newProduct, price: 0 });
                      return;
                    }
                    const parsed = Number(digits);
                    setNewProduct({ ...newProduct, price: parsed });
                    setNewPriceDisplay(formatCurrency(parsed));
                  }}
                  onBlur={() => setNewPriceDisplay((s) => formatCurrency(parseCurrency(s)))}
                />
                <input
                  className="form-control mb-2"
                  type="number"
                  min={0}
                  placeholder="Số lượng tồn kho"
                  value={newProduct.stock_quantity}
                  onChange={(e) => {
                    const raw = String(e.target.value).replace(/[^0-9]/g, '');
                    const cleaned = raw.replace(/^0+(?=\d)/, '');
                    setNewProduct({ ...newProduct, stock_quantity: cleaned === '' ? 0 : Number(cleaned) });
                  }}
                />
                {/* Validate: nếu muốn hiển thị lỗi ngay lập tức có thể thêm message dưới đây */}
                <div className="mb-2">
                  <label className="form-label">Hình ảnh chính</label>
                  <input className="form-control" type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) setNewImageFile(file); }} />
                  {newImageFile && <img src={URL.createObjectURL(newImageFile)} alt="Preview" className="img-thumbnail mt-2" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />}
                </div>
                <div className="mb-2">
                  <label className="form-label">Hình ảnh phụ (nhiều ảnh)</label>
                  <input 
                    className="form-control" 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={(e) => { 
                      const files = Array.from(e.target.files || []); 
                      setNewImageFiles(files); 
                    }} 
                  />
                  <div className="mt-2 d-flex gap-2 flex-wrap">
                    {newImageFiles.map((file, index) => (
                      <img 
                        key={index} 
                        src={URL.createObjectURL(file)} 
                        alt={`Preview ${index}`} 
                        className="img-thumbnail" 
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }} 
                      />
                    ))}
                  </div>
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
                <button className="btn btn-secondary" onClick={() => { setIsAddModalOpen(false); setNewImageFile(null); setNewImageFiles([]); }}>Hủy</button>
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
                {/* Use formatted input for edit price */}
                <input
                  className="form-control mb-2"
                  type="text"
                  inputMode="numeric"
                  placeholder="Giá"
                  value={editPriceDisplay}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/[^0-9]/g, '');
                    if (!digits) {
                      setEditPriceDisplay('');
                      setCurrentProduct({ ...currentProduct, price: 0 });
                      return;
                    }
                    const parsed = Number(digits);
                    setCurrentProduct({ ...currentProduct, price: parsed });
                    setEditPriceDisplay(formatCurrency(parsed));
                  }}
                  onBlur={() => setEditPriceDisplay((s) => formatCurrency(parseCurrency(s)))}
                />
                <input
                  className="form-control mb-2"
                  type="number"
                  min={0}
                  placeholder="Số lượng tồn kho"
                  value={currentProduct.stock_quantity}
                  onChange={(e) => {
                    const raw = String(e.target.value).replace(/[^0-9]/g, '');
                    const cleaned = raw.replace(/^0+(?=\d)/, '');
                    setCurrentProduct({ ...currentProduct, stock_quantity: cleaned === '' ? 0 : Number(cleaned) });
                  }}
                />
                <div className="mb-2">
                  <label className="form-label">Hình ảnh chính</label>
                  <input className="form-control" type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) setEditImageFile(file); }} />
                  {editImageFile ? <img src={URL.createObjectURL(editImageFile)} alt="Preview" className="img-thumbnail mt-2" style={{ width: '100px', height: '100px', objectFit: 'cover' }} /> : currentProduct.image_url && <img src={currentProduct.image_url} alt="Current" className="img-thumbnail mt-2" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />}
                </div>
                <div className="mb-2">
                  <label className="form-label">Hình ảnh phụ (nhiều ảnh)</label>
                  <input 
                    className="form-control" 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={(e) => { 
                      const files = Array.from(e.target.files || []); 
                      setEditImageFiles(files); 
                    }} 
                  />
                  <div className="mt-2 d-flex gap-2 flex-wrap">
                    {editImageFiles.length > 0 ? (
                      editImageFiles.map((file, index) => (
                        <img 
                          key={index} 
                          src={URL.createObjectURL(file)} 
                          alt={`Preview ${index}`} 
                          className="img-thumbnail" 
                          style={{ width: '80px', height: '80px', objectFit: 'cover' }} 
                        />
                      ))
                    ) : currentProduct.images && currentProduct.images.length > 0 ? (
                      currentProduct.images.map((img, index) => (
                        <img 
                          key={index} 
                          src={img} 
                          alt={`Current ${index}`} 
                          className="img-thumbnail" 
                          style={{ width: '80px', height: '80px', objectFit: 'cover' }} 
                        />
                      ))
                    ) : null}
                  </div>
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
                <button className="btn btn-secondary" onClick={() => { setIsEditModalOpen(false); setEditImageFile(null); setEditImageFiles([]); }}>Hủy</button>
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