import React from 'react';
import type { IconProps } from './IconProps';

const FacebookIcon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
  ...rest
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    className={className}
    aria-hidden="true"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    {...rest}
  >
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103.392.051.772.116 1.141.195v3.325c-.219-.013-.432-.022-.653-.036a26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309-.308.144-.54.355-.679.622-.258.42-.374.995-.374 1.752v1.297h3.919l-.673 3.667h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12S0 5.417 0 12.044c0 5.628 3.874 10.35 9.101 11.647Z" />
  </svg>
);

export default FacebookIcon;
