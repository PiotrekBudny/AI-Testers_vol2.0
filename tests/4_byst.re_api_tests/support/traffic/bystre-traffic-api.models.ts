export type TrafficJsonValue =
  | null
  | boolean
  | number
  | string
  | TrafficJsonValue[]
  | { [key: string]: TrafficJsonValue };

export interface TrafficInfoDto {
  webSocketEndpoint: string;
  topic: string;
  description: string;
}

export interface TrafficLogEntryDto {
  correlationId: string;
  timestamp: string;
  clientSessionId: string | null;
  method: string;
  path: string;
  queryString: string | null;
  status: number;
  durationMs: number;
  requestHeaders: Record<string, unknown>;
  requestContentType: string | null;
  requestBody: TrafficJsonValue;
  requestBodyTruncated: boolean;
  requestBodyOriginalLength: number;
  requestBodyStoredLength: number;
  responseHeaders: Record<string, unknown>;
  responseContentType: string | null;
  responseBody: TrafficJsonValue;
  responseBodyTruncated: boolean;
  responseBodyOriginalLength: number;
  responseBodyStoredLength: number;
}

export interface TrafficLogsPageDto {
  content: TrafficLogEntryDto[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface TrafficLogQuery {
  page?: number;
  size?: number;
  method?: string;
  status?: number;
  pathContains?: string;
  text?: string;
  from?: string;
  to?: string;
}

export interface TrafficRequestOptions {
  clientSessionId?: string;
  authorization?: string;
}
