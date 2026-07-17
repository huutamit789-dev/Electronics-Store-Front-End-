/**
 * Currency formatting utilities
 * Định dạng tiền tệ cho ứng dụng
 */

/**
 * Format số thành chuỗi tiền tệ với dấu chấm (chuẩn Việt Nam)
 * @param value - Số cần format (number hoặc string)
 * @returns Chuỗi đã format (ví dụ: "1.234.567")
 */
export const formatCurrency = (value: number | string): string => {
  if (value === '' || value === null || value === undefined) return '';
  const num = Number(String(value).replace(/[^0-9.-]/g, '')) || 0;
  return num.toLocaleString('vi-VN');
};

/**
 * Parse chuỗi tiền tệ về số
 * @param str - Chuỗi cần parse (ví dụ: "1,234,567")
 * @returns Số (ví dụ: 1234567)
 */
export const parseCurrency = (str: string): number => {
  if (!str) return 0;
  const num = Number(String(str).replace(/[^0-9.-]/g, '')) || 0;
  return num;
};

/**
 * Format số thành chuỗi tiền tệ VNĐ
 * @param value - Số cần format
 * @returns Chuỗi với hậu tố "đ" (ví dụ: "1,234,567đ")
 */
export const formatVND = (value: number | string): string => {
  return `${formatCurrency(value)}đ`;
};

/**
 * Format số thành chuỗi tiền tệ VNĐ đầy đủ
 * @param value - Số cần format
 * @returns Chuỗi với hậu tố " VNĐ" (ví dụ: "1,234,567 VNĐ")
 */
export const formatVNDFull = (value: number | string): string => {
  return `${formatCurrency(value)} VNĐ`;
};
