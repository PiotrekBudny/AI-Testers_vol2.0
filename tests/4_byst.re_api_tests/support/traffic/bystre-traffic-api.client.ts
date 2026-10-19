import type { APIRequestContext, APIResponse } from "@playwright/test";

import type {
  TrafficLogQuery,
  TrafficRequestOptions,
} from "./bystre-traffic-api.models";

const trafficInfoPath = "/api/v1/traffic/info";
const trafficLogsPath = "/api/v1/traffic/logs";

export class BystreTrafficApiClient {
  constructor(private readonly request: APIRequestContext) {}

  getInfo(options: TrafficRequestOptions): Promise<APIResponse> {
    return this.request.get(trafficInfoPath, {
      headers: this.headers(options),
    });
  }

  getLogs(
    query: TrafficLogQuery,
    options: TrafficRequestOptions,
  ): Promise<APIResponse> {
    const params = Object.entries(query).reduce<Record<string, string>>(
      (result, [key, value]) => {
        if (value !== undefined) {
          result[key] = String(value);
        }
        return result;
      },
      {},
    );
    return this.request.get(trafficLogsPath, {
      headers: this.headers(options),
      params,
    });
  }

  private headers(options: TrafficRequestOptions): Record<string, string> {
    return {
      ...(options.clientSessionId !== undefined
        ? { "X-Client-Session-Id": options.clientSessionId }
        : {}),
      ...(options.authorization
        ? { Authorization: options.authorization }
        : {}),
    };
  }
}
