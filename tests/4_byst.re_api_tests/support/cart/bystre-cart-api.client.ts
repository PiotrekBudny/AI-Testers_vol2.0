import type { APIRequestContext, APIResponse } from "@playwright/test";

import type {
  BystreCartItemInput,
  BystreCartQuantityInput,
} from "./bystre-cart-api.models";

const cartPath = "/api/v1/cart";

export class BystreCartApiClient {
  constructor(private readonly request: APIRequestContext) {}

  get(authorization?: string): Promise<APIResponse> {
    return this.request.get(cartPath, {
      headers: authorization ? { Authorization: authorization } : undefined,
    });
  }

  clear(authorization?: string): Promise<APIResponse> {
    return this.request.delete(cartPath, {
      headers: authorization ? { Authorization: authorization } : undefined,
    });
  }

  addItem(
    data: BystreCartItemInput,
    authorization?: string,
  ): Promise<APIResponse> {
    return this.request.post(`${cartPath}/items`, {
      data,
      headers: authorization ? { Authorization: authorization } : undefined,
    });
  }

  updateItem(
    productId: number | string,
    data: BystreCartQuantityInput,
    authorization?: string,
  ): Promise<APIResponse> {
    return this.request.put(
      `${cartPath}/items/${encodeURIComponent(productId)}`,
      {
        data,
        headers: authorization ? { Authorization: authorization } : undefined,
      },
    );
  }

  removeItem(
    productId: number | string,
    authorization?: string,
  ): Promise<APIResponse> {
    return this.request.delete(
      `${cartPath}/items/${encodeURIComponent(productId)}`,
      {
        headers: authorization ? { Authorization: authorization } : undefined,
      },
    );
  }
}
