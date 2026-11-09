export interface BystreCartItem {
  productId: number;
  quantity: number;
}

export type BystreCartItemInput = BystreCartItem;

export interface BystreCartQuantityInput {
  quantity: number;
}

export interface BystreCartResponse {
  username: string;
  items: BystreCartItem[];
  totalPrice: number;
  totalItems: number;
}
