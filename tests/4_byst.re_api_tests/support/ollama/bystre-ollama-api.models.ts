export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  options?: Record<string, unknown>;
  think?: boolean;
}

export interface OllamaToolDefinition {
  type: string;
  function: {
    name: string;
    description?: string;
    parameters: {
      type: string;
      properties: Record<string, { type: string; description?: string }>;
      oneOf?: { required: string[] }[];
    };
  };
}

export interface OllamaToolCall {
  id?: string | null;
  function: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

export interface OllamaChatMessage {
  role: string;
  content?: string | null;
  thinking?: string | null;
  tool_calls?: OllamaToolCall[] | null;
  tool_name?: string | null;
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaChatMessage[];
  options?: Record<string, unknown>;
  tools?: OllamaToolDefinition[];
  think?: boolean;
}

export interface OllamaGenerateChunk {
  model: string;
  created_at: string;
  response: string | null;
  thinking: string | null;
  done: boolean;
}

export interface OllamaChatChunk {
  model: string;
  created_at: string;
  message: OllamaChatMessage | null;
  done: boolean;
}

export interface OllamaProductList {
  products: { id: number; name: string }[];
  total: number;
  page: number;
  size: number;
}
