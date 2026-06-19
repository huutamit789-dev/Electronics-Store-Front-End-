import React from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';

interface LoginModalProps {
  show: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onLoginSuccess: () => void; // Thêm prop này để đóng modal sau khi đăng nhập thành công
}

export const LoginModal: React.FC<LoginModalProps> = ({ show, onClose, onSwitchToRegister, onLoginSuccess }) => {
  return (
    <div className={`modal fade ${show ? 'show d-block' : ''}`} tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-xxl">
        <div className="modal-content">
          <div className="modal-header border-0 pb-0">
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body pt-0">
            <LoginForm 
              isModal={true} // Báo cho LoginForm biết nó đang ở trong modal
              onSwitchToRegister={onSwitchToRegister} // Truyền hàm chuyển đổi modal
              onLoginSuccess={onLoginSuccess} // Truyền hàm đóng modal sau khi đăng nhập thành công
            />
            
            {/* Thêm lại dòng chữ chuyển đổi sang Đăng ký */}
            <div className="text-center mt-3 pb-3">
              <span className="text-muted small">Bạn chưa có tài khoản? </span>
              <button 
                type="button" 
                className="btn btn-link p-0 text-danger small text-decoration-none fw-bold"
                onClick={onSwitchToRegister}
              >
                Đăng ký ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};