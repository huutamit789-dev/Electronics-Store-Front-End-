/**
 * Date formatting utilities
 * Định dạng ngày tháng cho ứng dụng
 */

/**
 * Format date thành chuỗi localized
 * @param date - Date object hoặc string
 * @param locale - Locale (mặc định: 'vi-VN')
 * @returns Chuỗi ngày đã format
 */
export const formatDate = (date: Date | string, locale: string = 'vi-VN'): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale);
};

/**
 * Format datetime thành chuỗi localized đầy đủ
 * @param date - Date object hoặc string
 * @param locale - Locale (mặc định: 'vi-VN')
 * @returns Chuỗi datetime đã format
 */
export const formatDateTime = (date: Date | string, locale: string = 'vi-VN'): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString(locale);
};

/**
 * Format time thành chuỗi localized
 * @param date - Date object hoặc string
 * @param locale - Locale (mặc định: 'vi-VN')
 * @returns Chuỗi thời gian đã format
 */
export const formatTime = (date: Date | string, locale: string = 'vi-VN'): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString(locale);
};

/**
 * Format date thành chuỗi ISO (YYYY-MM-DD)
 * @param date - Date object hoặc string
 * @returns Chuỗi ISO date
 */
export const formatISODate = (date: Date | string): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0];
};

/**
 * Format relative time (ví dụ: "2 giờ trước", "3 ngày trước")
 * @param date - Date object hoặc string
 * @param locale - Locale (mặc định: 'vi-VN')
 * @returns Chuỗi relative time
 */
export const formatRelativeTime = (date: Date | string, locale: string = 'vi-VN'): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffDays > 0) return rtf.format(-diffDays, 'day');
  if (diffHours > 0) return rtf.format(-diffHours, 'hour');
  if (diffMins > 0) return rtf.format(-diffMins, 'minute');
  return rtf.format(-diffSecs, 'second');
};
