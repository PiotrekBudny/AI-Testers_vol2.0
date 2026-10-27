export interface BystreLoginRequest {
  username: string;
  password: string;
}

export interface BystreRefreshTokenRequest {
  refreshToken: string;
}

export interface BystreTokenRefreshResponse {
  token: string;
  refreshToken: string;
}

export interface BystreSignupRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface BystreUserEditRequest {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface BystreAuthenticatedUser {
  user: Readonly<BystreSignupRequest>;
  token: string;
}

export interface BystreUserResponse {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
}

export interface BystreLoginResponse {
  token: string | null;
  refreshToken: string | null;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
  mfaRequired: boolean;
  challengeToken: string | null;
  challengeExpiresAt: string | null;
}

export interface BystreErrorResponse {
  message: string;
}

export type BystreValidationErrors = Record<string, unknown>;

export type SystemPromptKind = "chat" | "tool";
export type SystemPromptField = "chatSystemPrompt" | "toolSystemPrompt";
export type SystemPromptDto = Partial<Record<SystemPromptField, string | null>>;
