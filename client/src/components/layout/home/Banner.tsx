import React from 'react';

interface BannerProps {
  mainBannerImage?: string; // Đặt prop là tùy chọn
}

export const Banner: React.FC<BannerProps> = ({ mainBannerImage }) => {
  // Sử dụng một giá trị mặc định nếu mainBannerImage không được cung cấp
  const imageUrl = mainBannerImage || 'https://via.placeholder.com/800x300?text=Main+Banner';

  return (
    <div className="bg-danger-subtle rounded-3 d-flex align-items-center justify-content-center text-danger fw-bold fs-5 border border-danger-subtle h-100 overflow-hidden">
      {/* Luôn hiển thị hình ảnh, sử dụng placeholder nếu không có URL thực */}
      <img src={imageUrl} alt="Main Banner" className="img-fluid h-100 w-100 object-fit-cover" />
    </div>
  );
};