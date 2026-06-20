import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuthStore } from '@/store/useAuthStore';
import { cartService } from '@/features/cart/services/cartService';
import { CreateOrderRequest } from '@/types/order';
import { CartItem } from '@/types/order';
import { CustomHeader } from '@/components/layout/Header';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, removeFromCartContext, updateCartItemQuantityContext, clearCartContext, user } = useCart();
  const { isLoggedIn } = useAuthStore();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (user?._id) {
      await updateCartItemQuantityContext(user._id, productId, quantity);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (user?._id) {
      await removeFromCartContext(user._id, productId);
    }
  };

  const handleClearCart = async () => {
    if (user?._id) {
      await clearCartContext(user._id);
    }
  };

  const handleCheckout = async () => {
    // Check if user is logged in
    if (!isLoggedIn || !user) {
      alert('Bạn cần đăng nhập để thanh toán!');
      navigate('/');
      return;
    }

    if (!cart?.items || cart.items.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    setIsProcessing(true);
    try {
      // Map cart items to order format (backend expects product_id, quantity)
      const orderItems = cart?.items?.map(item => ({
        product_id: item.product_id._id,
        quantity: item.quantity
      })) || [];

      const orderData = {
        user_id: user._id,
        items: orderItems,
        total_price: cart?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0,
      };

      await cartService.createOrder(orderData);
      await clearCartContext(user._id);
      alert('Đặt hàng thành công!');
      navigate('/my-orders');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Đặt hàng thất bại. Vui lòng thử lại!');
    } finally {
      setIsProcessing(false);
    }
  };

  const getTotalAmount = () => {
    return cart?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <CustomHeader />
      <div className="container flex-grow-1" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
        <div className="d-flex align-items-center mb-4">
          <button className="btn btn-outline-secondary me-3" onClick={() => navigate('/')}>
            <i className="bi bi-arrow-left"></i> Quay lại
          </button>
          <h1 className="mb-0">Giỏ hàng của bạn</h1>
        </div>
        {!cart?.items || cart.items.length === 0 ? (
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
                  {cart.items.map((item) => (
                    <tr key={item.product_id._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img src={item.product_id.image_url} alt={item.product_id.name} className="img-thumbnail me-2" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                          <span>{item.product_id.name}</span>
                        </div>
                      </td>
                      <td>{item.price.toLocaleString()} VNĐ</td>
                      <td>
                        <div className="input-group" style={{ width: '120px' }}>
                          <button className="btn btn-outline-secondary" type="button" onClick={() => handleUpdateQuantity(item.product_id._id, item.quantity - 1)}>
                            <i className="fas fa-minus"></i>
                          </button>
                          <input
                            type="number"
                            className="form-control text-center"
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item.product_id._id, parseInt(e.target.value) || 1)}
                            min="1"
                          />
                          <button className="btn btn-outline-secondary" type="button" onClick={() => handleUpdateQuantity(item.product_id._id, item.quantity + 1)}>
                            <i className="fas fa-plus"></i>
                          </button>
                        </div>
                      </td>
                      <td>{(item.price * item.quantity).toLocaleString()} VNĐ</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleRemoveItem(item.product_id._id)}>
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