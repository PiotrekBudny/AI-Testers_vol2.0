export type ApiSuccessResponse<TData = Record<string, unknown>> = {
  success: true;
  data: TData;
  message?: string;
};

export type ApiErrorResponse = {
  success: false;
  error: string;
};
