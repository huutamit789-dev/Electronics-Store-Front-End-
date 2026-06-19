import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Product, ProductApiResponse } from '@/types/product';

interface Category {
  _id: string;
  name: string;
}

export const ProductManagementPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const confirmDeleteProduct = (productId: string) => {
    const product = products.find(p => p._id === productId);
    if (product) {
      setCurrentProduct(product);
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await axios.delete(`http://localhost:8090/api/products/${currentProduct._id}`);
      setIsDeleteModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Lỗi khi xóa sản phẩm:', err);
      alert('Xóa sản phẩm thất bại!');
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleAdd = async () => {
    try {
      let productToAdd = { ...newProduct };
      
      if (newImageFile) {
        const base64Image = await convertFileToBase64(newImageFile);
        productToAdd = { ...productToAdd, image_url: base64Image };
      }
      
      await axios.post('http://localhost:8090/api/products', productToAdd);
      setIsAddModalOpen(false);
      setNewProduct({ name: '', description: '', price: 0, stock_quantity: 0, image_url: '', cate_id: '' });
      setNewImageFile(null);
      fetchProducts();
    } catch (err) {
      console.error('Lỗi khi thêm sản phẩm:', err);
      alert('Thêm sản phẩm thất bại!');
    }
  };

  const handleUpdate = async () => {
    try {
      let productToUpdate = { ...currentProduct };
      
      if (editImageFile) {
        const base64Image = await convertFileToBase64(editImageFile);
        productToUpdate = { ...productToUpdate, image_url: base64Image };
      }
      
      await axios.put(`http://localhost:8090/api/products/${currentProduct._id}`, productToUpdate);
      setIsEditModalOpen(false);
      setEditImageFile(null);
      fetchProducts();
    } catch (err) {
      console.error('Lỗi khi cập nhật sản phẩm:', err);
      alert('Cập nhật sản phẩm thất bại!');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ProductApiResponse>('http://localhost:8090/api/products/getAllProduct');
      const fetchedProducts: Product[] = response.data.data.products || [];
      setProducts(fetchedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

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

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Lỗi!</h4>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="h3 mb-4 text-gray-800">Quản lý Sản phẩm</h1>
      <button type="button" className="btn btn-primary mb-3" onClick={handleAddProduct}>
        <i className="fas fa-plus me-2"></i> Thêm sản phẩm mới
      </button>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Danh sách Sản phẩm</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th>ID</th>
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
                    <td><span className="d-inline-block text-truncate" style={{ maxWidth: '100px' }}>{product._id}</span></td>
                    <td>{product.name}</td>
                    <td>{product.price.toLocaleString()} VNĐ</td>
                    <td>{product.stock_quantity}</td>
                    <td>{typeof product.cate_id === 'object' ? product.cate_id.name : product.cate_id}</td>
                    <td>
                      <img src={product.image_url} alt={product.name} className="img-thumbnail" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
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
        </div>
      </div>

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
                <input 
                  className="form-control" 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setNewImageFile(file);
                  }}
                />
                {newImageFile && (
                  <img 
                    src={URL.createObjectURL(newImageFile)} 
                    alt="Preview" 
                    className="img-thumbnail mt-2" 
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
                  />
                )}
              </div>
              <input className="form-control" placeholder="ID danh mục" value={newProduct.cate_id} onChange={(e) => setNewProduct({...newProduct, cate_id: e.target.value})} />
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
                <input 
                  className="form-control" 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setEditImageFile(file);
                  }}
                />
                {editImageFile ? (
                  <img 
                    src={URL.createObjectURL(editImageFile)} 
                    alt="Preview" 
                    className="img-thumbnail mt-2" 
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
                  />
                ) : currentProduct.image_url && (
                  <img 
                    src={currentProduct.image_url} 
                    alt="Current" 
                    className="img-thumbnail mt-2" 
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
                  />
                )}
              </div>
              <input className="form-control" placeholder="ID danh mục" value={typeof currentProduct.cate_id === 'object' ? currentProduct.cate_id._id : currentProduct.cate_id} onChange={(e) => setCurrentProduct({...currentProduct, cate_id: e.target.value})} />
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