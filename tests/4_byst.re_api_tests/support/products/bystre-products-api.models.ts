export interface ProductInput {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  imageUrl?: string | null;
}
export type ProductUpdate = {
  [K in keyof ProductInput]?: ProductInput[K] | null;
};
export interface ProductDto extends ProductInput {
  id: number;
  createdAt: string;
  updatedAt: string;
}
