import React from 'react';

const ArrowIcon = ({ size = 12, color = 'currentColor', className = '' }) => {
  const dimensions = {
    12: { width: 12, height: 10 },
    14: { width: 14, height: 11.667 },
  };

  const { width, height } = dimensions[size] || dimensions[12];

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 14 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M1 6H13M13 6L8 1M13 6L8 11"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ArrowIcon;

