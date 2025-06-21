export interface Category {
  id?: number;
  uuid?: string;
  name: string;
  slug: string;
  parentId?: number | null;
  description?: string | null;
  image?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  children?: Category[];
  subcategories?: string[];
}

export interface CategoryInput {
  name: string;
  parentId?: number | null;
  image?: string;
}
