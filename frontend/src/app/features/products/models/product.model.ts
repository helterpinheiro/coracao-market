export type ProductCategory =
  | 'FOOD'
  | 'DAIRY'
  | 'BEVERAGE'
  | 'HYGIENE'
  | 'CLEANING'
  | 'BAKERY'
  | 'PRODUCE'
  | 'MEAT';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  stock: number;
}

export interface ProductView extends Product {
  image: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}