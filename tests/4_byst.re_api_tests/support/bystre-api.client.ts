import type { APIRequestContext, APIResponse } from "@playwright/test";

import type {
  BystreLoginRequest,
  BystreSignupRequest,
} from "./bystre-api.models";

const loginPath = "/api/v1/users/signin";
const signupPath = "/api/v1/users/signup";

export class BystreApiClient {
  constructor(private readonly request: APIRequestContext) {}

  login(
    credentials: BystreLoginRequest,
    authorization?: string,
  ): Promise<APIResponse> {
    return this.request.post(loginPath, {
      data: credentials,
      headers: authorization ? { Authorization: authorization } : undefined,
    });
  }

  signup(
    user: Partial<BystreSignupRequest>,
    authorization?: string,
  ): Promise<APIResponse> {
    return this.request.post(signupPath, {
      data: user,
      headers: authorization ? { Authorization: authorization } : undefined,
    });
  }
}
