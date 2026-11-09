import type { APIRequestContext, APIResponse } from "@playwright/test";

import type {
  AddressInput,
  OrderStatus,
} from "../orders/bystre-orders-api.models";
import type { InventoryAdjustmentInput } from "./bystre-admin-api.models";

export class BystreAdminApiClient {
  constructor(private readonly request: APIRequestContext) {}

  getAdminOrders(authorization?: string): Promise<APIResponse> {
    return this.request.get("/api/v1/orders/admin", {
      headers: this.headers(authorization),
    });
  }

  updateOrderStatus(
    id: number,
    status: OrderStatus,
    authorization?: string,
  ): Promise<APIResponse> {
    return this.request.put(`/api/v1/orders/${id}/status`, {
      data: JSON.stringify(status),
      headers: {
        ...this.headers(authorization),
        "Content-Type": "application/json",
      },
    });
  }

  getInventory(authorization?: string): Promise<APIResponse> {
    return this.request.get("/api/v1/admin/inventory", {
      headers: this.headers(authorization),
    });
  }

  getInventoryItem(
    productId: number,
    authorization?: string,
  ): Promise<APIResponse> {
    return this.request.get(`/api/v1/admin/inventory/${productId}`, {
      headers: this.headers(authorization),
    });
  }

  adjustInventory(
    productId: number,
    data: InventoryAdjustmentInput,
    authorization?: string,
  ): Promise<APIResponse> {
    return this.request.post(
      `/api/v1/admin/inventory/${productId}/adjustments`,
      { data, headers: this.headers(authorization) },
    );
  }

  getInventoryMovements(
    productId: number,
    authorization?: string,
  ): Promise<APIResponse> {
    return this.request.get(`/api/v1/admin/inventory/${productId}/movements`, {
      headers: this.headers(authorization),
    });
  }

  addCartItem(
    productId: number,
    quantity: number,
    authorization: string,
  ): Promise<APIResponse> {
    return this.request.post("/api/v1/cart/items", {
      data: { productId, quantity },
      headers: this.headers(authorization),
    });
  }

  createOrder(
    address: AddressInput,
    authorization: string,
  ): Promise<APIResponse> {
    return this.request.post("/api/v1/orders", {
      data: address,
      headers: this.headers(authorization),
    });
  }

  private headers(authorization?: string): Record<string, string> {
    return authorization ? { Authorization: authorization } : {};
  }
}
