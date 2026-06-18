import React from 'react';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

interface RegisterModalProps {
  show: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onRegisterSuccess: () => void; // Thêm prop này để đóng modal sau khi đăng ký thành công
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ show, onClose, onSwitchToLogin, onRegisterSuccess }) => {
  return (
    <div className={`modal fade ${show ? 'show d-block' : ''}`} tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-xxl"> {/* Thêm modal-sm để thu nhỏ kích thước */}
        <div className="modal-content">
          <div className="modal-header border-0 pb-0">
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body pt-0">
            <RegisterForm 
              isModal={true} // Báo cho RegisterForm biết nó đang ở trong modal
              onSwitchToLogin={onSwitchToLogin} // Truyền hàm chuyển đổi modal
              onRegisterSuccess={onRegisterSuccess} // Truyền hàm đóng modal sau khi đăng ký thành công
            />
          </div>
        </div>
      </div>
    </div>
  );
};