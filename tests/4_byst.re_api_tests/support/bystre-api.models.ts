export interface BystreLoginRequest {
  username: string;
  password: string;
}

export interface BystreSignupRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
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
