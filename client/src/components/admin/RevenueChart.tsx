/**
 * @file RevenueChart.tsx
 * @description Admin dashboard chart component built using native SVG.
 * Renders a responsive, interactive area spline chart representing monthly revenue with tooltips and gridlines.
 */

import React, { useState } from 'react';
import { MonthlyRevenueData } from '@/features/dashboard/services/dashboardService';

interface RevenueChartProps {
  data: MonthlyRevenueData[];
}

/**
 * @component RevenueChart
 * @description Renders a premium interactive SVG chart displaying monthly revenue statistics.
 * @param {RevenueChartProps} props - Component props containing the monthly revenue array.
 */
export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Kích thước của SVG vẽ biểu đồ
  const svgWidth = 800;
  const svgHeight = 350;
  const paddingLeft = 80;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 50;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Tính giá trị doanh thu lớn nhất để xác định tỉ lệ trục Y
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1000000);

  // Định dạng số tiền thành dạng rút gọn (ví dụ: 1.5M, 100k, 2B)
  const formatShortValue = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1).replace(/\.0$/, '')}B`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return value.toString();
  };

  // Tính tọa độ (x, y) cho từng tháng
  const points = data.map((d, index) => {
    const x = paddingLeft + (index * chartWidth) / (data.length - 1);
    const y = paddingTop + chartHeight - (d.revenue / maxRevenue) * chartHeight;
    return { x, y, month: d.month, revenue: d.revenue };
  });

  // Tạo đường dẫn biểu đồ (Area path và Line path)
  let linePath = '';
  let areaPath = '';

  if (points.length > 0) {
    // Vẽ đường spline tuyến tính đơn giản nối các điểm
    linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ');
    // Tạo vùng diện tích dưới đường line để đổ màu gradient
    areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
  }

  // Chia lưới trục Y (4 khoảng cách)
  const gridLinesY = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="card-title fw-bold text-gray-800 m-0">Biểu đồ doanh thu năm nay</h5>
        {hoveredIndex !== null && (
          <div className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill small transition-all">
            {points[hoveredIndex].month}: <strong className="text-dark">{points[hoveredIndex].revenue.toLocaleString()}đ</strong>
          </div>
        )}
      </div>

      <div className="position-relative w-100" style={{ minHeight: '350px' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-100 h-auto"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Gradient màu hồng - đỏ cho vùng diện tích */}
            <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dc3545" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#dc3545" stopOpacity="0.0" />
            </linearGradient>

            {/* Gradient màu viền của biểu đồ */}
            <linearGradient id="chartLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffc107" />
              <stop offset="50%" stopColor="#dc3545" />
              <stop offset="100%" stopColor="#fd7e14" />
            </linearGradient>
            
            {/* Bóng đổ cho chấm điểm khi hover */}
            <filter id="pointShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#dc3545" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Vẽ các đường lưới ngang trục Y */}
          {gridLinesY.map((ratio, idx) => {
            const y = paddingTop + chartHeight - ratio * chartHeight;
            const value = ratio * maxRevenue;
            return (
              <g key={idx} className="chart-grid-line">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#e9ecef"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
                <text
                  x={paddingLeft - 15}
                  y={y + 4}
                  textAnchor="end"
                  fill="#6c757d"
                  fontSize="12"
                  fontWeight="500"
                >
                  {formatShortValue(value)}
                </text>
              </g>
            );
          })}

          {/* Vẽ trục X */}
          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight}
            x2={svgWidth - paddingRight}
            y2={paddingTop + chartHeight}
            stroke="#ced4da"
            strokeWidth="1.5"
          />

          {/* Vẽ vùng diện tích Gradient (Area) */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#chartAreaGradient)"
              style={{
                animation: 'fadeIn 1s ease-out forwards',
              }}
            />
          )}

          {/* Vẽ đường viền biểu đồ (Line) */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="url(#chartLineGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 2500,
                strokeDashoffset: 2500,
                animation: 'drawPath 2s ease-out forwards',
              }}
            />
          )}

          {/* Vùng tương tác hover dọc */}
          {points.map((p, index) => {
            const colWidth = chartWidth / (data.length - 1);
            const clickAreaX = p.x - colWidth / 2;
            const clickAreaWidth = colWidth;

            return (
              <g key={index}>
                {/* Đường trợ giúp khi hover */}
                {hoveredIndex === index && (
                  <line
                    x1={p.x}
                    y1={paddingTop}
                    x2={p.x}
                    y2={paddingTop + chartHeight}
                    stroke="#dc3545"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                )}

                {/* Nhãn văn bản tháng dưới trục X */}
                <text
                  x={p.x}
                  y={paddingTop + chartHeight + 25}
                  textAnchor="middle"
                  fill={hoveredIndex === index ? '#dc3545' : '#6c757d'}
                  fontSize="11"
                  fontWeight={hoveredIndex === index ? 'bold' : 'normal'}
                >
                  {p.month.replace('Tháng ', 'T')}
                </text>

                {/* Chấm tròn biểu thị điểm dữ liệu */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredIndex === index ? '7' : '4'}
                  fill={hoveredIndex === index ? '#ffffff' : '#dc3545'}
                  stroke="#dc3545"
                  strokeWidth={hoveredIndex === index ? '3' : '1.5'}
                  filter={hoveredIndex === index ? 'url(#pointShadow)' : 'none'}
                  style={{ transition: 'all 0.2s ease-in-out' }}
                />

                {/* Khung vô hình để bắt sự kiện hover chuột rộng hơn */}
                <rect
                  x={clickAreaX}
                  y={paddingTop}
                  width={clickAreaWidth}
                  height={chartHeight}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}
        </svg>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes drawPath {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      ` }} />
    </div>
  );
};
