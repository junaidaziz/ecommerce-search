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
      aria-pressed={inWishlist}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 shadow-md backdrop-blur-sm
        ${inWishlist
          ? 'bg-rose-500/90 dark:bg-rose-500/80 text-white ring-1 ring-rose-400/40 hover:bg-rose-600 dark:hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-500/30 focus-visible:ring-rose-500'
          : 'bg-white/80 dark:bg-gray-800/80 border border-gray-300/60 dark:border-gray-600/60 text-gray-600 dark:text-gray-300 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-gray-800 hover:border-rose-300 dark:hover:border-rose-500/50 focus-visible:ring-primary'
        }
        hover:scale-110 active:scale-95`}
    >
      <HeartIcon
        className={`w-5 h-5 transition-all duration-300 ${
          inWishlist
            ? 'text-white fill-white drop-shadow-sm'
            : 'text-gray-600 dark:text-gray-300 fill-none stroke-current stroke-2'
        }`}
      />
    </button>
  );
};

export default WishlistButton;
