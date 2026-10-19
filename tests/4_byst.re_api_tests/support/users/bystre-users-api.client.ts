import type { APIRequestContext, APIResponse } from "@playwright/test";

import type {
  BystreLoginRequest,
  BystreRefreshTokenRequest,
  BystreSignupRequest,
  SystemPromptDto,
  SystemPromptKind,
} from "./bystre-users-api.models";

const loginPath = "/api/v1/users/signin";
const signupPath = "/api/v1/users/signup";
const mePath = "/api/v1/users/me";
const logoutPath = "/api/v1/users/logout";
const refreshPath = "/api/v1/users/refresh";
const usersPath = "/api/v1/users";

export class BystreUsersApiClient {
  constructor(private readonly request: APIRequestContext) {}

  getMe(authorization?: string): Promise<APIResponse> {
    return this.request.get(mePath, {
      headers: authorization ? { Authorization: authorization } : undefined,
    });
  }

  getAll(authorization?: string): Promise<APIResponse> {
    return this.request.get(usersPath, {
      headers: authorization ? { Authorization: authorization } : undefined,
    });
  }

  getByUsername(
    username: string,
    authorization?: string,
  ): Promise<APIResponse> {
    return this.request.get(`${usersPath}/${encodeURIComponent(username)}`, {
      headers: authorization ? { Authorization: authorization } : undefined,
    });
  }

  getSystemPrompt(
    kind: SystemPromptKind,
    authorization?: string,
  ): Promise<APIResponse> {
    return this.request.get(`/api/v1/users/${kind}-system-prompt`, {
      headers: authorization ? { Authorization: authorization } : undefined,
    });
  }

  updateSystemPrompt(
    kind: SystemPromptKind,
    data: SystemPromptDto,
    authorization?: string,
  ): Promise<APIResponse> {
    return this.request.put(`/api/v1/users/${kind}-system-prompt`, {
      data,
      headers: authorization ? { Authorization: authorization } : undefined,
    });
  }

  logout(authorization?: string): Promise<APIResponse> {
    return this.request.post(logoutPath, {
      headers: authorization ? { Authorization: authorization } : undefined,
    });
  }

  refresh(refreshToken: string): Promise<APIResponse> {
    const data: BystreRefreshTokenRequest = { refreshToken };
    return this.request.post(refreshPath, { data });
  }

  deleteOwnAccount(
    username: string,
    authorization: string,
  ): Promise<APIResponse> {
    return this.request.delete(
      `/api/v1/users/${encodeURIComponent(username)}/right-to-be-forgotten`,
      { headers: { Authorization: authorization } },
    );
  }

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
