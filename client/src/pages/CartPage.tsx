import React, { useEffect, useState } from 'react';
// Xóa các import Ant Design
// import { Table, Button, Space, Typography, Spin, Alert, InputNumber, Image } from 'antd';
// import { DeleteOutlined, MinusOutlined, PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import axios from 'axios';
import { CustomHeader } from '@/components/layout/Header'; // Giả định CustomHeader vẫn dùng

// Định nghĩa kiểu dữ liệu cho Cart Item
interface CartItem {
  _id: string; // ID của item trong giỏ hàng
  product_id: string;
  name: string;
  image_url: string;
  price: number;
  quantity: number;
}

// Định nghĩa kiểu dữ liệu cho Cart API Response
interface CartApiResponse {
    success: boolean;
    message: string;
    data: {
        items: CartItem[];
        total_price: number;
    };
}

export const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      // Endpoint: GET /api/cart
      const response = await axios.get<CartApiResponse>('http://localhost:8090/api/cart');
      setCartItems(response.data.data?.items || []);
      setTotalPrice(response.data.data?.total_price || 0);
      console.log('Fetched cart:', response.data.data);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart. Please ensure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    console.log(`Event: Update quantity for item ${itemId} to ${quantity}`);
    try {
      // Endpoint: PUT /api/cart/update
      await axios.put('http://localhost:8090/api/cart/update', { item_id: itemId, quantity });
      fetchCart(); // Fetch lại giỏ hàng sau khi cập nhật
    } catch (err) {
      console.error('Error updating cart item quantity:', err);
      setError('Failed to update item quantity.');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    console.log('Event: Remove item button clicked for item ID:', itemId);
    try {
      // Endpoint: POST /api/cart/remove (hoặc DELETE /api/cart/:itemId)
      // Giả định API dùng POST với body { item_id: itemId }
      await axios.post('http://localhost:8090/api/cart/remove', { item_id: itemId });
      fetchCart(); // Fetch lại giỏ hàng sau khi xóa
    } catch (err) {
      console.error('Error removing cart item:', err);
      setError('Failed to remove item from cart.');
    }
  };

  const handleClearCart = async () => {
    console.log('Event: Clear cart button clicked');
    try {
      // Endpoint: POST /api/cart/clear
      await axios.post('http://localhost:8090/api/cart/clear');
      fetchCart(); // Fetch lại giỏ hàng sau khi xóa sạch
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Failed to clear cart.');
    }
  };

  const handleCheckout = () => {
    console.log('Event: Checkout button clicked');
    // Logic để chuyển hướng đến trang thanh toán
  };

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <CustomHeader />
        <div className="container flex-grow-1 d-flex justify-content-center align-items-center" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải giỏ hàng...</span>
          </div>
          <span className="ms-2">Đang tải giỏ hàng...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <CustomHeader />
        <div className="container flex-grow-1" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Lỗi!</h4>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <CustomHeader />
      <div className="container flex-grow-1" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
        <h1 className="mb-4">Giỏ hàng của bạn</h1>
        {cartItems.length === 0 ? (
          <div className="alert alert-info" role="alert">
            <h4 className="alert-heading">Giỏ hàng trống!</h4>
            <p>Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy bắt đầu mua sắm!</p>
          </div>
        ) : (
          <>
            <div className="table-responsive mb-3">
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Tổng cộng</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img src={item.image_url} alt={item.name} className="img-thumbnail me-2" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td>{item.price.toLocaleString()} VNĐ</td>
                      <td>
                        <div className="input-group" style={{ width: '120px' }}>
                          <button className="btn btn-outline-secondary" type="button" onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}>
                            <i className="fas fa-minus"></i>
                          </button>
                          <input
                            type="number"
                            className="form-control text-center"
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item._id, parseInt(e.target.value) || 1)}
                            min="1"
                          />
                          <button className="btn btn-outline-secondary" type="button" onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}>
                            <i className="fas fa-plus"></i>
                          </button>
                        </div>
                      </td>
                      <td>{(item.price * item.quantity).toLocaleString()} VNĐ</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleRemoveItem(item._id)}>
                          <i className="fas fa-trash"></i> Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan={3} className="text-end">Tổng cộng:</th>
                    <th>{totalPrice.toLocaleString()} VNĐ</th>
                    <th>
                      <button className="btn btn-secondary btn-sm" onClick={handleClearCart}>
                        <i className="fas fa-trash-alt"></i> Xóa tất cả
                      </button>
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="text-end">
              <button className="btn btn-primary btn-lg" onClick={handleCheckout}>
                <i className="fas fa-shopping-cart me-2"></i> Tiến hành thanh toán
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};