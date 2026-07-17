import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCodeGateStore } from '@/store/codeGateStore';
import toast from 'react-hot-toast';
import { Lock, ShieldCheck } from 'lucide-react'; // Import Lucide React components

export const CodeGatePage: React.FC = () => {
  const [code, setCode] = useState('');
  const enterCode = useCodeGateStore((state) => state.enterCode);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enterCode(code)) {
      toast.success('Mã hợp lệ! Đang chuyển hướng...');
      navigate('/'); // Redirect to the home page after successful code entry
    } else {
      toast.error('Mã không hợp lệ. Vui lòng thử lại.');
      setCode(''); // Clear the input on incorrect code
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light p-4"> {/* Using Bootstrap classes for layout */}
      <div className="card p-4 p-md-5 mx-auto shadow-lg" style={{ borderRadius: '1rem', maxWidth: '400px' }}>
        <div className="text-center mb-4">
          <div className="text-primary mb-3">
            <ShieldCheck size={64} className="text-primary" /> {/* Lucide React component */}
          </div>
          <h1 className="h4 fw-bold text-dark">Cổng Truy Cập Đặc Biệt</h1>
          <p className="text-muted small">Vui lòng nhập mã bảo mật để tiếp tục.</p>
        </div>

        <form onSubmit={handleSubmit}> {/* Connect form to handleSubmit */}
          <div className="input-group mb-3"> {/* Use Bootstrap input-group */}
            <span className="input-group-text bg-white border-end-0">
              <Lock size={20} className="text-secondary" /> {/* Lucide React component */}
            </span>
            <input
              type="password"
              className="form-control border-start-0 text-center" // Added text-center for input
              placeholder="Nhập mã ở đây"
              value={code} // Bind value to state
              onChange={(e) => setCode(e.target.value)} // Update state on change
              required
              aria-label="Mã bảo mật"
              style={{ borderRadius: '0.25rem' }} // Adjust border-radius for input
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 fw-bold py-2">
            <Lock size={20} className="me-2" /> Truy Cập
          </button>
        </form>

        <div className="d-flex justify-content-center gap-4 mt-4">
          <a href="#" className="text-muted text-decoration-none small fw-bold">Mã Truy cập</a>
          <a href="#" className="text-muted text-decoration-none small fw-bold">09022000</a>
        
        </div>
      </div>
    </div>
  );
};