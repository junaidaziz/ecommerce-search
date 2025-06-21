export interface Category {
  id?: number | string;
  uuid?: string;
  name: string;
  slug?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CategoryInput = Pick<Category, 'name'>;
