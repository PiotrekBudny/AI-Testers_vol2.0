import type { APIRequestContext, APIResponse } from "@playwright/test";

import type {
  OllamaChatRequest,
  OllamaGenerateRequest,
} from "./bystre-ollama-api.models";

const ollamaPath = "/api/v1/ollama";

export class BystreOllamaApiClient {
  constructor(private readonly request: APIRequestContext) {}

  getToolDefinitions(authorization?: string): Promise<APIResponse> {
    return this.request.get(`${ollamaPath}/chat/tools/definitions`, {
      headers: this.headers("application/json", authorization),
    });
  }

  generate(
    data: Partial<OllamaGenerateRequest>,
    authorization?: string,
  ): Promise<APIResponse> {
    return this.request.post(`${ollamaPath}/generate`, {
      data,
      headers: this.headers("text/event-stream", authorization),
    });
  }

  chat(
    data: Partial<OllamaChatRequest>,
    authorization?: string,
  ): Promise<APIResponse> {
    return this.request.post(`${ollamaPath}/chat`, {
      data,
      headers: this.headers("text/event-stream", authorization),
    });
  }

  chatWithTools(
    data: Partial<OllamaChatRequest>,
    authorization?: string,
  ): Promise<APIResponse> {
    return this.request.post(`${ollamaPath}/chat/tools`, {
      data,
      headers: this.headers("text/event-stream", authorization),
    });
  }

  private headers(
    accept: string,
    authorization?: string,
  ): Record<string, string> {
    return authorization
      ? { Accept: accept, Authorization: authorization }
      : { Accept: accept };
  }
}
