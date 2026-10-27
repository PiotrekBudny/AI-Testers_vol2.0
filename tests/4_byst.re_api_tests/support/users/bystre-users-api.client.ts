import type { APIRequestContext, APIResponse } from "@playwright/test";

import type {
  BystreLoginRequest,
  BystreMfaChallengeRequest,
  BystreMfaCodeRequest,
  BystreMfaProtectedActionRequest,
  BystrePasswordResetRequest,
  BystreRefreshTokenRequest,
  BystreSignupRequest,
  BystreUserEditRequest,
  SystemPromptDto,
  SystemPromptKind,
} from "./bystre-users-api.models";

const loginPath = "/api/v1/users/signin";
const signupPath = "/api/v1/users/signup";
const mePath = "/api/v1/users/me";
const logoutPath = "/api/v1/users/logout";
const refreshPath = "/api/v1/users/refresh";
const usersPath = "/api/v1/users";
const mfaPath = "/api/v1/users/2fa";

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

  updateByUsername(
    username: string,
    data: Partial<BystreUserEditRequest>,
    authorization?: string,
  ): Promise<APIResponse> {
    return this.request.put(`${usersPath}/${encodeURIComponent(username)}`, {
      data,
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

  forgotPassword(identifier?: string): Promise<APIResponse> {
    return this.request.post(`${usersPath}/password/forgot`, {
      data: { identifier },
    });
  }

  resetPassword(
    data: Partial<BystrePasswordResetRequest>,
  ): Promise<APIResponse> {
    return this.request.post(`${usersPath}/password/reset`, { data });
  }

  completeMfaSignIn(
    data: Partial<BystreMfaChallengeRequest>,
  ): Promise<APIResponse> {
    return this.request.post(`${usersPath}/signin/2fa`, { data });
  }

  getMfaStatus(authorization?: string): Promise<APIResponse> {
    return this.request.get(`${mfaPath}/status`, {
      headers: authorization ? { Authorization: authorization } : undefined,
    });
  }

  setupMfa(authorization?: string): Promise<APIResponse> {
    return this.request.post(`${mfaPath}/setup`, {
      headers: authorization ? { Authorization: authorization } : undefined,
    });
  }

  confirmMfa(
    data: Partial<BystreMfaCodeRequest>,
    authorization?: string,
  ): Promise<APIResponse> {
    return this.request.post(`${mfaPath}/confirm`, {
      data,
      headers: authorization ? { Authorization: authorization } : undefined,
    });
  }

  replaceMfaRecoveryCodes(
    data: Partial<BystreMfaProtectedActionRequest>,
    authorization?: string,
  ): Promise<APIResponse> {
    return this.request.post(`${mfaPath}/recovery-codes`, {
      data,
      headers: authorization ? { Authorization: authorization } : undefined,
    });
  }

  disableMfa(
    data: Partial<BystreMfaProtectedActionRequest>,
    authorization?: string,
  ): Promise<APIResponse> {
    return this.request.post(`${mfaPath}/disable`, {
      data,
      headers: authorization ? { Authorization: authorization } : undefined,
    });
  }

  deleteOwnAccount(
    username: string,
    authorization?: string,
  ): Promise<APIResponse> {
    return this.request.delete(
      `/api/v1/users/${encodeURIComponent(username)}/right-to-be-forgotten`,
      {
        headers: authorization ? { Authorization: authorization } : undefined,
      },
    );
  }

  deleteByUsername(
    username: string,
    authorization?: string,
  ): Promise<APIResponse> {
    return this.request.delete(`${usersPath}/${encodeURIComponent(username)}`, {
      headers: authorization ? { Authorization: authorization } : undefined,
    });
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
