import dynamic from 'next/dynamic';
import React from 'react';

// Lazy load heavy admin components
export const AdminAnalytics = dynamic(() => import('../pages/admin/analytics'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading analytics...'),
  ssr: false,
});

export const AdminUsers = dynamic(() => import('../pages/admin/users'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading users...'),
  ssr: false,
});

export const AdminCategories = dynamic(() => import('../pages/admin/categories'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading categories...'),
  ssr: false,
});

export const AdminBrands = dynamic(() => import('../pages/admin/brands'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading brands...'),
  ssr: false,
});

export const AdminApprovals = dynamic(() => import('../pages/admin/approvals'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading approvals...'),
  ssr: false,
});

export const AdminPolicies = dynamic(() => import('../pages/admin/policies'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading policies...'),
  ssr: false,
});

export const AdminOrders = dynamic(() => import('../pages/admin/orders'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading orders...'),
  ssr: false,
});

export const AdminSupport = dynamic(() => import('../pages/admin/support'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading support...'),
  ssr: false,
});

export const AdminSearchAnalytics = dynamic(() => import('../pages/admin/search-analytics'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading search analytics...'),
  ssr: false,
});

// Lazy load brand pages
export const BrandDashboard = dynamic(() => import('../pages/brand/dashboard'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading dashboard...'),
  ssr: false,
});

export const BrandAnalytics = dynamic(() => import('../pages/brand/analytics'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading analytics...'),
  ssr: false,
});

export const BrandOrders = dynamic(() => import('../pages/brand/orders'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading orders...'),
  ssr: false,
});

export const BrandProducts = dynamic(() => import('../pages/brand/products'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading products...'),
  ssr: false,
});

export const BrandProductNew = dynamic(() => import('../pages/brand/products/new'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading product form...'),
  ssr: false,
});

export const BrandProductEdit = dynamic(() => import('../pages/brand/products/[slug]'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading product editor...'),
  ssr: false,
});

// Lazy load user pages
export const UserProfile = dynamic(() => import('../pages/profile'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading profile...'),
  ssr: false,
});

export const UserSettings = dynamic(() => import('../pages/settings'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading settings...'),
  ssr: false,
});

export const UserOrders = dynamic(() => import('../pages/orders'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading orders...'),
  ssr: false,
});

export const UserOrderDetail = dynamic(() => import('../pages/orders/[orderId]'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading order details...'),
  ssr: false,
});

export const UserCoupons = dynamic(() => import('../pages/user/coupons'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading coupons...'),
  ssr: false,
});

export const UserCredit = dynamic(() => import('../pages/user/credit'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading credit...'),
  ssr: false,
});

export const UserHistory = dynamic(() => import('../pages/user/history'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading history...'),
  ssr: false,
});

export const UserWishlist = dynamic(() => import('../pages/user/wishlist'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading wishlist...'),
  ssr: false,
});

// Lazy load other heavy pages
export const Checkout = dynamic(() => import('../pages/checkout'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading checkout...'),
  ssr: false,
});

export const Cart = dynamic(() => import('../pages/cart'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading cart...'),
  ssr: false,
});

export const Search = dynamic(() => import('../pages/search'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading search...'),
  ssr: false,
});

export const ProductDetail = dynamic(() => import('../pages/product/[slug]'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading product...'),
  ssr: false,
});

export const CategoryPage = dynamic(() => import('../pages/categories/[slug]'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading category...'),
  ssr: false,
});

export const CategoryProducts = dynamic(() => import('../pages/categories/[slug]/products'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading category products...'),
  ssr: false,
});

// Lazy load heavy components
export const RichTextEditor = dynamic(() => import('../components/form-fields/RichTextEditor'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading editor...'),
  ssr: false,
});

export const BarChart = dynamic(() => import('../components/BarChart'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading chart...'),
  ssr: false,
});

export const TopProductsChart = dynamic(() => import('../components/analytics/TopProductsChart'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading chart...'),
  ssr: false,
});

export const ChatWindow = dynamic(() => import('../components/Chat/ChatWindow'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading chat...'),
  ssr: false,
});

export const OrderChatWindow = dynamic(() => import('../components/Chat/OrderChatWindow'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading chat...'),
  ssr: false,
});

export const ProductForm = dynamic(() => import('../components/Product/ProductForm'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading form...'),
  ssr: false,
});

export const ProductFilters = dynamic(() => import('../components/Product/ProductFilters'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading filters...'),
  ssr: false,
});

export const SortMenu = dynamic(() => import('../components/SortMenu'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading sort menu...'),
  ssr: false,
});

export const ActiveFilters = dynamic(() => import('../components/ActiveFilters'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading filters...'),
  ssr: false,
});

export const InfiniteLoader = dynamic(() => import('../components/InfiniteLoader'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading more...'),
  ssr: false,
});

export const ProductGrid = dynamic(() => import('../components/Product/ProductGrid'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading products...'),
  ssr: false,
});

export const ImageGallery = dynamic(() => import('../components/Product/ImageGallery'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading gallery...'),
  ssr: false,
});

export const CategorySlider = dynamic(() => import('../components/Category/CategorySlider'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading slider...'),
  ssr: false,
});

export const HeroSlider = dynamic(() => import('../components/HeroSlider'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading hero...'),
  ssr: false,
});

export const FeaturedProducts = dynamic(() => import('../components/Product/FeaturedProducts'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading featured products...'),
  ssr: false,
});

export const CategoryGrid = dynamic(() => import('../components/Category/CategoryGrid'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading categories...'),
  ssr: false,
});

export const FeaturedCards = dynamic(() => import('../components/FeaturedCards'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading featured cards...'),
  ssr: false,
});

export const Hero = dynamic(() => import('../components/Hero'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading hero...'),
  ssr: false,
});

export const HomeHero = dynamic(() => import('../components/HomeHero'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading hero...'),
  ssr: false,
});

export const CategoryPromotion = dynamic(() => import('../components/Category/CategoryPromotion'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading promotion...'),
  ssr: false,
});

export const PromoBanner = dynamic(() => import('../components/PromoBanner'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading banner...'),
  ssr: false,
});

export const CartDropdown = dynamic(() => import('../components/common/CartDropdown'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading cart...'),
  ssr: false,
});

export const CategoryMenu = dynamic(() => import('../components/Layout/CategoryMenu'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading menu...'),
  ssr: false,
});

export const UserDropdown = dynamic(() => import('../components/Layout/UserDropdown'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading user menu...'),
  ssr: false,
});

export const SearchBar = dynamic(() => import('../components/Layout/SearchBar'), {
  loading: () => React.createElement('div', { className: 'p-4' }, 'Loading search...'),
  ssr: false,
}); 