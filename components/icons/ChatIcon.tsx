import React from 'react';
import type { IconProps } from './IconProps';

const ChatIcon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
  ...rest
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={1.5}
    className={className}
    aria-hidden="true"
    role="img"
    {...rest}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12.75v6.213c0 .966 1.098 1.548 1.882.99l3.083-2.164a.75.75 0 01.435-.139h8.1a4.5 4.5 0 004.5-4.5v-6a4.5 4.5 0 00-4.5-4.5h-9a4.5 4.5 0 00-4.5 4.5v5.1z"
    />
  </svg>
);

export default ChatIcon;
