export interface AddressInput {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export type OrderStatus =
  "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";
