import React from 'react';

interface ChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="position-fixed bottom-0 end-0 m-4" style={{ zIndex: 1050 }}>
      <div className="card shadow-lg" style={{ width: '320px', maxWidth: '90vw' }}>
        <div className="card-header bg-brand-red text-white d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold">
            <i className="bi bi-chat-dots me-2"></i>Hỗ trợ khách hàng
          </h6>
          <button 
            type="button" 
            className="btn-close btn-close-white" 
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>
        <div className="card-body bg-light">
          <p className="mb-3 text-secondary">
            Quý khách muốn hỗ trợ gì xin liên hệ qua FB, Zalo của mình:
          </p>
          <div className="d-flex flex-column gap-2">
            <a 
              href="https://www.facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
            >
              <i className="bi bi-facebook"></i>
              Facebook
            </a>
            <a 
              href="https://zalo.me" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-info text-white d-flex align-items-center justify-content-center gap-2"
            >
              <i className="bi bi-chat-text"></i>
              Zalo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
