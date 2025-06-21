export interface Category {
  id?: number;
  name: string;
  slug: string;
  parentId?: number | null;
  description?: string | null;
  image?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  children?: Category[];
  subcategories?: string[];
}

export interface CategoryInput {
  name: string;
  parentId?: number | null;
  image?: string;
}
