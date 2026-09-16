import type { APIResponse } from "@playwright/test";

export type ApiSuccessResponse<TData = Record<string, unknown>> = {
  success: true;
  data: TData;
  message?: string;
};

export type ApiErrorResponse = {
  success: false;
  error: string;
};

export type LoginResponseData = {
  token: string;
  user: {
    email: string;
  };
};

export type RegisterResponseData = {
  token: string;
  user: {
    id: number;
    email: string;
    displayedName?: string;
    isActive: boolean;
  };
};

export async function readApiResponse<TResponse>(
  response: APIResponse,
): Promise<TResponse> {
  return response.json() as Promise<TResponse>;
}
