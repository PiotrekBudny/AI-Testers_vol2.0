import type { APIRequestContext, APIResponse } from "@playwright/test";

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
}
