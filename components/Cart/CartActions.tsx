import React from 'react';
import Button from '@components/UI/Button';

interface CartActionsProps {
  onEmptyCart: () => void;
  onCheckout: () => void;
  disabled?: boolean;
}

const CartActions: React.FC<CartActionsProps> = ({
  onEmptyCart,
  onCheckout,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end mt-6">
      <Button
        variant="outline"
        size="lg"
        onClick={onEmptyCart}
        disabled={disabled}
        className="w-full sm:w-auto"
      >
        Empty Cart
      </Button>
      <Button
        variant="primary"
        size="lg"
        onClick={onCheckout}
        disabled={disabled}
        className="w-full sm:w-auto"
      >
        Checkout
      </Button>
    </div>
  );
};

export default CartActions;
