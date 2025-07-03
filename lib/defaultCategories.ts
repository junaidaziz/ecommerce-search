import type { Category } from '@/types/category';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    name: 'Electronics',
    slug: 'electronics',
    subcategories: [
      { name: 'Phones', slug: 'phones' },
      { name: 'Computers', slug: 'computers' },
      { name: 'Cameras', slug: 'cameras' },
    ],
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    subcategories: [
      { name: 'Men', slug: 'men' },
      { name: 'Women', slug: 'women' },
      { name: 'Kids', slug: 'kids' },
    ],
  },
  {
    name: 'Home',
    slug: 'home',
    subcategories: [
      { name: 'Furniture', slug: 'furniture' },
      { name: 'Kitchen', slug: 'kitchen' },
      { name: 'Decor', slug: 'decor' },
    ],
  },
  {
    name: 'Toys',
    slug: 'toys',
    subcategories: [
      { name: 'Games', slug: 'games' },
      { name: 'Stuffed Animals', slug: 'stuffed-animals' },
      { name: 'Educational', slug: 'educational' },
    ],
  },
  {
    name: 'Sports',
    slug: 'sports',
    subcategories: [
      { name: 'Fitness', slug: 'fitness' },
      { name: 'Outdoor', slug: 'outdoor' },
      { name: 'Team Sports', slug: 'team-sports' },
    ],
  },
];

export default DEFAULT_CATEGORIES;
