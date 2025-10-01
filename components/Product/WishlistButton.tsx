import React from 'react';
import Button from '../UI/Button';
import HeartIcon from '../icons/HeartIcon';

interface WishlistButtonProps {
  inWishlist: boolean;
  onToggle: (e: React.MouseEvent) => void;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ inWishlist, onToggle }) => {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="button-top-right-sm bg-base-200 border border-base-300 shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-110 hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary p-0"
      onClick={onToggle}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <HeartIcon className={`w-10 h-10 transition-colors ${inWishlist ? 'text-primary fill-primary' : 'text-base-content/60 fill-base-content/60'}`} />
    </Button>
  );
};

export default WishlistButton;
