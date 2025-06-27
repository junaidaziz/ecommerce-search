export interface Category {
  id?: number | string;
  uuid?: string;
  name: string;
  slug?: string;
  createdAt?: Date;
  updatedAt?: Date;
  subcategories?: Category[];
}

export type CategoryInput = {
  name: string;
  slug?: string;
};
