import React from 'react';
import type { IconProps } from './IconProps';

const MoneyIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '', ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke={color}
    strokeWidth={1.5}
    className={className}
    aria-hidden="true"
    role="img"
    {...rest}
  >
    <path
      d="M12 6V18M9 15.1818L9.8789 15.841C11.0504 16.7197 12.9498 16.7197 14.1213 15.841C15.2929 14.9623 15.2929 13.5377 14.1213 12.659C13.5354 12.2196 12.7677 12 11.9999 12C11.275 12 10.5502 11.7804 9.9971 11.341C8.89097 10.4623 8.89097 9.03772 9.9971 8.15904C11.1032 7.28036 12.8965 7.28036 14.0026 8.15904L14.4175 8.48863"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="9" />
  </svg>
);

export default MoneyIcon;
