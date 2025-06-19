export interface Category {
  id?: number;
  name: string;
  parentId?: number | null;
  children?: Category[];
  subcategories?: string[];
  image?: string;
}

export interface CategoryInput {
  name: string;
  parentId?: number | null;
  image?: string;
}
