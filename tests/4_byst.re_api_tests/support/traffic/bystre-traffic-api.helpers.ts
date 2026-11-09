import { randomUUID } from "node:crypto";

import { type APIResponse, expect } from "@playwright/test";

import type {
  TrafficLogEntryDto,
  TrafficLogsPageDto,
} from "./bystre-traffic-api.models";

const legacyMode = process.env.BYSTRE_TRAFFIC_LEGACY_PUBLIC_ACCESS ?? "true";
if (!["true", "false"].includes(legacyMode))
  throw new Error("BYSTRE_TRAFFIC_LEGACY_PUBLIC_ACCESS must be true or false.");
export const legacyPublicAccess = legacyMode === "true";
export const trafficMaxPageSize = Number(
  process.env.BYSTRE_TRAFFIC_MAX_PAGE_SIZE ?? 100,
);
if (!Number.isSafeInteger(trafficMaxPageSize) || trafficMaxPageSize < 1)
  throw new Error("BYSTRE_TRAFFIC_MAX_PAGE_SIZE must be a positive integer.");
export const invalidTrafficSessions = [
  { name: "15 characters", value: "s".repeat(15) },
  { name: "129 characters", value: "s".repeat(129) },
  { name: "punctuation", value: "invalid.session.12345" },
  { name: "embedded spaces", value: "invalid session 12345" },
];

export async function readTrafficPage(
  response: APIResponse,
): Promise<TrafficLogsPageDto> {
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/json");
  const page = (await response.json()) as TrafficLogsPageDto;
  expect(Array.isArray(page.content)).toBe(true);
  for (const value of [
    page.pageNumber,
    page.pageSize,
    page.totalElements,
    page.totalPages,
  ]) {
    expect(Number.isSafeInteger(value)).toBe(true);
    expect(value).toBeGreaterThanOrEqual(0);
  }
  expect(page.pageSize).toBeGreaterThan(0);
  expect(page.content.length).toBeLessThanOrEqual(page.pageSize);
  expect(page.totalPages).toBe(Math.ceil(page.totalElements / page.pageSize));
  return page;
}

export function createTrafficSessionId(): string {
  return `traffic-${randomUUID()}`;
}

export function expectTrafficLogEntry(
  entry: TrafficLogEntryDto,
  expected: Partial<
    Pick<TrafficLogEntryDto, "clientSessionId" | "method" | "path" | "status">
  > = {},
): void {
  expect(entry).toMatchObject({
    correlationId: expect.stringMatching(/\S+/),
    timestamp: expect.stringMatching(/^\d{4}-\d\d-\d\dT/),
    clientSessionId: expected.clientSessionId ?? expect.any(String),
    method: expected.method ?? expect.stringMatching(/^[A-Z]+$/),
    path: expected.path ?? expect.stringMatching(/^\//),
    status: expected.status ?? expect.any(Number),
    durationMs: expect.any(Number),
    requestHeaders: expect.any(Object),
    requestBodyTruncated: expect.any(Boolean),
    requestBodyOriginalLength: expect.any(Number),
    requestBodyStoredLength: expect.any(Number),
    responseHeaders: expect.any(Object),
    responseBodyTruncated: expect.any(Boolean),
    responseBodyOriginalLength: expect.any(Number),
    responseBodyStoredLength: expect.any(Number),
  });

  expect(Number.isFinite(Date.parse(entry.timestamp))).toBe(true);
  expect(Number.isInteger(entry.status)).toBe(true);
  expect(entry.status).toBeGreaterThanOrEqual(100);
  expect(entry.status).toBeLessThan(600);
  expect(Number.isInteger(entry.durationMs)).toBe(true);
  expect(entry.durationMs).toBeGreaterThanOrEqual(0);
  expect(entry.requestBodyOriginalLength).toBeGreaterThanOrEqual(0);
  expect(entry.requestBodyStoredLength).toBeGreaterThanOrEqual(0);
  expect(entry.responseBodyOriginalLength).toBeGreaterThanOrEqual(0);
  expect(entry.responseBodyStoredLength).toBeGreaterThanOrEqual(0);
  expect(entry).toHaveProperty("requestBody");
  expect(entry).toHaveProperty("responseBody");
  for (const value of [
    entry.queryString,
    entry.requestContentType,
    entry.responseContentType,
  ]) {
    expect(value === null || typeof value === "string").toBe(true);
  }
}
