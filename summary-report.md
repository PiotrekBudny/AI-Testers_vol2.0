# API Test Case Proposal — Rolnopol OpenAPI Schema

Source schema: `http://localhost:3000/schema/openapi.json` (Rolnopol v1.79.0)

This report summarizes proposed API test cases derived from analysis of the OpenAPI schema, split across three endpoint groups. Each subsection lists concrete test scenarios per endpoint (method + path). Items marked **(undocumented)** are behaviors not explicitly defined in the schema's `responses` object and should be verified against the live API before being treated as hard requirements.

---

## Authentication, Users & System

**Version**

### GET /

- No credentials required, request succeeds → 200 with `ApiVersions` body containing `message`, `currentVersion`, `versions`, `endpoints`.
- `currentVersion` matches a key present in `versions` object → structural consistency check.
- Response `content-type` is `application/json` and body has no `success`/`error` envelope fields (schema-specific shape).

**Authentication**

### POST /register

- Valid email + password (3–50 chars) + no `displayedName` → 201, `SuccessResponse.success === true`.
- Valid email + password + `displayedName` (3–20 chars) → 201.
- Missing `email` → 400 `Error`.
- Missing `password` → 400 `Error`.
- Invalid email format (e.g. `not-an-email`) → 400 `Error`.
- `password` length 2 (below minLength 3) → 400 `Error`.
- `password` length 51 (above maxLength 50) → 400 `Error`.
- `password` boundary length 3 → 201 (lower boundary valid).
- `password` boundary length 50 → 201 (upper boundary valid).
- `displayedName` length 2 (below minLength 3) → 400 `Error`.
- `displayedName` length 21 (above maxLength 20) → 400 `Error`.
- `displayedName` boundary length 3 → 201; boundary length 20 → 201.
- Register with an email that already exists → 409 `Error`.
- Empty request body `{}` → 400 `Error` (both required fields missing).

### POST /login

- Correct email + password for existing user → 200 `LoginResponse` with non-empty `token`, `id`, `userId`, `displayedName`, `email`, `expiration`.
- Correct email, wrong password → 401 `Error`.
- Non-existent email → 401 `Error`.
- Empty/missing `password` → verify actual status (schema documents only 200/401).
- Empty/missing `email` → verify actual status (same caveat as above).
- Case-sensitivity of email login (e.g. `USER@Example.com` vs stored `user@example.com`) → confirm expected 200/401 behavior.

### POST /logout

- Call with valid session/token present → 200 `SuccessResponse`; confirm token invalidation on reuse.
- Call without any token → 200 per schema (no `security` array declared) — confirm this is intentional.

### GET /authorization

- Valid `token` header → 200 `SuccessResponse` with current user data.
- Missing `token` header → 401 `Error`.
- Expired token → 401 `Error`.
- Malformed/garbage token string → 401 `Error`.

### POST /authorization

- Valid `token` in body (`TokenValidation`) → 200 `SuccessResponse` with refreshed user data.
- Invalid/expired token in body → 401 `Error`.
- Missing required `token` field in body → verify actual status (schema only documents 200/401).
- Empty string `token` → 401 `Error`.

**System**

### GET /healthcheck

- Database connected and service up → 200 `SuccessResponse` with `status: "healthy"`, numeric `uptime`, `database.connected === true`, `version` string.
- Database disconnected/degraded (test-env fault injection) → 503 `Error`.
- `status` enum only ever `healthy`/`unhealthy` — assert no other value is returned.

### GET /ping

- No auth, no params → 200 `{ message: "pong" }`.

### GET /databases

- Healthy databases → 200 `DatabaseHealth` with `instances`, `status`, `health`, `validation`.
- Simulated database failure (test-env only) → 500 `Error`.

### GET /memory

- Standard call → 200 `MemoryStats` with numeric `rss`, `heapTotal`, `heapUsed`, `external`, `arrayBuffers`.
- Simulated failure (test-env only) → 500 `Error`.

### GET /about

- No auth → 200 `SuccessResponse` with application metadata payload.

### GET /documentation

- No auth → 200 `SuccessResponse` with documentation JSON payload.

### GET /statistics

- No auth → 200 `SystemStatistics` with integer `users`, `farms`, `staff`, `animals`, `offers`, numeric `area`, `avgStaffAge`.
- Simulated internal error (test-env only) → 500 `Error`.

### GET /metrics

- Feature flag `prometheusMetricsEnabled` = true → 200, `text/plain` Prometheus-formatted body.
- Feature flag `prometheusMetricsEnabled` = false (default) → 404 `Error` ("Metrics endpoint disabled").
- Simulated internal error while flag enabled → 500 `Error`.

### GET /shutdown

- Valid call in an isolated/dedicated test environment only → 200 `SuccessResponse`; **destructive — do not run against shared environments.** No documented auth/RBAC guard — flag as a potential security gap.

**Debug**

### GET /debug

- No query params → 200 with current `DEBUG_MODE`, `LOG_STACK_TRACE`, `LOG_REQUEST` booleans.
- `?debug=true` / `?debug=false` → 200, `DEBUG_MODE` reflects value.
- `?log=true` → 200, `LOG_STACK_TRACE` reflects `true`.
- `?request=true` → 200, `LOG_REQUEST` reflects `true`.
- `?all=true` → 200, all three flags reflect `true`.
- `?all=false&debug=true` combined → 200, confirm precedence rule.
- Invalid enum value (e.g. `?debug=yes`) → verify behavior (ignored/default vs. 400).

### POST /debug/database/restore-base

- Valid call in isolated test environment → 200 with `baseStateVersion` and `restored` per-database counters.
- Simulated restore failure → 500 `Error`.
- **Destructive operation** — only run against disposable test databases.

**Logs**

### GET /logs

- No auth, standard call → 200 with `logs` array of objects.
- Environment with no log entries yet → 200 with `logs: []`.

**Users**

### GET /users/profile

- Valid token → 200 `SuccessResponse` with `User`-shaped data.
- Missing token header → 401 `Error`.
- Invalid/expired token → 401 `Error`.

### PUT /users/profile

- Valid token + valid `displayedName`/`email`/`password` update → 200 `SuccessResponse`.
- Valid token + empty body `{}` (all fields optional) → 200, no-op update.
- `displayedName`/`password` below/above min/max length → 400 `Error`; boundary lengths → 200.
- Invalid `email` format → 400 `Error`.
- Missing token → 401 `Error`.

### DELETE /users/profile

- Valid token deletes own account → 200 `SuccessResponse`.
- Missing token → 401 `Error`.
- Re-use of the same token after deletion → 401 `Error`.

### PUT /users/{userId}

- `userId` matches own authenticated user + valid update body → 200 `SuccessResponse`.
- `userId` belongs to a different user → 403 `Error`.
- Missing token → 401 `Error`.
- Non-existent `userId` → 404 `Error`.
- Payload violating `UserProfileUpdate` constraints on own profile → verify status (400 not documented for this path).

### GET /users/statistics

- Valid token → 200 `SuccessResponse` with current user's stats.
- Missing token → 401 `Error`.

### GET /users/statistics/all

- Valid admin token → 200 `SuccessResponse` with all-users statistics.
- Valid non-admin token → 403 `Error`.
- Missing token → 401 `Error`.

---

## Fields, Staff, Assignments, Animals & Map

> All listed endpoints require `TokenAuth` (header `token`) except `GET /animals/types`. Status codes marked **(undocumented)** are not present in the operation's `responses` object in the schema and must be verified against the live API.

### GET /fields

- Authenticated user with existing fields → 200, array of `Field`, all items scoped to caller's `userId`.
- Authenticated user with zero fields → 200, empty array `[]`.
- Missing/invalid token → 401 **(undocumented)**.

### POST /fields

- Valid payload (`name`, `district`, `area`) → 201, returns created `Field` with generated `id` and `userId` = caller.
- Missing `name`/`district`/`area` → 400 **(undocumented; `Field` schema declares no `required` array — verify)**.
- `area` as non-numeric string → 400 **(undocumented)**, type mismatch.
- `area` as zero/negative number → verify accept/reject **(no `minimum` declared)**.
- Missing/invalid token → 401 **(undocumented)**.

### PUT /fields/{id}

- Owner updates own field with valid payload → 200, returns updated `Field`.
- Non-existent `id` → 404 **(undocumented; only 200 declared)**.
- `id` belonging to another user's field → 403/404 ownership error **(undocumented)**.
- Non-numeric `id` path param → 400 **(undocumented)**.
- Missing/invalid token → 401 **(undocumented)**.

### DELETE /fields/{id}

- Owner deletes own field → 200, `SuccessResponse`.
- Non-existent `id` → 404 **(undocumented)**.
- `id` belonging to another user's field → 403/404 ownership error **(undocumented)**.
- Deleting the same field twice → second call 404 **(undocumented)**.
- Missing/invalid token → 401 **(undocumented)**.

### POST /fields/districts

- Caller with fields across multiple districts → 200, `SuccessResponse.data` lists distinct districts.
- Caller with no fields → 200, empty list.
- Missing/invalid token → 401 **(undocumented)**.

### POST /fields/districts/{id}

- Valid field `id` owned by caller → 200, districts for that field.
- Non-existent field `id` → 404 **(undocumented)**.
- Non-numeric `id` path param → 400 **(undocumented)**.
- Field `id` owned by another user → 403/404 ownership error **(undocumented)**.
- Missing/invalid token → 401 **(undocumented)**.

### GET /staff

- Authenticated user with staff records → 200, array of `Staff` scoped to caller.
- Authenticated user with zero staff → 200, empty array `[]`.
- Missing/invalid token → 401 **(undocumented)**.

### POST /staff

- Valid payload (`name`, `surname`, `age`) → 201, returns created `Staff` with `id`/`userId`.
- Missing `name`/`surname` → 400 **(undocumented; no `required` array — verify)**.
- Negative or non-integer `age` → 400 **(undocumented; no constraints declared)**.
- Missing/invalid token → 401 **(undocumented)**.

### PUT /staff/{id}

- Owner updates own staff member → 200, returns updated `Staff`.
- Non-existent `id` → 404 **(undocumented)**.
- `id` belonging to another user's staff → 403/404 ownership error **(undocumented)**.
- Non-numeric `id` path param → 400 **(undocumented)**.
- Missing/invalid token → 401 **(undocumented)**.

### DELETE /staff/{id}

- Owner deletes own staff member → 200, `SuccessResponse`.
- Non-existent `id` → 404 **(undocumented)**.
- `id` belonging to another user's staff → 403/404 ownership error **(undocumented)**.
- Missing/invalid token → 401 **(undocumented)**.

### POST /fields/assign

- Valid `fieldId` + `staffId` (both owned by caller) → 201, returns created `Assignment`.
- Non-existent `fieldId`/`staffId` → 400/404 **(undocumented; only 201 declared)**.
- `fieldId`/`staffId` owned by another user → 403/404 ownership error **(undocumented)**.
- Missing `fieldId` or `staffId` in body → 400 **(undocumented)**.
- Duplicate assignment (same field+staff twice) → verify allowed vs. 400/409 **(undocumented)**.
- Missing/invalid token → 401 **(undocumented)**.

### GET /fields/assign

- Authenticated user with/without assignments → 200, array scoped to caller (possibly empty).
- Missing/invalid token → 401 **(undocumented)**.
- Cross-check consistency with `GET /assignments` (appears to be a duplicate route).

### GET /assignments

- Authenticated user with/without assignments → 200, array scoped to caller (possibly empty).
- Missing/invalid token → 401 **(undocumented)**.

### DELETE /assignments/{id}

- Owner deletes own assignment → 200, `SuccessResponse`.
- Non-existent `id` → 404 **(undocumented)**.
- `id` belonging to another user's assignment → 403/404 ownership error **(undocumented)**.
- Missing/invalid token → 401 **(undocumented)**.

### DELETE /fields/assign/{id}

- Owner deletes own assignment via this alternate route → 200, `SuccessResponse`.
- Non-existent `id` → 404 **(undocumented)**.
- Missing/invalid token → 401 **(undocumented)**.
- Cross-check consistency vs. `DELETE /assignments/{id}` (possible duplicate route).

### GET /animals

- Authenticated user with/without animals → 200, array scoped to caller (possibly empty).
- Missing/invalid token → 401 **(undocumented)**.

### POST /animals

- Valid payload `{type: <valid key>, amount: 5, fieldId: <owned field>}` → 201, returns `Animal`.
- Missing `type` → 400 (matches `AnimalCreate.required`).
- Missing `amount` → 400 (matches `AnimalCreate.required`).
- `amount` = 0 or negative → 400 (violates `minimum: 1`).
- `amount` as non-numeric string → 400.
- Unknown/invalid `type` value (not in `/animals/types` list) → verify 400 **(undocumented)**.
- `fieldId` referencing a field not owned by caller → 400/403/404 **(undocumented)**.
- `fieldId` omitted (optional) → 201, animal created without field association.
- Missing/invalid token → 401 **(undocumented)**.

### PUT /animals/{id}

- Owner updates own animal with valid `AnimalCreate` payload → 200, returns updated `Animal`.
- Non-existent `id` → 404 (documented `Error` response).
- `id` belonging to another user's animal → 403/404 ownership error **(undocumented status code)**.
- Missing `type`/`amount` in body → 400 **(undocumented for this operation)**.
- `amount` = 0 or negative → 400 **(undocumented for this operation)**.
- Non-numeric `id` path param → 400 **(undocumented)**.
- Missing/invalid token → 401 **(undocumented)**.

### DELETE /animals/{id}

- Owner deletes own animal → 200, `SuccessResponse`.
- Non-existent `id` → 404 **(undocumented for this operation)**.
- `id` belonging to another user's animal → 403/404 ownership error **(undocumented)**.
- Missing/invalid token → 401 **(undocumented)**.

### GET /animals/types

- No auth required (no `security` block declared) → 200 regardless of token.
- Response returns non-empty array where every item has `key`, `fullName`, `description`, `icon` (all required).
- At least one returned `key` should be usable as `type` in `POST /animals`/`PUT /animals/{id}` payloads (cross-endpoint consistency check).

### GET /map

- Authenticated request → 200, `SuccessResponse` with map endpoint info.
- Missing/invalid token → 401 **(undocumented)**.

### GET /map/fieldsmap

- Authenticated request → 200, generic object (GeoJSON-like, untyped in spec).
- Authenticated user with no fields → 200, verify minimal/empty geometry structure.
- Missing/invalid token → 401 **(undocumented)**.

### GET /map/districts

- Authenticated request → 200, array of district name strings.
- No districts available → 200, empty array `[]`.
- Missing/invalid token → 401 **(undocumented)**.

---

## Financial, Marketplace, Contact, Alerts & Feature Flags

### GET /financial/account

- Valid token, account exists → 200, `data.account` matches `FinancialAccount` (balance, currency, transactions[]).
- Valid token, account not found → 404 `Error`.
- Missing/invalid token → 401.

### GET /financial/transactions

- Valid token, no query params → 200, defaults applied (`limit=50`, `offset=0`).
- `limit=1` / `limit=100` (boundaries) → 200, respects bound.
- `limit=0` / `limit=101` (out of range) → verify clamping vs. rejection.
- `offset=-1` (below minimum) → verify clamping vs. rejection.
- `type=income` / `type=expense` → 200, all items match filter.
- `type=bogus` (outside enum) → verify ignored vs. 400.
- `category=general` → 200, all returned items match category.
- Valid `startDate`/`endDate` range → 200, only transactions within range.
- `startDate` after `endDate` → verify empty result vs. error.
- Missing/invalid token → 401.

### GET /financial/transactions/{transactionId}

- Valid token, own existing transaction → 200, matches `Transaction` schema.
- Valid token, non-existent `transactionId` → 404.
- Non-numeric `transactionId` → verify 400 or 404.
- `transactionId` belonging to another user → 404 (must not leak cross-user data).
- Missing token → 401.

### POST /financial/transactions

- Valid expense payload → 201, `Transaction` returned with `balanceBefore`/`balanceAfter`.
- Valid income payload with valid `cardNumber`+`cvv` → 201, response never includes `cardNumber`/`cvv` (write-only fields).
- `type=income` missing `cardNumber`/`cvv` → 400.
- `cardNumber` below/above length bounds (13–20) or containing letters → 400 (pattern violation).
- `cvv` below/above length bounds (3–4 digits) → 400.
- `amount=0`/negative → 400 (violates minimum 0.01).
- `description` below/above length bounds (3–100) → 400.
- Missing `type`/`amount`/`description` → 400.
- `type="transfer"` (outside enum) → 400.
- Missing token → 401.
- Expense amount exceeding current balance → verify behavior (insufficient-funds rule undocumented here).

### GET /financial/stats

- Valid token, user with transactions → 200, `FinancialStats` numerically consistent.
- Valid token, user with zero transactions → 200, zeroed statistics.
- Missing token → verify 401 (not documented in this path despite `TokenAuth` security).

### GET /financial/report

- `financialReportsEnabled=true`, valid token → 200, `data.encodedReport` base64 string, `filename` pattern `financial-report-<USER>-<date>.pdf`.
- `financialReportsEnabled=false` → 404 "Financial report endpoint disabled".
- Missing token → 401.
- Simulated internal failure → 500.

### POST /financial/transfer

- Valid transfer within balance to existing user → 200, echoes transfer details.
- `amount=0` → 400; `amount=999.99` (boundary max) → 200; `amount=1000.00` (above max) → 400; negative → 400.
- `description` below/above length bounds → 400.
- Missing `toUserId`/`description` → 400.
- `toUserId` referencing non-existent user → verify 400 vs. 404.
- Transfer amount exceeding balance → 400 "insufficient funds".
- Self-transfer (`toUserId` = own userId) → verify behavior (undocumented rule).
- Missing token → 401.

### GET /financial/marketplace-stats

- Valid token → 200, matches `MarketplaceStats`.
- Missing token → verify 401 (undocumented in this path).

### GET /financial/accounts/all

- Valid admin token → 200, all accounts returned.
- Valid non-admin token → 403 "Forbidden - admin access required".
- Missing token → 401.

### PUT /financial/accounts/balance

- Valid admin token, full valid payload → 200, balance updated.
- Missing `userId`/`amount`/`description` → 400.
- `userId` referencing non-existent user → verify 400 vs. 404.
- Valid non-admin token → 403.
- Missing token → 401.

### GET /marketplace/offers

- Valid token, active offers from others exist → 200, own offers excluded, `total` matches array length.
- Valid token, no offers → 200, empty array, `total=0`.
- Missing token → verify 401 (undocumented in this path).

### POST /marketplace/offers

- Valid payload selling owned field or animal → 201, offer created with `status: "active"`.
- `price=0`/negative → 400.
- `itemType="staff"` (outside enum) → 400.
- Missing `itemType`/`itemId`/`price` → 400.
- `itemId` not owned by current user → 404 "Item not found or not owned by user".
- `itemId` already has an active offer → 400 "item already offered".
- Missing token → 401.

### GET /marketplace/my-offers

- Valid token, user has/has no own offers → 200, `sellerId` matches caller, `total` matches count.
- Missing token → verify 401 (undocumented in this path).

### POST /marketplace/buy

- Valid `offerId` for another user's active offer, sufficient balance → 200, `MarketplaceTransaction` returned, offer becomes `status: "sold"`.
- Missing `offerId` → 400.
- Non-existent/already-sold `offerId` → 404 "Offer not found or item no longer available".
- Buying own offer → 400 "cannot buy own offer".
- Insufficient balance → 400 "insufficient funds".
- Missing token → 401.

### DELETE /marketplace/offers/{offerId}

- Valid token, own active offer → 200, offer `status` becomes `"cancelled"`.
- Offer owned by another user → 403 "Forbidden - not the offer owner".
- Non-existent `offerId` → 404.
- Missing token → verify 401 (undocumented in this path).

### GET /marketplace/transactions

- Valid token, user has/has no marketplace transactions → 200, matches `MarketplaceTransaction` schema.
- Missing token → verify 401 (undocumented in this path).

### POST /contact

- `contactFormEnabled=true`, all fields valid → 200, `success=true`, `id` present.
- Missing `name`/`email`/`subject`/`message` → 400.
- Invalid `email` format → verify 400 triggers server-side.
- `contactFormEnabled=false` → verify disabled-state response code (not documented).
- Simulated server error → 500.

### GET /alerts, /alerts/history, /alerts/upcoming

- `alertsEnabled=true`, no params → 200, appropriate alert set (combined/past/upcoming).
- Valid `date=YYYY-MM-DD` → 200, alerts relevant to date.
- Malformed `date` (e.g. `2026-13-40`) → verify behavior (not documented as 400).
- Valid `region=PL-XX` → 200, filtered by region.
- Malformed `region` (not `PL-XX` pattern) → verify ignored vs. 400 (no pattern enforced in schema).
- `alertsEnabled=false` → verify disabled-state behavior (not documented).
- No token supplied → 200, endpoints are public per schema (`security: []`).

### GET /feature-flags

- No params → 200, `data.flags` map returned.
- `descriptions=true`/`false` → 200, includes/excludes description objects and groups.
- `descriptions=invalidValue` (outside enum) → verify ignored vs. 400.
- No token supplied → 200 (no `security` block — confirm this public read is intentional).
- Simulated server error → 500.

### PATCH /feature-flags

- Valid partial payload → 200, only specified flag changes (merge semantics).
- `flags` value non-boolean → 400 "flags must contain only boolean values".
- Missing `flags` field → 400.
- `flags={}` (empty object) → 200, no changes applied.
- No token supplied → 200 — **flag for review**: unauthenticated global feature-flag mutation may be an RBAC gap.
- Simulated server error → 500.

### PUT /feature-flags

- Valid full-replacement payload → 200, flags replaced to match payload exactly.
- `flags={}` (explicitly allowed) → 200, all flags cleared/reset.
- `flags` value non-boolean → 400; missing `flags` → 400.
- No token supplied → 200 — **flag for review**: unauthenticated full-replace of flags may be an RBAC gap.
- Simulated server error → 500.

### POST /feature-flags/reset

- Call reset after flags modified → 200, `data.flags` matches predefined defaults.
- No token supplied → 200 — **flag for review**: unauthenticated reset of global flags may be an RBAC gap.
- Simulated server error → 500.

---

## Cross-Cutting Observations & Open Questions

- **Undocumented 401s**: Many endpoints declare `security: [{ TokenAuth: [] }]` but the schema's `responses` object omits a `401` entry (e.g. `/financial/stats`, `/financial/marketplace-stats`, `/marketplace/offers`, `/marketplace/my-offers`, `/marketplace/transactions`, `DELETE /marketplace/offers/{offerId}`, most `Fields`/`Staff`/`Assignments`/`Animals`/`Map` endpoints). Tests should still probe missing/invalid token to confirm actual runtime behavior matches the declared security requirement.
- **Ownership/RBAC gaps**: Update/delete operations on `Fields`, `Staff`, `Assignments`, and `Animals` don't consistently document 403/404 for cross-user access attempts — verify ownership checks are enforced server-side, not just documented.
- **Feature-flag disabled-state inconsistency**: `/financial/report` and `/metrics` explicitly document a `404` when their feature flag is disabled, but `Alerts` and `Feature Flags` endpoints (and `/contact`) don't document a distinct disabled-state status code. Confirm actual behavior before asserting.
- **Unauthenticated flag mutation**: `PATCH`/`PUT /feature-flags` and `POST /feature-flags/reset` have no `security` requirement at all — worth confirming with the team whether this is intentional (e.g. internal/test-only tooling), since it allows any caller to alter global feature flags.
- **Duplicate routes**: `/fields/assign` (GET/POST/DELETE via `/fields/assign/{id}`) appears to duplicate `/assignments` (GET) and `/assignments/{id}` (DELETE). Tests should cross-check consistency between both routes for the same resource.
- **Destructive/admin-only endpoints**: `GET /shutdown` and `POST /debug/database/restore-base` should only be exercised against isolated/disposable test environments, never shared or staging environments.
- **Sensitive fields**: `cardNumber` and `cvv` on `POST /financial/transactions` are `writeOnly` — assertions should explicitly verify these fields never appear in any response body.
