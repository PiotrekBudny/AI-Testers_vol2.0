import type { APIRequestContext, APIResponse } from "@playwright/test";

import type { ProductInput, ProductUpdate } from "./bystre-products-api.models";

const productsPath = "/api/v1/products";
export class BystreProductsApiClient {
  constructor(private readonly request: APIRequestContext) {}
  getAll(authorization?: string): Promise<APIResponse> {
    return this.request.get(productsPath, {
      headers: this.headers(authorization),
    });
  }
  get(id: number | string, authorization?: string): Promise<APIResponse> {
    return this.request.get(this.path(id), {
      headers: this.headers(authorization),
    });
  }
  create(
    data: Partial<ProductInput>,
    authorization?: string,
  ): Promise<APIResponse> {
    return this.request.post(productsPath, {
      data,
      headers: this.headers(authorization),
    });
  }
  update(
    id: number | string,
    data: ProductUpdate,
    authorization?: string,
  ): Promise<APIResponse> {
    return this.request.put(this.path(id), {
      data,
      headers: this.headers(authorization),
    });
  }
  delete(id: number | string, authorization?: string): Promise<APIResponse> {
    return this.request.delete(this.path(id), {
      headers: this.headers(authorization),
    });
  }
  private path(id: number | string): string {
    return `${productsPath}/${encodeURIComponent(id)}`;
  }
  private headers(authorization?: string): Record<string, string> {
    return authorization ? { Authorization: authorization } : {};
  }
}
