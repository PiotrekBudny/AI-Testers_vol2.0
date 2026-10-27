import type { APIRequestContext, APIResponse } from "@playwright/test";

import type { AddressInput } from "./bystre-orders-api.models";

const ordersPath = "/api/v1/orders";

export class BystreOrdersApiClient {
  constructor(private readonly request: APIRequestContext) {}

  getAll(
    query: {
      page?: number | string;
      size?: number | string;
      status?: string;
    } = {},
    authorization?: string,
  ): Promise<APIResponse> {
    return this.request.get(ordersPath, {
      params: query,
      headers: authorization ? { Authorization: authorization } : undefined,
    });
  }

  create(
    address: Partial<AddressInput>,
    authorization?: string,
  ): Promise<APIResponse> {
    return this.request.post(ordersPath, {
      data: address,
      headers: authorization ? { Authorization: authorization } : undefined,
    });
  }

  get(id: number | string, authorization?: string): Promise<APIResponse> {
    return this.request.get(`${ordersPath}/${encodeURIComponent(id)}`, {
      headers: authorization ? { Authorization: authorization } : undefined,
    });
  }

  cancel(id: number | string, authorization?: string): Promise<APIResponse> {
    return this.request.post(`${ordersPath}/${encodeURIComponent(id)}/cancel`, {
      headers: authorization ? { Authorization: authorization } : undefined,
    });
  }
}
