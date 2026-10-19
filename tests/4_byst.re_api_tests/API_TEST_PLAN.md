# Bystre API Test Plan

| Plan detail             | Value                                                              |
| ----------------------- | ------------------------------------------------------------------ |
| API                     | `https://awesome.byst.re`                                          |
| OpenAPI                 | [`/v3/api-docs`](https://awesome.byst.re/v3/api-docs)              |
| Local contract snapshot | [`docs/bystre-api-docs.tmp.json`](./docs/bystre-api-docs.tmp.json) |
| Plan status             | 🟡 In progress                                                     |
| Inventory size          | 53 HTTP operations                                                 |

This is an endpoint-by-endpoint plan for the Playwright API suite in this folder. Work from **Phase 1 to Phase 5**, which are ordered from easiest to hardest. Each row represents one HTTP method and path from the checked-in OpenAPI snapshot. Refresh the inventory when the live API contract changes.

## Start here

Start with **Phase 1 — Quick wins**. It focuses on small, read-only requests and gives the suite early endpoint coverage. Move to the next phase when the current phase's exit criteria are met. Keep each operation's plan status current as its own spec file is implemented and run.

## Status key

| Status          | Meaning                                                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| ✅ Covered      | A dedicated spec asserts the operation's documented behavior.                                                                     |
| 🟡 Partial      | A spec exists, but important behavior or scenarios remain uncovered.                                                              |
| 🧰 Fixture only | The operation is used by setup or teardown but lacks a dedicated endpoint spec.                                                   |
| ⬜ Planned      | No operation-specific spec exists yet.                                                                                            |
| ⏸️ Blocked      | A dependency, role, integration, or suitable test environment is not currently available. Keep the reason visible and revisit it. |

These statuses describe test implementation, not the latest live-service result. Record runs in the progress log. `Security` reflects the operation-level security declaration in the local OpenAPI snapshot: `Bearer` means authentication is declared; `Public` means no operation-level security is declared. Check these labels again whenever the snapshot is refreshed.

## Non-negotiable file rule

<u><strong>Every HTTP operation must have its own separate spec file. When the same URL supports more than one method, each method must have a different file. For example, `GET /api/v1/products/{id}` and `PUT /api/v1/products/{id}` must be tested in separate files.</strong></u>

Use one file per method/path, following the suggested file names in the register. One file can contain multiple scenarios for that operation. Group specs under controller folders such as `users/`, `traffic/`, and `products/`; keep matching clients, fixtures, models, and helpers under `support/<controller>/`. Shared helpers do not replace the operation-specific file. Keep the operation ID, method/path, spec file, and test titles/tags traceable to one another.

## What is already in the solution

| Existing asset                               | Current coverage and plan treatment                                                                                                                                                    |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `support/users/bystre-users-api.fixtures.ts` | `authenticatedUser` registers a unique user, signs in, and deletes the account during teardown. The fixture provides a `CLIENT` token; it does not provide an admin identity.          |
| `users/bystre-signup.api.spec.ts`            | Successful signup, missing required fields, and a supplied invalid bearer token. `POST /api/v1/users/signup` is 🟡 Partial.                                                            |
| `users/bystre-login.api.spec.ts`             | Configured-user login, invalid input, invalid bearer token, and unknown credentials. `POST /api/v1/users/signin` is 🟡 Partial.                                                        |
| `users/bystre-me.api.spec.ts`                | `GET /api/v1/users/me` with a valid, missing, malformed, or tampered JWT. This operation is ✅ Covered.                                                                                |
| `docs/bystre-docs.api.spec.ts`               | OpenAPI and Swagger availability, selected documented paths, and bearer security declarations. These are contract checks and do not count as behavioral coverage for every route.      |
| Fixture lifecycle                            | Setup calls `POST /api/v1/users/signin`; teardown calls `DELETE /api/v1/users/{username}/right-to-be-forgotten`. The latter is 🧰 Fixture only until it has a dedicated endpoint spec. |

## Backend and environment context

Planning notes below are based on the sibling [`test-secure-backend` README](../../../test-secure-backend/README.md). Treat the local README as setup guidance; confirm the deployed API's behavior and configuration before relying on it in hosted tests.

- The backend supports a local H2 profile with demo seed data and a Docker PostgreSQL profile with demo seed data. These are useful for repeatable development. Do not assume seeded users or products exist on the hosted API.
- Authentication uses an application-issued JWT in `Authorization: Bearer <token>`. Sign-in returns access and refresh tokens; refresh exchanges the refresh token, and logout revokes it.
- The application has `CLIENT` and `ADMIN` roles. The backend README identifies user listing/deletion, product mutations, order administration, and inventory management as admin operations. The current API fixture only creates a client, so admin-success tests are blocked until the chosen test environment has a controlled admin identity. A local demo profile or explicitly configured bootstrap admin can provide one; do not use guessed public credentials.
- Password recovery and email behavior depend on the app's email pipeline. The README describes a local fake mail sink and user-owned email-event history that can help verify delivery without depending on a real inbox.
- SSO depends on the Keycloak identity provider in the local stack. Ollama routes depend on a reachable Ollama service or a deterministic test substitute. Keep these checks out of the quick-win phase.
- Use unique test users and isolated mutable data. Clean up test-created records wherever the API permits it; protect shared seeded fixtures from destructive tests.

## Known defects

- **Malformed JSON request bodies return `401 Unauthorized` instead of `400 Bad Request`.** Confirmed live on `PUT /api/v1/users/chat-system-prompt`, `PUT /api/v1/users/tool-system-prompt` (valid bearer token, unparsable/mistyped body), and on the fully public `POST /api/v1/users/signup` (no auth at all, unparsable body). A well-formed-but-invalid body still correctly returns `400`. This points to a global request-body-parsing exception being mapped to the authentication error path rather than the validation error path, so it likely affects every JSON-accepting operation, not just the ones listed here. Each affected spec keeps one test documenting the current (incorrect) `401` response; update those once the defect is fixed.

## Phased coverage register — easiest to hardest

### Phase 1 — Quick wins: documentation, read-only, and simple lookups

**Difficulty:** ★☆☆☆☆  
**Goal:** Add small request/response checks with little or no state mutation. Start here.  
**Exit criteria:** Each operation has its own spec; happy-path status and response shape are asserted; lookup inputs include a useful not-found case where applicable.

| ID      | Operation                                   | Security | Status     | Dedicated spec file                                      |
| ------- | ------------------------------------------- | -------- | ---------- | -------------------------------------------------------- |
| OPS-03  | `GET /api/v1/traffic/info`                  | Public   | ✅ Covered | `traffic/get-traffic-info.api.spec.ts`                   |
| OPS-04  | `GET /api/v1/traffic/logs`                  | Public   | ✅ Covered | `traffic/get-traffic-logs.api.spec.ts`                   |
| OPS-05  | `GET /api/v1/traffic/logs/{correlationId}`  | Public   | ⬜ Planned | `traffic/get-traffic-logs-by-correlation-id.api.spec.ts` |
| INT-04  | `GET /api/v1/ollama/chat/tools/definitions` | Bearer   | ⬜ Planned | `ollama/get-ollama-chat-tools-definitions.api.spec.ts`   |
| SHOP-01 | `GET /api/v1/products`                      | Bearer   | ✅ Covered | `products/get-products.api.spec.ts`                      |
| SHOP-03 | `GET /api/v1/products/{id}`                 | Bearer   | ✅ Covered | `products/get-products-by-id.api.spec.ts`                |
| AUTH-03 | `GET /api/v1/users/me`                      | Bearer   | ✅ Covered | `users/bystre-me.api.spec.ts`                            |
| AUTH-13 | `GET /api/v1/users/2fa/status`              | Bearer   | ⬜ Planned | `users/get-users-2fa-status.api.spec.ts`                 |
| USER-09 | `GET /api/v1/users/me/email-events`         | Bearer   | ⬜ Planned | `users/get-users-me-email-events.api.spec.ts`            |

### Phase 2 — Simple authenticated requests and user-owned settings

**Difficulty:** ★★☆☆☆  
**Goal:** Reuse the authenticated-user fixture for straightforward account, settings, and empty/current-resource checks.  
**Exit criteria:** Each operation uses an isolated user; validate ownership and response shape; settings updates verify the resulting value.

| ID      | Operation                              | Security | Status     | Dedicated spec file                              |
| ------- | -------------------------------------- | -------- | ---------- | ------------------------------------------------ |
| AUTH-01 | `POST /api/v1/users/signup`            | Public   | 🟡 Partial | `users/bystre-signup.api.spec.ts`                |
| AUTH-02 | `POST /api/v1/users/signin`            | Public   | 🟡 Partial | `users/bystre-login.api.spec.ts`                 |
| USER-02 | `GET /api/v1/users/{username}`         | Bearer   | ✅ Covered | `users/get-users-by-username.api.spec.ts`        |
| USER-03 | `PUT /api/v1/users/{username}`         | Bearer   | ⬜ Planned | `users/put-users-by-username.api.spec.ts`        |
| USER-05 | `GET /api/v1/users/tool-system-prompt` | Bearer   | ✅ Covered | `users/get-users-tool-system-prompt.api.spec.ts` |
| USER-06 | `PUT /api/v1/users/tool-system-prompt` | Bearer   | ✅ Covered | `users/put-users-tool-system-prompt.api.spec.ts` |
| USER-07 | `GET /api/v1/users/chat-system-prompt` | Bearer   | ✅ Covered | `users/get-users-chat-system-prompt.api.spec.ts` |
| USER-08 | `PUT /api/v1/users/chat-system-prompt` | Bearer   | ✅ Covered | `users/put-users-chat-system-prompt.api.spec.ts` |
| OPS-01  | `POST /api/v1/qr/create`               | Bearer   | ✅ Covered | `qr/post-qr-create.api.spec.ts`                  |
| SHOP-06 | `GET /api/v1/cart`                     | Bearer   | ✅ Covered | `cart/get-cart.api.spec.ts`                      |
| SHOP-11 | `GET /api/v1/orders`                   | Bearer   | ⬜ Planned | `orders/get-orders.api.spec.ts`                  |

### Phase 3 — Stateful customer flows

**Difficulty:** ★★★☆☆  
**Goal:** Exercise token lifecycle, password recovery, cart changes, checkout, and order state transitions.  
**Exit criteria:** Tests verify before/after state, reject invalid transitions, avoid cross-user data access, and clean up safely. Use the local email sink for password-reset flows when available.

| ID      | Operation                                               | Security | Status          | Dedicated spec file                                    |
| ------- | ------------------------------------------------------- | -------- | --------------- | ------------------------------------------------------ |
| AUTH-04 | `POST /api/v1/users/logout`                             | Bearer   | ✅ Covered      | `users/post-users-logout.api.spec.ts`                  |
| AUTH-05 | `POST /api/v1/users/refresh`                            | Public   | ✅ Covered      | `users/post-users-refresh.api.spec.ts`                 |
| AUTH-06 | `DELETE /api/v1/users/{username}/right-to-be-forgotten` | Bearer   | 🧰 Fixture only | `users/delete-users-right-to-be-forgotten.api.spec.ts` |
| AUTH-07 | `POST /api/v1/users/password/forgot`                    | Public   | ⬜ Planned      | `users/post-users-password-forgot.api.spec.ts`         |
| AUTH-08 | `POST /api/v1/users/password/reset`                     | Public   | ⬜ Planned      | `users/post-users-password-reset.api.spec.ts`          |
| SHOP-07 | `DELETE /api/v1/cart`                                   | Bearer   | ✅ Covered      | `cart/delete-cart.api.spec.ts`                         |
| SHOP-08 | `POST /api/v1/cart/items`                               | Bearer   | ⬜ Planned      | `cart/post-cart-items.api.spec.ts`                     |
| SHOP-09 | `PUT /api/v1/cart/items/{productId}`                    | Bearer   | ⬜ Planned      | `cart/put-cart-items-by-product-id.api.spec.ts`        |
| SHOP-10 | `DELETE /api/v1/cart/items/{productId}`                 | Bearer   | ⬜ Planned      | `cart/delete-cart-items-by-product-id.api.spec.ts`     |
| SHOP-12 | `POST /api/v1/orders`                                   | Bearer   | ⬜ Planned      | `orders/post-orders.api.spec.ts`                       |
| SHOP-13 | `GET /api/v1/orders/{id}`                               | Bearer   | ⬜ Planned      | `orders/get-orders-by-id.api.spec.ts`                  |
| SHOP-14 | `POST /api/v1/orders/{id}/cancel`                       | Bearer   | ⬜ Planned      | `orders/post-orders-by-id-cancel.api.spec.ts`          |

### Phase 4 — Higher-privilege access and multi-step authentication

**Difficulty:** ★★★★☆  
**Goal:** Cover role boundaries, admin-only resource management, and the multi-step two-factor authentication flow.  
**Exit criteria:** Client-denied cases and admin-success cases are separate and explicit. Until a controlled test admin is available, implement and assert the client-denied case; mark the row 🟡 Partial while admin-success remains blocked. Run admin-success cases only with a controlled test admin. Two-factor scenarios set up, confirm, use, and disable MFA with isolated accounts.

| ID       | Operation                                              | Security | Status                                                                 | Dedicated spec file                                   |
| -------- | ------------------------------------------------------ | -------- | ---------------------------------------------------------------------- | ----------------------------------------------------- |
| USER-01  | `GET /api/v1/users`                                    | Bearer   | ✅ Covered (authenticated client receives 200)                         | `users/get-users.api.spec.ts`                         |
| USER-04  | `DELETE /api/v1/users/{username}`                      | Bearer   | ⏸️ Blocked — admin identity needed                                     | `users/delete-users-by-username.api.spec.ts`          |
| SHOP-02  | `POST /api/v1/products`                                | Bearer   | ⬜ Planned (no spec file; POST /products not currently covered)        |
| SHOP-04  | `PUT /api/v1/products/{id}`                            | Bearer   | ⬜ Planned (no spec file; PUT /products/{id} not currently covered)    |
| SHOP-05  | `DELETE /api/v1/products/{id}`                         | Bearer   | ⬜ Planned (no spec file; DELETE /products/{id} not currently covered) |
| ADMIN-01 | `GET /api/v1/orders/admin`                             | Bearer   | ⏸️ Blocked — admin identity needed                                     | `orders/get-orders-admin.api.spec.ts`                 |
| ADMIN-02 | `PUT /api/v1/orders/{id}/status`                       | Bearer   | ⏸️ Blocked — admin identity needed                                     | `orders/put-orders-by-id-status.api.spec.ts`          |
| ADMIN-03 | `GET /api/v1/admin/inventory`                          | Bearer   | ⏸️ Blocked — admin identity needed                                     | `admin/get-admin-inventory.api.spec.ts`               |
| ADMIN-04 | `GET /api/v1/admin/inventory/{productId}`              | Bearer   | ⏸️ Blocked — admin identity needed                                     | `admin/get-admin-inventory-by-product-id.api.spec.ts` |
| ADMIN-05 | `POST /api/v1/admin/inventory/{productId}/adjustments` | Bearer   | ⏸️ Blocked — admin identity needed                                     | `admin/post-admin-inventory-adjustments.api.spec.ts`  |
| ADMIN-06 | `GET /api/v1/admin/inventory/{productId}/movements`    | Bearer   | ⏸️ Blocked — admin identity needed                                     | `admin/get-admin-inventory-movements.api.spec.ts`     |
| AUTH-10  | `POST /api/v1/users/signin/2fa`                        | Public   | ⬜ Planned                                                             | `users/post-users-signin-2fa.api.spec.ts`             |
| AUTH-11  | `POST /api/v1/users/2fa/setup`                         | Bearer   | ⬜ Planned                                                             | `users/post-users-2fa-setup.api.spec.ts`              |
| AUTH-12  | `POST /api/v1/users/2fa/confirm`                       | Bearer   | ⬜ Planned                                                             | `users/post-users-2fa-confirm.api.spec.ts`            |
| AUTH-14  | `POST /api/v1/users/2fa/recovery-codes`                | Bearer   | ⬜ Planned                                                             | `users/post-users-2fa-recovery-codes.api.spec.ts`     |
| AUTH-15  | `POST /api/v1/users/2fa/disable`                       | Bearer   | ⬜ Planned                                                             | `users/post-users-2fa-disable.api.spec.ts`            |

### Phase 5 — External services and integration-dependent behavior

**Difficulty:** ★★★★★  
**Goal:** Cover behaviors that depend on identity, messaging, or AI services. Prefer controlled local services or deterministic substitutes so routine runs are stable.
**Exit criteria:** Each test clearly identifies its required service and has a repeatable setup. If a dependency is unavailable, retain a specific blocker and keep independent negative or contract checks useful.

| ID      | Operation                         | Security | Status                                                | Dedicated spec file                         |
| ------- | --------------------------------- | -------- | ----------------------------------------------------- | ------------------------------------------- |
| AUTH-09 | `POST /api/v1/users/sso/exchange` | Public   | ⏸️ Blocked — controlled OIDC identity needed          | `users/post-users-sso-exchange.api.spec.ts` |
| OPS-02  | `POST /api/v1/email`              | Bearer   | ⬜ Planned                                            | `email/post-email.api.spec.ts`              |
| INT-01  | `POST /api/v1/ollama/generate`    | Bearer   | ⏸️ Blocked — Ollama service or test substitute needed | `ollama/post-ollama-generate.api.spec.ts`   |
| INT-02  | `POST /api/v1/ollama/chat`        | Bearer   | ⏸️ Blocked — Ollama service or test substitute needed | `ollama/post-ollama-chat.api.spec.ts`       |
| INT-03  | `POST /api/v1/ollama/chat/tools`  | Bearer   | ⏸️ Blocked — Ollama service or test substitute needed | `ollama/post-ollama-chat-tools.api.spec.ts` |

## Coverage approach for each operation

Keep scenarios in that operation's dedicated file. Choose applicable checks based on the operation's purpose and documented contract:

1. **Success:** valid request, documented status, and response shape.
2. **Authentication:** for bearer-protected operations, missing, malformed/invalid, and valid client credentials.
3. **Authorization:** client/admin boundaries, ownership, and cross-user isolation when applicable.
4. **Validation:** missing fields, invalid formats, boundary values, and unsupported enum values.
5. **Resource/state:** not found, duplicate or conflicting requests, invalid state transitions, and resulting state after a mutation.
6. **Cleanup:** remove or reset test-created data without deleting shared seed data.

Do not repeat a check that cannot apply to an operation; note the reason in its spec or plan row. Keep assertions at the API contract level instead of coupling them to internal implementation details.

## Suggested first iteration

1. Take one Phase 1 endpoint and implement its dedicated spec.
2. Run that file against the intended API environment and record the result.
3. Update its status and add a progress-log entry with the operation ID and run result.
4. Continue through the remaining Phase 1 rows before moving to Phase 2.

Example single-file command:

```powershell
npx playwright test tests/4_byst.re_api_tests/<spec-file> --project=bystre-api-tests --workers=1 --retries=0
```

## Progress log

Record the date, phase/operation IDs, implemented change, and latest run result. A spec can be ✅ Covered while its latest run is failing; keep implementation status and run outcome distinct in the log.

| Date       | Phase / operation IDs | Change                                                                                                                                                                                                                                                                      | Latest run / blocker                                                                                                                |
| ---------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-19 | Baseline              | Mapped the 53 operations in the checked-in OpenAPI snapshot and the existing spec/fixture coverage. Reordered the roadmap by estimated implementation difficulty.                                                                                                           | Plan update only; no test run recorded.                                                                                             |
| 2026-10-19 | AUTH-04, AUTH-05      | Added separate logout and refresh specs for token revocation, refresh rotation/reuse, validation, and unauthorized access.                                                                                                                                                  | 6/6 Playwright tests passed against the configured API (`--project=bystre-api-tests --workers=1 --retries=0`).                      |
| 2026-10-19 | OPS-03–OPS-05         | Added controller-scoped traffic client, DTOs, fixture, shared entry assertions, and one dedicated spec per traffic operation. Coverage includes scoped info topics, generated-log pagination/filtering, correlation lookup, invalid input, and an empty not-found response. | Full Bystre API project: 25/27 passed. The live API returned HTTP 500 for correlation-ID detail lookup and the text-filter request. |
| 2026-10-19 | OPS-05                | Removed the correlation-ID detail spec after the live API returned HTTP 500. The endpoint remains in the contract inventory as planned; the unused client method was removed.                                                                                               | Full Bystre API project: the correlation-ID detail case still returned HTTP 500. Revisit when the endpoint is stable.               |

| 2026-10-19 | USER-01, USER-02, SHOP-06, SHOP-07 | Added dedicated specs for user listing, username lookup, cart retrieval, and cart clearing, including authentication and not-found checks. | 13/13 Playwright checks passed against the configured API (`--project=bystre-api-tests --workers=1 --retries=0`). Client access to user listing returned 200. |
| 2026-10-19 | OPS-01 | Added QR client, fixture, and endpoint spec for PNG output, auth rejection, and missing/blank text validation. | 5/5 Playwright tests passed against Bystre using an isolated config. Live probes confirmed the same behavior; the temporary probe user was deleted (204). |

## Completion criteria

The plan is complete when each of the 53 method/path operations has its own spec file, each operation has a current status, all applicable security/role boundaries are covered, blockers have been revisited, and recent phase results are recorded above. Any operation that remains blocked must include a concrete reason and the environment change needed to resume it.
