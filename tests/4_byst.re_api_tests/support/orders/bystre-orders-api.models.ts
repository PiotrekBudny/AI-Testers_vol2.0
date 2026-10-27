export interface AddressInput {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export type OrderStatus =
  "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface OrderItemDto {
  id: number;
  productId: number;
  quantity: number;
  productName: string;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderDto {
  id: number;
  username: string;
  items: OrderItemDto[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: AddressInput;
  createdAt: string;
  updatedAt: string;
}

export interface OrderPageDto {
  content: OrderDto[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}
