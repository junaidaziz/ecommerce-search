import React from 'react';
import HeartIcon from '../icons/HeartIcon';

interface WishlistButtonProps {
  inWishlist: boolean;
  onToggle: (e: React.MouseEvent) => void;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ inWishlist, onToggle }) => {
  /*
    Visual revamp goals:
    - Distinct default (subtle) vs active (vibrant gradient) states
    - Smooth scale & subtle ring on hover/focus for accessibility
    - aria-pressed to convey toggle state to assistive tech
    - Better dark mode contrast (avoid low contrast gray on gray)
    - Reduced border noise in default state; elevated glassy feel
  */
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={inWishlist}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`absolute top-4 right-4 z-20 w-11 h-11 flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/70 shadow-md backdrop-blur-sm
        ${inWishlist
          ? 'bg-gradient-to-br from-primary/90 via-primary to-primary/90 text-white ring-1 ring-primary/40 hover:shadow-primary/30'
          : 'bg-base-200/70 dark:bg-base-200/40 border border-base-300/60 dark:border-base-300/40 text-base-content/60 hover:text-base-content/80 hover:bg-base-200/90 dark:hover:bg-base-200/60'
        }
        hover:scale-105 active:scale-95`}
    >
      <HeartIcon
        className={`w-5 h-5 drop-shadow-sm transition-colors duration-300 ${
          inWishlist
            ? 'text-white fill-white'
            : 'text-base-content/60 fill-base-content/40'
        }`}
      />
      {/* Decorative pulse for active state */}
      {inWishlist && (
        <span
          className="absolute inset-0 rounded-full animate-ping-slower bg-primary/30 pointer-events-none"
          aria-hidden="true"
        />
      )}
    </button>
  );
};

// Custom slower ping animation via Tailwind arbitrary keyframes (fallback if not in config)
// If project tailwind config doesn't define 'ping-slower', the class below can be added globally.

export default WishlistButton;
