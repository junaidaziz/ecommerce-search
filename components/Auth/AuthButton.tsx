import React from 'react';
import Button from '@components/UI/Button';

interface AuthButtonProps {
  type?: 'submit' | 'button';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  type = 'submit',
  loading = false,
  disabled = false,
  children,
  onClick,
}) => {
  return (
    <Button
      type={type}
      size="lg"
      fullWidth
      rounded
      shadow
      disabled={disabled || loading}
      className="mt-2"
      onClick={onClick}
    >
      {loading && <span className="loading loading-spinner mr-2"></span>}
      {children}
    </Button>
  );
};

export default AuthButton;
