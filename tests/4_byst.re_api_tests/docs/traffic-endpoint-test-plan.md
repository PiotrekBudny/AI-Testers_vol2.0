# Traffic API Endpoint Test Implementation Plan

## Goal and scope

Create behavior-focused Playwright API coverage for the three traffic operations in `tests/4_byst.re_api_tests/API_TEST_PLAN.md`. Keep one operation per spec file as required by the parent plan. Split request methods by controller/domain so the client for one area does not become a monolith as endpoint coverage grows.

| Operation                                  | OpenAPI operation ID | Planned spec                                             |
| ------------------------------------------ | -------------------- | -------------------------------------------------------- |
| `GET /api/v1/traffic/info`                 | `getTrafficInfo`     | `traffic/get-traffic-info.api.spec.ts`                   |
| `GET /api/v1/traffic/logs`                 | `getTrafficLogs`     | `traffic/get-traffic-logs.api.spec.ts`                   |
| `GET /api/v1/traffic/logs/{correlationId}` | `getTrafficLog`      | `traffic/get-traffic-logs-by-correlation-id.api.spec.ts` |

`GET /api/v1/traffic/logs/{correlationId}` is currently planned but has no
dedicated test. Its spec was removed after the live API returned HTTP 500 during
the 2026-10-19 suite run. Revisit this operation when the endpoint is stable.

## Sources and current evidence

- Contract: `tests/4_byst.re_api_tests/docs/bystre-api-docs.tmp.json` (checked-in OpenAPI snapshot).
- Coverage and file rules: `tests/4_byst.re_api_tests/API_TEST_PLAN.md`.
- Existing patterns: `support/users/bystre-users-api.client.ts`, `support/users/bystre-users-api.models.ts`, `support/users/bystre-users-api.fixtures.ts`, and the controller-grouped endpoint specs.
- Runtime probe: four read-only `curl.exe` requests were attempted on 2026-10-19 against `/traffic/info`, two `/traffic/logs` query variants, and a missing-correlation lookup. All failed to connect to `awesome.byst.re:443` (`curl: (7) Could not connect to server`). No live behavior is confirmed yet.

The snapshot describes a conditional access rule: `X-Client-Session-Id` is required unless legacy public access is enabled; a Bearer token may be required unless that mode is enabled. The traffic operations have an empty OpenAPI `security` array while also documenting possible `401` responses. Do not turn the API_TEST_PLAN's `Public` label into an unconditional anonymous-access assertion until the target test environment is reachable and its mode is established.

## Contract facts to encode

- `X-Client-Session-Id` is trimmed and accepts 16–128 ASCII letters, digits, underscores, or hyphens.
- `GET /traffic/info` returns `webSocketEndpoint`, `topic`, and `description`.
- `GET /traffic/logs` accepts `page`, `size`, `method`, `status`, `pathContains`, `text`, `from`, and `to`. The documented page index is zero-based; size is clamped from 1 to the configured maximum. `from` and `to` are inclusive ISO-8601 instants with offsets; blank values mean no bound.
- A page response contains `content`, `pageNumber`, `pageSize`, `totalElements`, and `totalPages`.
- A log entry contains correlation ID, timestamp, session ID, method, path, query string, status, duration, request/response header and content metadata, and sanitized request/response body metadata. Several fields are nullable; request/response bodies may be any JSON value or null.
- `GET /traffic/logs/{correlationId}` returns one log entry or documented `404` with an empty body when no entry exists.
- The snapshot documents `400` for invalid session headers, pagination, or time filters, and possible `401` for unavailable/invalid authentication in protected mode.

## Reuse and client-split design

Keep request methods grouped by controller/domain instead of adding every new operation to one client:

- Add `BystreTrafficApiClient` in `support/traffic/bystre-traffic-api.client.ts` for the three `/traffic/*` operations in this plan.
- Keep the existing user/auth methods in `support/users/bystre-users-api.client.ts` (`BystreUsersApiClient`); do not add traffic methods to it. As coverage expands, add focused clients such as `BystreProductsApiClient` for `/products/*`, `BystreCartApiClient` for `/cart/*`, and `BystreOrdersApiClient` for `/orders/*` when those controllers are implemented.
- Give each domain client its own route constants and typed method inputs. Share low-level helpers only when they are genuinely cross-domain; don't create a generic request abstraction that hides the controller's contract.
- Add `TrafficInfoDto`, `TrafficLogEntryDto`, `TrafficLogsPageDto`, and `TrafficLogQuery` to `support/traffic/bystre-traffic-api.models.ts`. Future product DTOs should live in a product model module rather than expanding a catch-all model file.
- Expose `bystreTrafficApi` through `support/traffic/bystre-traffic-api.fixtures.ts`, built from the same `APIRequestContext`. Compose it with the user fixture only when a test requests `authenticatedUser`; client-only traffic checks should not create an account.
- Keep common traffic-specific helpers under `support/traffic/`: one generator for valid unique session IDs, one validator for the documented entry shape, and (if characterization confirms eventual persistence) one bounded poll helper that waits for a log created by the current test. Keep endpoint-specific expected values in each spec.
- Use the session ID as the isolation key for records generated by a test. Don't rely on hosted seed data, a fixed correlation ID, request ordering, or a global record count. Avoid logging or asserting real credentials or sensitive request/response bodies.
- Keep error assertions focused on documented status and useful response contract (validation map or empty 404 body). Do not duplicate common DTO checks in every spec.

## Ordered implementation work

### 0. Restore and record runtime characterization

**Gate:** Connect to the configured API base URL. Repeat the four read-only probes and record status, content type, selected safe response fields, and relevant response headers without recording secrets.

Determine:

- Whether a session ID is required, whether anonymous calls work, and whether Bearer auth is needed in the chosen test environment.
- The response schema and example values for info, page, and entry responses.
- Whether the traffic service captures its own `/traffic/*` requests, whether records become searchable immediately or with delay, and how the correlation ID is made available (response header or stored entry).
- Actual behavior for missing/invalid session headers, malformed pagination/time filters, an unknown correlation ID, and page-size clamping.

**Exit:** A short characterization note is available and the test environment/access expectations are deterministic. If the API remains unreachable, implementation can proceed from the snapshot, but the environment-dependent cases stay explicitly provisional and the specs cannot be claimed as runtime-verified.

### 1. Add the focused traffic client, models, and fixture

Add `BystreTrafficApiClient`, traffic DTO/query types, and the `bystreTrafficApi` fixture described above. Implement one method for each operation; keep route constants inside the traffic client. Let its typed query serializer handle URL encoding so specs use semantic arguments instead of hand-built URLs. Do not extend `BystreUsersApiClient` with traffic methods. Keep optional session and authorization headers request-scoped, with no defaults applied to the shared request context.

As later controllers are covered, follow the same pattern: a focused client and model module per controller/domain (for example, products) wired as separate fixtures under matching `support/<controller>/` folders. Keep specs under matching `<controller>/` folders. Share only cross-cutting transport helpers if a real duplication appears.

**Exit:** Each traffic method maps to exactly one documented operation, traffic-specific types are outside the users models module, and the traffic fixture is separate while allowing tests to opt into the authenticated-user fixture.

### 2. Implement `traffic/get-traffic-info.api.spec.ts`

Cover:

- Happy path: assert status and JSON object shape; endpoint/topic are non-empty path-like strings and description is non-empty. Match exact documented examples only if characterization confirms they are stable contract values.
- Access behavior: assert the mode established in step 0 (anonymous success or documented auth failure); do not infer this from the empty OpenAPI security array alone.
- Validation: with session enforcement enabled, exercise missing and malformed IDs (too short, invalid character, and over maximum) and assert the characterized `400` validation response. If public legacy mode bypasses the header, test validation using a mode/configuration where validation is enforced or record the scenario as environment-blocked.

**Exit:** No status-only success assertion; the info payload is checked against its documented structure.

### 3. Implement `traffic/get-traffic-logs.api.spec.ts`

Cover:

- Happy path: request a small page; assert page metadata types and invariants (`pageNumber`, non-negative totals, valid `totalPages` relationship where total is nonzero), array content, and valid entry shapes for every returned entry.
- Isolation and positive filter behavior: issue a safe, distinctive request using a per-test session ID, locate its persisted entry, then query by session plus method, status, and `pathContains`. Assert every result matches the requested filter and the generated record is included. Use a bounded poll only if step 0 confirms persistence is asynchronous.
- Time range: use the generated entry timestamp as an inclusive bound and check inclusion; add an outside-bound exclusion only if timestamp precision and observed filtering make it deterministic.
- Pagination and size: verify page selection and a size of 1. Check upper-size clamping against the configured maximum only after its value is known; don't hard-code deployment configuration.
- Validation: malformed date, negative page, invalid size/status, and invalid session header, retaining only cases confirmed to have stable documented outcomes.
- Access behavior: cover missing/invalid auth as established in step 0.

Treat `text` as a separate behavior check only after characterization establishes which log fields it searches and its matching semantics. Avoid assuming ordering because the snapshot does not define it.

**Exit:** Tests validate pagination, record shape, isolation, and at least one positive filter against test-owned traffic, not only `200`.

### 4. Implement `traffic/get-traffic-logs-by-correlation-id.api.spec.ts`

Cover:

- Happy path: obtain a correlation ID from a log created by the test (using the response header or the entry found by its isolated session), fetch it, and assert the full entry shape and identity fields match the list result.
- Not found: use a unique impossible correlation ID and assert `404` plus an empty body as documented.
- Validation and access: exercise malformed session ID / missing or invalid auth only where step 0 confirms these checks apply consistently to this route.

**Exit:** The successful lookup is linked to a record created during this test, and the negative case doesn't depend on shared database contents.

### 5. Review integration and update tracking

- Keep the three specs operation-specific and tag them consistently with existing Bystre tests (`@bystre` plus a focused traffic tag if the suite uses one).
- Review helper boundaries: no duplicated entry-shape assertions, no generic assertion framework, no traffic methods added to the user/auth client, and no shared fixture that creates an account when traffic access doesn't require one.
- Update the three OPS rows in `API_TEST_PLAN.md` when their dedicated specs are implemented. Record implementation status separately from latest runtime result, and add a progress-log entry with the environment/mode and focused-run outcome.
- Revisit the `Public` security labels after runtime characterization; align the plan with the actual configured behavior and explain any environment-dependent access rule.

## Risks and decisions to resolve at step 0

- Hosted API connectivity is currently unavailable from this environment, so live statuses and response examples were not observed.
- The OpenAPI snapshot says traffic access can depend on session-header and Bearer-token configuration, which conflicts with a simple unconditional `Public` classification.
- Log persistence timing, self-capture behavior, correlation-ID exposure, text matching, response field nullability in practice, and configured max page size are not specified sufficiently to assert without a probe.
- Traffic entries may contain sanitized request/response metadata. Tests should use harmless inputs and avoid dumping entry bodies or headers into failure output.

## Completion criteria

Each operation has its dedicated spec; success assertions cover response data and domain behavior; the logs test exercises isolated, test-generated records and filters; detail lookup matches a record created by the test and verifies a stable not-found result; reusable types/client/assertion helpers are shared without hiding operation behavior; runtime-dependent assumptions are recorded; and `API_TEST_PLAN.md` reflects current coverage and latest run status.
