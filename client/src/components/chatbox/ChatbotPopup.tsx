import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  hasButtons?: boolean;
  buttons?: { label: string; link: string }[];
}

export const ChatbotPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! Tôi có thể giúp gì cho bạn?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Cảm ơn bạn đã liên hệ! Để được hỗ trợ nhanh nhất, vui lòng liên hệ qua:',
        isUser: false,
        timestamp: new Date(),
        hasButtons: true,
        buttons: [
          { label: '📱 Facebook', link: 'https://www.facebook.com/le.huu.tam.706119/' },
          { label: '💬 Zalo', link: 'https://zalo.me' }
        ]
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div className="position-fixed bottom-0 end-0 m-4" style={{ zIndex: 9999 }}>
          <div className="position-relative">
            {/* Pulse effect rings */}
            <div 
              className="position-absolute top-50 start-50 translate-middle rounded-circle bg-danger"
              style={{
                width: '80px',
                height: '80px',
                opacity: 0.3,
                animation: 'pulse-ring 2s infinite'
              }}
            ></div>
            <div 
              className="position-absolute top-50 start-50 translate-middle rounded-circle bg-danger"
              style={{
                width: '100px',
                height: '100px',
                opacity: 0.15,
                animation: 'pulse-ring 2s infinite 0.5s'
              }}
            ></div>
            
            {/* Notification badge */}
            <div 
              className="position-absolute top-0 start-0 bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
              style={{ 
                width: '24px', 
                height: '24px', 
                fontSize: '12px',
                transform: 'translate(-25%, -25%)',
                animation: 'bounce-badge 2s infinite',
                zIndex: 10
              }}
            >
                1
            </div>
            
            {/* Main button */}
            <button
              className="btn btn-danger rounded-circle shadow-lg d-flex align-items-center justify-content-center position-relative"
              style={{ 
                width: '65px', 
                height: '65px',
                transition: 'all 0.3s ease',
                animation: 'float-button 3s ease-in-out infinite'
              }}
              onClick={() => setIsOpen(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(220, 53, 69, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
              }}
            >
              <i className="bi bi-chat-dots-fill fs-4 text-white"></i>
            </button>
          </div>
        </div>
      )}

      {/* Chat Popup */}
      {isOpen && createPortal(
        <div 
          className="position-fixed shadow-xl rounded-4 overflow-hidden"
          style={{ 
            width: '400px', 
            maxWidth: '90vw', 
            height: '400px',
            maxHeight: 'calc(100vh - 200px)',
            zIndex: 9999,
            backgroundColor: '#fff',
            animation: 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            bottom: '120px',
            right: '20px',
            position: 'fixed',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div 
            className="text-white d-flex justify-content-between align-items-center"
            style={{ 
              background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
              boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)',
              padding: '16px 20px',
              minHeight: '70px'
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <div 
                className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                style={{ 
                  width: '45px', 
                  height: '45px',
                  animation: 'pulse-avatar 2s infinite'
                }}
              >
                <i className="bi bi-robot text-danger fs-4"></i>
              </div>
              <div>
                <h6 className="mb-0 fw-bold fs-5">Hỗ trợ trực tuyến</h6>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <span className="bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></span>
                  <small className="opacity-90">Trực tuyến</small>
                </div>
              </div>
            </div>
            <button 
              className="btn btn-link text-white p-0 hover-lift"
              onClick={() => setIsOpen(false)}
              style={{ transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(90deg)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
            >
              <i className="bi bi-x-lg fs-4"></i>
            </button>
          </div>

          {/* Messages Area */}
          <div 
            className="p-4 overflow-auto"
            style={{ 
              height: 'calc(100% - 140px)', 
              backgroundColor: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)'
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`d-flex mb-3 ${message.isUser ? 'justify-content-end' : 'justify-content-start'}`}
                style={{ animation: 'messageSlide 0.3s ease-out' }}
              >
                <div
                  className={`p-3 rounded-4 shadow-sm ${message.isUser ? 'text-white' : 'text-dark'}`}
                  style={{ 
                    maxWidth: '80%', 
                    wordBreak: 'break-word',
                    background: message.isUser 
                      ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
                      : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    boxShadow: message.isUser 
                      ? '0 4px 15px rgba(220, 53, 69, 0.3)'
                      : '0 2px 10px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div className="small" style={{ whiteSpace: 'pre-line', lineHeight: '1.5' }}>{message.text}</div>
                  {message.hasButtons && message.buttons && (
                    <div className="mt-3 d-flex flex-column gap-2">
                      {message.buttons.map((button, index) => (
                        <a
                          key={index}
                          href={button.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-danger rounded-pill text-decoration-none"
                          style={{ 
                            fontSize: '12px',
                            padding: '6px 12px',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#dc3545';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#dc3545';
                          }}
                        >
                          {button.label}
                        </a>
                      ))}
                    </div>
                  )}
                  <div 
                    className={`mt-2 ${message.isUser ? 'text-white' : 'text-muted'}`} 
                    style={{ fontSize: '0.7rem', opacity: 0.8 }}
                  >
                    {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="d-flex mb-3 justify-content-start" style={{ animation: 'messageSlide 0.3s ease-out' }}>
                <div 
                  className="bg-white p-3 rounded-4 shadow-sm"
                  style={{ boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}
                >
                  <div className="d-flex gap-2">
                    <div 
                      className="bg-danger rounded-circle" 
                      style={{ 
                        width: '10px', 
                        height: '10px', 
                        animation: 'bounce-typing 1.4s infinite ease-in-out' 
                      }}
                    ></div>
                    <div 
                      className="bg-danger rounded-circle" 
                      style={{ 
                        width: '10px', 
                        height: '10px', 
                        animation: 'bounce-typing 1.4s infinite ease-in-out 0.2s' 
                      }}
                    ></div>
                    <div 
                      className="bg-danger rounded-circle" 
                      style={{ 
                        width: '10px', 
                        height: '10px', 
                        animation: 'bounce-typing 1.4s infinite ease-in-out 0.4s' 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div 
            className="p-4 bg-white border-top"
            style={{ 
              borderTop: '2px solid #f0f0f0',
              boxShadow: '0 -4px 15px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div className="input-group">
              <input
                type="text"
                className="form-control rounded-pill"
                placeholder="Nhập tin nhắn..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{ 
                  border: '2px solid #e9ecef',
                  padding: '12px 20px',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#dc3545';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e9ecef';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <button
                className="btn rounded-pill px-4"
                style={{
                  background: inputValue.trim() !== '' 
                    ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
                    : '#e9ecef',
                  color: inputValue.trim() !== '' ? 'white' : '#6c757d',
                  transition: 'all 0.3s ease',
                  boxShadow: inputValue.trim() !== '' 
                    ? '0 4px 15px rgba(220, 53, 69, 0.3)'
                    : 'none'
                }}
                onClick={handleSendMessage}
                disabled={inputValue.trim() === ''}
                onMouseEnter={(e) => {
                  if (inputValue.trim() !== '') {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <i className="bi bi-send-fill"></i>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes pulse-ring {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.5;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.2;
          }
          100% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.5;
          }
        }
        @keyframes bounce-badge {
          0%, 100% {
            transform: translate(-25%, -25%) scale(1);
          }
          50% {
            transform: translate(-25%, -25%) scale(1.2);
          }
        }
        @keyframes float-button {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes pulse-avatar {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(220, 53, 69, 0);
          }
        }
        @keyframes messageSlide {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce-typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-8px);
          }
        }
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
      `}</style>
    </>
  );
};
