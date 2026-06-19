import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { cartService } from '@/features/cart/services/cartService';
import { CreateOrderRequest } from '@/types/order';
import { CartItem } from '@/types/order';
import { CustomHeader } from '@/components/layout/Header';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, getTotalAmount } = useCartStore();
  const { isLoggedIn, user } = useAuthStore();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
  };

  const handleClearCart = () => {
    clearCart();
  };

  const handleCheckout = async () => {
    // Check if user is logged in
    if (!isLoggedIn || !user) {
      alert('Bạn cần đăng nhập để thanh toán!');
      navigate('/');
      return;
    }

    setIsProcessing(true);
    try {
      const orderData: CreateOrderRequest = {
        userId: user.username, // Using username as userId since we don't have user._id
        username: user.username,
        items: items,
        totalAmount: getTotalAmount(),
      };

      await cartService.createOrder(orderData);
      clearCart();
      alert('Đặt hàng thành công!');
      navigate('/my-orders');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Đặt hàng thất bại. Vui lòng thử lại!');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <CustomHeader />
      <div className="container flex-grow-1" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
        <h1 className="mb-4">Giỏ hàng của bạn</h1>
        {items.length === 0 ? (
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
                  {items.map((item: CartItem) => (
                    <tr key={item.productId}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img src={item.image_url} alt={item.productName} className="img-thumbnail me-2" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                          <span>{item.productName}</span>
                        </div>
                      </td>
                      <td>{item.price.toLocaleString()} VNĐ</td>
                      <td>
                        <div className="input-group" style={{ width: '120px' }}>
                          <button className="btn btn-outline-secondary" type="button" onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}>
                            <i className="fas fa-minus"></i>
                          </button>
                          <input
                            type="number"
                            className="form-control text-center"
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item.productId, parseInt(e.target.value) || 1)}
                            min="1"
                          />
                          <button className="btn btn-outline-secondary" type="button" onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}>
                            <i className="fas fa-plus"></i>
                          </button>
                        </div>
                      </td>
                      <td>{(item.price * item.quantity).toLocaleString()} VNĐ</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleRemoveItem(item.productId)}>
                          <i className="fas fa-trash"></i> Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan={3} className="text-end">Tổng cộng:</th>
                    <th>{getTotalAmount().toLocaleString()} VNĐ</th>
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
              <button 
                className="btn btn-primary btn-lg" 
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? 'Đang xử lý...' : 'Tiến hành thanh toán'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};