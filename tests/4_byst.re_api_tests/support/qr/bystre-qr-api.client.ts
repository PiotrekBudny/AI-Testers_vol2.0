import type { APIRequestContext, APIResponse } from "@playwright/test";

import type { BystreCreateQrRequest } from "./bystre-qr-api.models";

const qrCreatePath = "/api/v1/qr/create";

export class BystreQrApiClient {
  constructor(private readonly request: APIRequestContext) {}

  create(
    data: Partial<BystreCreateQrRequest>,
    authorization?: string,
  ): Promise<APIResponse> {
    return this.request.post(qrCreatePath, {
      data,
      headers: authorization ? { Authorization: authorization } : undefined,
    });
  }
}
