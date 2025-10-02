import React from 'react';
import HeartIcon from '../icons/HeartIcon';

interface WishlistButtonProps {
  inWishlist: boolean;
  onToggle: (e: React.MouseEvent) => void;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ inWishlist, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`absolute top-5 right-5 z-20 w-10 h-10 flex items-center justify-center rounded-full shadow-sm transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary p-2 ${
        inWishlist
          ? 'bg-primary/10 border-2 border-primary hover:bg-primary/20'
          : 'bg-base-200 border-2 border-base-300 hover:bg-base-300 hover:border-base-400'
      }`}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <HeartIcon className={`w-5 h-5 transition-colors ${inWishlist ? 'text-primary fill-primary' : 'text-base-content/60 fill-base-content/60'}`} />
    </button>
  );
};

export default WishlistButton;
