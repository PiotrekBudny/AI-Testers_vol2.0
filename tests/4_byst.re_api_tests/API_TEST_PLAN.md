# Bystre API Test Plan

| Plan detail             | Value                                                              |
| ----------------------- | ------------------------------------------------------------------ |
| Non-admin API           | `https://awesome.byst.re`                                          |
| Admin API               | `https://aitesters.byst.re` (daily-reset test environment)         |
| OpenAPI                 | [`/v3/api-docs`](https://awesome.byst.re/v3/api-docs)              |
| Local contract snapshot | [`docs/bystre-api-docs.tmp.json`](./docs/bystre-api-docs.tmp.json) |
| Plan status             | 🟡 In progress                                                     |
| Inventory size          | 53 HTTP operations                                                 |

This is an endpoint-by-endpoint plan for the Playwright API suite in this folder. The workstreams below group operations by behavior and dependency so contributors can select useful work independently. Each row represents one HTTP method and path from the checked-in OpenAPI snapshot. Refresh the inventory when the live API contract changes.

## How to prioritize work

There is no required workstream order. Choose the next operation or small related slice using current risk, user impact, environment readiness, and available fixtures. Prefer independent work that can produce useful coverage now; record a concrete blocker when a dependency prevents a complete scenario, and continue with applicable contract, validation, authentication, or client-denial checks. Revisit blocked work when its required identity, service, or test environment becomes available. Update an operation's status when its dedicated spec changes, and record run outcomes separately in the progress log.

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

| Existing asset                                     | Current coverage and plan treatment                                                                                                                                                    |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `support/users/bystre-users-api.fixtures.ts`       | `authenticatedUser` registers a unique user, signs in, and deletes the account during teardown. The fixture provides a `CLIENT` token.                                                 |
| `support/products/bystre-products-api.fixtures.ts` | Provides a controlled `ROLE_ADMIN` token, isolated product setup, and cleanup for admin specs.                                                                                         |
| Playwright projects                                | `bystre-api-tests` stays on `BYSTRE_API_BASE_URL`; `bystre-admin-api-tests` runs `@bystre-admin` specs on `BYSTRE_ADMIN_API_BASE_URL`. The projects can run in parallel.               |
| `users/bystre-signup.api.spec.ts`                  | Successful signup and sign-in, required-field and email validation, duplicate username/email, malformed JSON, and invalid bearer token. `POST /api/v1/users/signup` is ✅ Covered.     |
| `users/bystre-login.api.spec.ts`                   | Configured-user login, invalid input, invalid bearer token, and unknown credentials. `POST /api/v1/users/signin` is 🟡 Partial.                                                        |
| `users/bystre-me.api.spec.ts`                      | `GET /api/v1/users/me` with a valid, missing, malformed, or tampered JWT. This operation is ✅ Covered.                                                                                |
| `docs/bystre-docs.api.spec.ts`                     | OpenAPI and Swagger availability, selected documented paths, and bearer security declarations. These are contract checks and do not count as behavioral coverage for every route.      |
| Fixture lifecycle                                  | Setup calls `POST /api/v1/users/signin`; teardown calls `DELETE /api/v1/users/{username}/right-to-be-forgotten`. The latter is 🧰 Fixture only until it has a dedicated endpoint spec. |

## Local integration environment (source repositories)

Use the sibling repositories as setup and behavior sources: [test-secure-backend README](../../../test-secure-backend/README.md), [backend Compose file](../../../test-secure-backend/docker-compose.yml), [backend local profile](../../../test-secure-backend/src/main/resources/application-local.yml), and [ollama-mock README](../../../ollama-mock/README.md). These describe available local paths; confirm the deployed target's actual behavior before treating it as equivalent.

- **Backend local profile:** runs the API on port 4001 with an H2 database and demo seed data. It enables the local password-reset outbox and exposes reset tokens in the response. Use the backend's local-only outbox endpoints to inspect or clear captured email payloads; password-reset coverage can run without SMTP or Mailhog in this profile. Seeded users, products, orders, and the demo admin are local-only test data.
- **Backend Docker profile:** the backend Compose stack activates docker,demo and starts PostgreSQL, ActiveMQ, and an Ollama container. This Ollama container is the real Qwen service image declared in the Compose file, not the separate mock. The backend README describes Docker/LocalStack email handoff through Artemis to a mail sink; verify that the required consumer and sink are part of the environment being started. This path has more service prerequisites than the local profile.
- **Ollama mock:** the separate ollama-mock repository runs on port 11434 and returns deterministic, scenario-driven NDJSON/JSON responses for generate, chat, and tool routes. Its default model is qwen3.5:2b, with configurable streaming delays. The backend local profile points to localhost:11434, so the mock can replace a real Ollama service for local API integration. In a container network, configure the backend to use the mock service hostname; localhost inside the backend container refers to that container. Do not start the real Ollama container and mock on the same host port at once.
- **Authentication and roles:** the API issues its own access and refresh JWTs. The daily-reset admin test host accepts the configured controlled admin identity. Use `BYSTRE_ADMIN_API_USERNAME` and `BYSTRE_ADMIN_API_PASSWORD` only with `BYSTRE_ADMIN_API_BASE_URL`; the existing non-admin suite continues to use `BYSTRE_API_BASE_URL`.
- **SSO:** AUTH-09 still needs Keycloak from the sibling awesome-localstack setup or a deterministic OIDC test identity. Neither backend nor ollama-mock replaces that identity provider.
- Keep mutable users, carts, orders, products, inventory, tokens, and MFA state isolated per scenario. Protect demo seed data from destructive tests and clean up resources created by a test wherever the API allows it.

## Dependencies and parallel work

Dependencies below describe data, identity, or environment prerequisites for a scenario. They do not mean one spec file must run before another. Every operation spec must arrange its own prerequisites with a fixture, isolated test data, or controlled environment; never rely on another spec's side effects. A dependent scenario can be implemented before its prerequisite spec is complete if a fixture or deterministic setup can provide the required state.

### Shared prerequisites

| Scenario                  | Prerequisite                                                                                                                                                                                                                                                          | Independent coverage that can proceed                                                                                 |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Any Bearer operation      | A valid client token. The authenticated-user fixture creates a unique user and signs in; the relevant endpoint spec does not need the signup or signin spec to run first.                                                                                             | Public operations and invalid/missing-token cases do not need this fixture.                                           |
| Admin-success scenario    | The `adminAuthorization` fixture signs in to the admin project's daily-reset host. Tests create their own user/product/order prerequisites.                                                                                                                           | Client-denied authorization cases use a separate regular client identity on that same host.                           |
| Mutation scenario         | Isolated user/resource state and a cleanup or reset path.                                                                                                                                                                                                             | Read-only, validation, and unauthorized cases can be written and run independently of successful mutations.           |
| External-service scenario | Its declared service or a deterministic local path: Keycloak from awesome-localstack for SSO; the backend local outbox or the Docker/LocalStack broker and mail sink for email; and ollama-mock on port 11434 or the configured Ollama container for generation/chat. | Contract, validation, and auth-rejection cases can still run without the service when they do not call through to it. |

### Scenario dependency map

An arrow means the downstream scenario needs state produced by the upstream operation or an equivalent fixture setup. Within one test workflow, satisfy these edges in order. Across spec files, create the prerequisite locally so Playwright can schedule files in parallel.

```mermaid
flowchart LR
  signup["AUTH-01 signup"] --> signin["AUTH-02 signin"]
  signin --> logout["AUTH-04 logout"]
  signin --> refresh["AUTH-05 refresh"]
  signup --> userOps["USER-02 lookup / USER-03 update / USER-04 delete / AUTH-06 forget"]
  emailService["Local outbox or Docker/LocalStack email"] --> forgot["AUTH-07 password/forgot"]
  forgot --> reset["AUTH-08 password/reset"]
  forgot --> emailEvents["USER-09 email-events (optional assertion)"]
  sendEmail["OPS-02 email/send"] --> emailEvents
  setup2fa["AUTH-11 2FA/setup"] --> confirm2fa["AUTH-12 2FA/confirm"]
  confirm2fa --> signin2fa["AUTH-10 signin/2FA"]
  confirm2fa --> recovery["AUTH-14 recovery-codes"]
  confirm2fa --> disable2fa["AUTH-15 2FA/disable"]
  product["SHOP-02 create product or isolated product fixture"] --> getProduct["SHOP-03 get product"]
  product --> updateProduct["SHOP-04 update product"]
  product --> deleteProduct["SHOP-05 delete product"]
  product --> addCart["SHOP-08 add cart item"]
  addCart --> updateCartItem["SHOP-09 update cart item"]
  addCart --> removeCartItem["SHOP-10 remove cart item"]
  addCart --> createOrder["SHOP-12 create order"]
  createOrder --> getOrder["SHOP-13 get order"]
  createOrder --> cancelOrder["SHOP-14 cancel order"]
  createOrder --> adminStatus["ADMIN-02 update order status"]
  product --> inventoryDetail["ADMIN-04 inventory/detail"]
  product --> adjustInventory["ADMIN-05 inventory/adjustment"]
  adjustInventory --> movements["ADMIN-06 movements"]
  ollama["ollama-mock or configured Ollama"] --> generate["INT-01 generate"]
  ollama --> chat["INT-02 chat"]
  ollama --> toolChat["INT-03 chat/tools"]
  productData["Catalog data for product tools"] --> toolChat
  keycloak["Keycloak from awesome-localstack"] --> sso["AUTH-09 SSO exchange"]
```

The graph shows scenario data and service dependencies. It does not prescribe spec-file execution order; each downstream spec should create or provision its own prerequisite state so the suite can run in parallel.

| Dependency chain                                                                                          | What the downstream scenario needs                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AUTH-01 signup -> AUTH-02 signin                                                                          | The account created by signup, when testing the same identity. The authenticated-user fixture already performs both setup calls for bearer-protected scenarios.                                                                                                                                                      |
| AUTH-02 signin -> AUTH-04 logout / AUTH-05 refresh                                                        | A valid access token for logout or a valid refresh token for refresh. Use a fresh identity/token per test so parallel token lifecycle tests do not invalidate each other's tokens.                                                                                                                                   |
| AUTH-01 signup -> USER-02 lookup / USER-03 update / USER-04 delete / AUTH-06 right-to-be-forgotten        | A known target username. For USER-04, also provide admin authorization; for AUTH-06, use the authenticated owner's identity and account for deletion in teardown.                                                                                                                                                    |
| AUTH-07 password/forgot -> AUTH-08 password/reset                                                         | A reset token from the response or reset payload from the local profile outbox; Docker/LocalStack uses the broker and mail sink path. Keep the workflow on an isolated account and do not use an uncontrolled inbox.                                                                                                 |
| AUTH-11 2FA/setup -> AUTH-12 2FA/confirm -> AUTH-10 signin/2FA                                            | An isolated account with MFA enabled and confirmed before exercising the second-factor sign-in. AUTH-13 can inspect the status before and after these transitions.                                                                                                                                                   |
| AUTH-12 2FA/confirm -> AUTH-14 recovery-codes / AUTH-15 2FA/disable                                       | A confirmed MFA account; recovery-code and disablement scenarios must not share mutable account state when run concurrently.                                                                                                                                                                                         |
| SHOP-02 product/create -> SHOP-03 get / SHOP-04 update / SHOP-05 delete / SHOP-08 cart/items              | A product ID. Each operation-specific spec should create its own product with controlled admin credentials or use a known stable fixture; do not depend on another spec leaving a product behind.                                                                                                                    |
| SHOP-08 cart/items -> SHOP-09 update / SHOP-10 delete / SHOP-12 order/create                              | A populated cart containing an available product. Each scenario should use its own user/cart so clear, update, delete, and checkout tests can run in parallel.                                                                                                                                                       |
| SHOP-12 order/create -> SHOP-13 order/get / SHOP-14 order/cancel / ADMIN-02 status/update                 | An order ID. Create a separate order per scenario; cancellation and admin status changes mutate order state and must not target the same order concurrently. ADMIN-01 can exercise empty/list behavior independently; use a created order when asserting non-empty results.                                          |
| SHOP-02 product/create or controlled inventory fixture -> ADMIN-04 inventory/detail / ADMIN-05 adjustment | A product with an inventory record and admin credentials. Confirm product creation initializes inventory in the chosen environment; otherwise seed or provision the inventory record through a controlled fixture.                                                                                                   |
| ADMIN-05 adjustment -> ADMIN-06 movements                                                                 | A movement created by the adjustment if asserting movement history. The movement-list endpoint can still cover auth, validation, and empty/history behavior without an adjustment in the same scenario.                                                                                                              |
| INT-01 generate / INT-02 chat / INT-03 chat/tools -> ollama-mock or configured Ollama                     | The backend must be able to reach the chosen service. For local runs, start ollama-mock on port 11434 and use the backend local profile. Tool-flow assertions also need catalog data when a tool reads products; the mock scenario controls the model response, while the backend still executes the product lookup. |
| OPS-02 email/send or AUTH-07 password/forgot -> USER-09 email-events                                      | Optional event-history assertions when the environment records those sends for the same user. Keep the send and read on an isolated account; test the endpoint's independent empty/current-history behavior separately.                                                                                              |

### Work that can proceed in parallel

These are ownership lanes, not stages. Split a lane further by controller or operation ID as needed. Keep the one-spec-per-method/path rule and use isolated data so work in different lanes does not contend for mutable resources.

| Lane                     | Suggested independent slice                                                                         | Main coordination point                                                                                                                                                             |
| ------------------------ | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contract and read-only   | OpenAPI/docs checks; OPS-03 to OPS-05; SHOP-01, SHOP-03, INT-04; USER-01, AUTH-03, AUTH-13, USER-09 | Bearer reads use their own client fixture. Use known or isolated IDs for lookup cases.                                                                                              |
| Accounts and settings    | AUTH-01, AUTH-02; USER-02, USER-03, USER-05 to USER-08; AUTH-06; OPS-01                             | Each spec owns a unique user. Profile lookup/update/delete scenarios must not share the same account.                                                                               |
| Product administration   | SHOP-02, SHOP-04, SHOP-05                                                                           | Needs controlled admin credentials for success paths; create a disposable product per spec and clean it up. Client-denied cases can proceed without admin setup.                    |
| Cart and orders          | SHOP-06 to SHOP-14                                                                                  | Each flow uses its own user, cart, product, and order. Coordinate only shared fixture/client changes.                                                                               |
| Token, recovery, and MFA | AUTH-04, AUTH-05, AUTH-07, AUTH-08, AUTH-10 to AUTH-15                                              | Use dedicated accounts/tokens per workflow; password reset can use the local outbox or Docker/LocalStack email path, and MFA sign-in depends on completed setup/confirmation.       |
| Admin and integrations   | USER-04, ADMIN-01 to ADMIN-06, AUTH-09, OPS-02, INT-01 to INT-03                                    | Admin operations use the configured daily-reset host and isolated fixtures. Keycloak, email services, or a reachable Ollama/mock endpoint may still gate integration success paths. |

Parallelize implementation and execution only where fixtures isolate data. Tests that clear a cart, delete a user/product, rotate tokens, cancel an order, change order status, adjust inventory, or consume recovery codes need separate owned resources. Shared-client or fixture changes should be coordinated with specs that import them; endpoint behavior work in separate spec files can otherwise proceed independently.

## Contract observations

- **Malformed JSON now returns `400 Bad Request`.** Direct probes on 2026-10-27 confirmed this response for `PUT /api/v1/users/chat-system-prompt`, `PUT /api/v1/users/tool-system-prompt`, and public `POST /api/v1/users/signup`. Their specs assert the current status and error body.
- **Cart and customer-order probes on 2026-10-27:** A disposable client observed cart add/update/remove success (200), increment on repeated add, zero-quantity removal, validation (400), insufficient stock (409), missing resource (404), and bearer rejection (401). An empty order list returned a page DTO (200); invalid pagination/status returned `{ error }` (400). Empty-cart checkout returned `{ message: "Cart is empty" }` (400), invalid address returned field errors (400), and unknown order lookup/cancellation returned 404. Probe accounts were deleted (204). Success-path checkout and order state transitions still require a controlled disposable product on the same target host.
- **Password-reset token visibility depends on the profile.** The hosted forgot-password response returned `token: null` for a known disposable account. The backend local profile is configured to return a token for a matching local account so the reset workflow can be exercised without email delivery. The AUTH-07 spec accepts either documented shape for a known account and still requires `null` for an unknown account.

## Coverage workstreams

### Contract, read-only, and simple lookup operations

**Focus:** Documentation, read-only requests, and lookups with little or no state mutation. Assert the documented success status and response shape, plus a useful not-found case where applicable.

| ID      | Operation                                   | Security | Status     | Dedicated spec file                                      |
| ------- | ------------------------------------------- | -------- | ---------- | -------------------------------------------------------- |
| OPS-03  | `GET /api/v1/traffic/info`                  | Public   | ✅ Covered | `traffic/get-traffic-info.api.spec.ts`                   |
| OPS-04  | `GET /api/v1/traffic/logs`                  | Public   | ✅ Covered | `traffic/get-traffic-logs.api.spec.ts`                   |
| OPS-05  | `GET /api/v1/traffic/logs/{correlationId}`  | Public   | ⬜ Planned | `traffic/get-traffic-logs-by-correlation-id.api.spec.ts` |
| INT-04  | `GET /api/v1/ollama/chat/tools/definitions` | Bearer   | ✅ Covered | `ollama/get-ollama-chat-tools-definitions.api.spec.ts`   |
| SHOP-01 | `GET /api/v1/products`                      | Bearer   | ✅ Covered | `products/get-products.api.spec.ts`                      |
| SHOP-03 | `GET /api/v1/products/{id}`                 | Bearer   | ✅ Covered | `products/get-products-by-id.api.spec.ts`                |
| AUTH-03 | `GET /api/v1/users/me`                      | Bearer   | ✅ Covered | `users/bystre-me.api.spec.ts`                            |
| AUTH-13 | `GET /api/v1/users/2fa/status`              | Bearer   | ✅ Covered | `users/get-users-2fa-status.api.spec.ts`                 |
| USER-09 | `GET /api/v1/users/me/email-events`         | Bearer   | ⬜ Planned | `users/get-users-me-email-events.api.spec.ts`            |

### Accounts, authentication, and user-owned settings

**Focus:** Account creation and sign-in, authenticated account behavior, user preferences, and current-user resources. Use isolated identities, verify ownership and response shape, and assert resulting values after settings updates.

| ID      | Operation                              | Security | Status     | Dedicated spec file                              |
| ------- | -------------------------------------- | -------- | ---------- | ------------------------------------------------ |
| AUTH-01 | `POST /api/v1/users/signup`            | Public   | ✅ Covered | `users/bystre-signup.api.spec.ts`                |
| AUTH-02 | `POST /api/v1/users/signin`            | Public   | 🟡 Partial | `users/bystre-login.api.spec.ts`                 |
| USER-02 | `GET /api/v1/users/{username}`         | Bearer   | ✅ Covered | `users/get-users-by-username.api.spec.ts`        |
| USER-03 | `PUT /api/v1/users/{username}`         | Bearer   | ✅ Covered | `users/put-users-by-username.api.spec.ts`        |
| USER-05 | `GET /api/v1/users/tool-system-prompt` | Bearer   | ✅ Covered | `users/get-users-tool-system-prompt.api.spec.ts` |
| USER-06 | `PUT /api/v1/users/tool-system-prompt` | Bearer   | ✅ Covered | `users/put-users-tool-system-prompt.api.spec.ts` |
| USER-07 | `GET /api/v1/users/chat-system-prompt` | Bearer   | ✅ Covered | `users/get-users-chat-system-prompt.api.spec.ts` |
| USER-08 | `PUT /api/v1/users/chat-system-prompt` | Bearer   | ✅ Covered | `users/put-users-chat-system-prompt.api.spec.ts` |
| OPS-01  | `POST /api/v1/qr/create`               | Bearer   | ✅ Covered | `qr/post-qr-create.api.spec.ts`                  |
| SHOP-06 | `GET /api/v1/cart`                     | Bearer   | ✅ Covered | `cart/get-cart.api.spec.ts`                      |
| SHOP-11 | `GET /api/v1/orders`                   | Bearer   | 🟡 Partial | `orders/get-orders.api.spec.ts`                  |

### Customer and commerce lifecycle

**Focus:** Token lifecycle, password recovery, cart changes, checkout, and order state transitions. Verify before/after state, reject invalid transitions, isolate users, and clean up safely. Use the local-profile reset token/outbox where available, or the configured Docker/LocalStack mail sink.

| ID      | Operation                                               | Security | Status                                                        | Dedicated spec file                                    |
| ------- | ------------------------------------------------------- | -------- | ------------------------------------------------------------- | ------------------------------------------------------ |
| AUTH-04 | `POST /api/v1/users/logout`                             | Bearer   | ✅ Covered                                                    | `users/post-users-logout.api.spec.ts`                  |
| AUTH-05 | `POST /api/v1/users/refresh`                            | Public   | ✅ Covered                                                    | `users/post-users-refresh.api.spec.ts`                 |
| AUTH-06 | `DELETE /api/v1/users/{username}/right-to-be-forgotten` | Bearer   | ✅ Covered                                                    | `users/delete-users-right-to-be-forgotten.api.spec.ts` |
| AUTH-07 | `POST /api/v1/users/password/forgot`                    | Public   | 🟡 Partial — delivery cannot be observed on the hosted target | `users/post-users-password-forgot.api.spec.ts`         |
| AUTH-08 | `POST /api/v1/users/password/reset`                     | Public   | 🟡 Partial — success needs a controlled reset token source    | `users/post-users-password-reset.api.spec.ts`          |
| SHOP-07 | `DELETE /api/v1/cart`                                   | Bearer   | ✅ Covered                                                    | `cart/delete-cart.api.spec.ts`                         |
| SHOP-08 | `POST /api/v1/cart/items`                               | Bearer   | ✅ Covered                                                    | `cart/post-cart-items.api.spec.ts`                     |
| SHOP-09 | `PUT /api/v1/cart/items/{productId}`                    | Bearer   | ✅ Covered                                                    | `cart/put-cart-items-by-product-id.api.spec.ts`        |
| SHOP-10 | `DELETE /api/v1/cart/items/{productId}`                 | Bearer   | ✅ Covered                                                    | `cart/delete-cart-items-by-product-id.api.spec.ts`     |
| SHOP-12 | `POST /api/v1/orders`                                   | Bearer   | 🟡 Partial                                                    | `orders/post-orders.api.spec.ts`                       |
| SHOP-13 | `GET /api/v1/orders/{id}`                               | Bearer   | 🟡 Partial                                                    | `orders/get-orders-by-id.api.spec.ts`                  |
| SHOP-14 | `POST /api/v1/orders/{id}/cancel`                       | Bearer   | 🟡 Partial                                                    | `orders/post-orders-by-id-cancel.api.spec.ts`          |

### Authorization, administration, and multi-step authentication

**Focus:** Role boundaries, admin-only resource management, and two-factor authentication. Keep client-denied and admin-success scenarios distinct. When no controlled admin is available, client-denied coverage can still progress while admin-success remains blocked. Run admin-success cases only with a controlled test admin. Isolate accounts used for MFA setup, confirmation, use, recovery, and disablement.

| ID       | Operation                                              | Security | Status                                                   | Dedicated spec file                                   |
| -------- | ------------------------------------------------------ | -------- | -------------------------------------------------------- | ----------------------------------------------------- |
| USER-01  | `GET /api/v1/users`                                    | Bearer   | ✅ Covered (authenticated client receives 200)           | `users/get-users.api.spec.ts`                         |
| USER-04  | `DELETE /api/v1/users/{username}`                      | Bearer   | ✅ Covered                                               | `users/delete-users-by-username.api.spec.ts`          |
| SHOP-02  | `POST /api/v1/products`                                | Bearer   | ✅ Covered                                               | `products/post-products.api.spec.ts`                  |
| SHOP-04  | `PUT /api/v1/products/{id}`                            | Bearer   | ✅ Covered                                               | `products/put-products-by-id.api.spec.ts`             |
| SHOP-05  | `DELETE /api/v1/products/{id}`                         | Bearer   | ✅ Covered                                               | `products/delete-products-by-id.api.spec.ts`          |
| ADMIN-01 | `GET /api/v1/orders/admin`                             | Bearer   | ✅ Covered                                               | `orders/get-orders-admin.api.spec.ts`                 |
| ADMIN-02 | `PUT /api/v1/orders/{id}/status`                       | Bearer   | ✅ Covered                                               | `orders/put-orders-by-id-status.api.spec.ts`          |
| ADMIN-03 | `GET /api/v1/admin/inventory`                          | Bearer   | ✅ Covered                                               | `admin/get-admin-inventory.api.spec.ts`               |
| ADMIN-04 | `GET /api/v1/admin/inventory/{productId}`              | Bearer   | ✅ Covered                                               | `admin/get-admin-inventory-by-product-id.api.spec.ts` |
| ADMIN-05 | `POST /api/v1/admin/inventory/{productId}/adjustments` | Bearer   | ✅ Covered                                               | `admin/post-admin-inventory-adjustments.api.spec.ts`  |
| ADMIN-06 | `GET /api/v1/admin/inventory/{productId}/movements`    | Bearer   | ✅ Covered                                               | `admin/get-admin-inventory-movements.api.spec.ts`     |
| AUTH-10  | `POST /api/v1/users/signin/2fa`                        | Public   | 🟡 Partial — valid-challenge rejection cases remain      | `users/post-users-signin-2fa.api.spec.ts`             |
| AUTH-11  | `POST /api/v1/users/2fa/setup`                         | Bearer   | 🟡 Partial — invalid-token and repeat-setup cases remain | `users/post-users-2fa-setup.api.spec.ts`              |
| AUTH-12  | `POST /api/v1/users/2fa/confirm`                       | Bearer   | ✅ Covered                                               | `users/post-users-2fa-confirm.api.spec.ts`            |
| AUTH-14  | `POST /api/v1/users/2fa/recovery-codes`                | Bearer   | ✅ Covered                                               | `users/post-users-2fa-recovery-codes.api.spec.ts`     |
| AUTH-15  | `POST /api/v1/users/2fa/disable`                       | Bearer   | ✅ Covered                                               | `users/post-users-2fa-disable.api.spec.ts`            |

### External services and integration-dependent behavior

**Focus:** Behaviors that depend on identity, messaging, or AI services. Prefer controlled local services or deterministic substitutes for stable runs. Document each required service and repeatable setup. If a dependency is unavailable, keep the blocker specific and continue with independent negative or contract checks.

| ID      | Operation                         | Security | Status                                                             | Dedicated spec file                         |
| ------- | --------------------------------- | -------- | ------------------------------------------------------------------ | ------------------------------------------- |
| AUTH-09 | `POST /api/v1/users/sso/exchange` | Public   | ⏸️ Blocked — controlled OIDC identity needed                       | `users/post-users-sso-exchange.api.spec.ts` |
| OPS-02  | `POST /api/v1/email`              | Bearer   | ⬜ Planned                                                         | `email/post-email.api.spec.ts`              |
| INT-01  | `POST /api/v1/ollama/generate`    | Bearer   | 🟡 Partial — upstream 404/500 cases need a controlled fault target | `ollama/post-ollama-generate.api.spec.ts`   |
| INT-02  | `POST /api/v1/ollama/chat`        | Bearer   | 🟡 Partial — upstream 404/500 cases need a controlled fault target | `ollama/post-ollama-chat.api.spec.ts`       |
| INT-03  | `POST /api/v1/ollama/chat/tools`  | Bearer   | 🟡 Partial — upstream 404/500 cases need a controlled fault target | `ollama/post-ollama-chat-tools.api.spec.ts` |

## Coverage approach for each operation

Keep scenarios in that operation's dedicated file. Choose applicable checks based on the operation's purpose and documented contract:

1. **Success:** valid request, documented status, and response shape.
2. **Authentication:** for bearer-protected operations, missing, malformed/invalid, and valid client credentials.
3. **Authorization:** client/admin boundaries, ownership, and cross-user isolation when applicable.
4. **Validation:** missing fields, invalid formats, boundary values, and unsupported enum values.
5. **Resource/state:** not found, duplicate or conflicting requests, invalid state transitions, and resulting state after a mutation.
6. **Cleanup:** remove or reset test-created data without deleting shared seed data.

Do not repeat a check that cannot apply to an operation; note the reason in its spec or plan row. Keep assertions at the API contract level instead of coupling them to internal implementation details.

## Working on an operation

For each selected operation, add or update its dedicated spec, run that file against the intended API environment, and record the implementation status and latest run result separately. Related operations can be handled together when they share fixtures or setup, while retaining one spec file per method and path.

Example single-file command:

```powershell
npx playwright test tests/4_byst.re_api_tests/<spec-file> --project=bystre-api-tests --workers=1 --retries=0
```

## Progress log

Record the date, workstream or operation IDs, implemented change, and latest run result. A spec can be ✅ Covered while its latest run is failing; keep implementation status and run outcome distinct in the log.

| Date       | Workstream / operation IDs | Change                                                                                                                                                                                                                                                                      | Latest run / blocker                                                                                                                |
| ---------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-19 | Baseline                   | Mapped the 53 operations in the checked-in OpenAPI snapshot and the existing spec/fixture coverage. Reordered the roadmap by estimated implementation difficulty.                                                                                                           | Plan update only; no test run recorded.                                                                                             |
| 2026-10-19 | AUTH-04, AUTH-05           | Added separate logout and refresh specs for token revocation, refresh rotation/reuse, validation, and unauthorized access.                                                                                                                                                  | 6/6 Playwright tests passed against the configured API (`--project=bystre-api-tests --workers=1 --retries=0`).                      |
| 2026-10-19 | OPS-03–OPS-05              | Added controller-scoped traffic client, DTOs, fixture, shared entry assertions, and one dedicated spec per traffic operation. Coverage includes scoped info topics, generated-log pagination/filtering, correlation lookup, invalid input, and an empty not-found response. | Full Bystre API project: 25/27 passed. The live API returned HTTP 500 for correlation-ID detail lookup and the text-filter request. |
| 2026-10-19 | OPS-05                     | Removed the correlation-ID detail spec after the live API returned HTTP 500. The endpoint remains in the contract inventory as planned; the unused client method was removed.                                                                                               | Full Bystre API project: the correlation-ID detail case still returned HTTP 500. Revisit when the endpoint is stable.               |

| 2026-10-19 | USER-01, USER-02, SHOP-06, SHOP-07 | Added dedicated specs for user listing, username lookup, cart retrieval, and cart clearing, including authentication and not-found checks. | 13/13 Playwright checks passed against the configured API (`--project=bystre-api-tests --workers=1 --retries=0`). Client access to user listing returned 200. |
| 2026-10-19 | OPS-01 | Added QR client, fixture, and endpoint spec for PNG output, auth rejection, and missing/blank text validation. | 5/5 Playwright tests passed against Bystre using an isolated config. Live probes confirmed the same behavior; the temporary probe user was deleted (204). |
| 2026-10-19 | INT-01–INT-04 | Added four Ollama operation specs, typed client/fixture, and a multiline SSE JSON parser. Coverage includes definitions, token assembly, thinking, tool iterations, validation, and bearer rejection. | Only the new Ollama specs ran: 19/19 passed against the hosted API (`--project=bystre-api-tests --workers=1 --retries=0`). Upstream 404/500 behavior remains untested with the current mock. |
| 2026-10-27 | USER-04, SHOP-02, SHOP-04, SHOP-05, ADMIN-01–ADMIN-06 | Added dedicated admin operation specs and a separate Playwright project for the daily-reset admin host. Coverage includes admin success and client-denied checks; mutable resources are isolated and cleaned up. | New admin project passed 20/20 Playwright tests against `BYSTRE_ADMIN_API_BASE_URL` with 3 workers. |

| 2026-10-27 | AUTH-01, AUTH-06, USER-01–USER-04, USER-06, USER-08, SHOP-02 | Expanded signup, user lookup/edit/delete, own-account deletion, and product creation coverage with isolated data, authorization checks, validation, and persisted-state checks. Updated malformed-JSON assertions to the current 400 response and limited role assumptions for unrelated listed accounts to the documented array shape. | Both complete Bystre Playwright projects passed 132/132 tests with 3 workers and no retries. Formatting, lint, and TypeScript checks passed. |
| 2026-10-27 | SHOP-08–SHOP-14 | Added seven dedicated cart and customer-order specs, cart/order clients and fixtures, and an `@orders` tag. Cart operations cover state, totals, isolation, stock, validation, and auth. Order specs cover empty listing, pagination/query validation, empty-cart checkout, address validation, missing/malformed IDs, and auth. | New Bystre specs passed 34/34 (`--project=bystre-api-tests --workers=2 --retries=0`). SHOP-11–SHOP-14 remain partial: `.env.ai` has no controlled admin identity to create a disposable product on the non-admin target. Resume successful checkout, nonempty listing/ownership, retrieval, cancellation, and invalid transitions when a controlled product can be created on that same host or a suitable local integration environment is available. |
| 2026-10-27 | AUTH-07–AUTH-08, AUTH-10–AUTH-15 | Added dedicated password-recovery and MFA specs with isolated accounts, plus MFA setup and TOTP helpers. AUTH-08 has invalid-token and validation coverage; success still needs a controlled reset token source. | A Playwright passing marker exists for the account-security worktree, but no test count was recorded in this handoff. The hosted forgot response returned `token: null`; the local outbox profile at `localhost:4001` and a controlled mail sink were unavailable. |
| 2026-10-27 | SHOP-11 | Removed a status filter from the new user's empty-order-list test because an empty result cannot establish that filtering works. Nonempty filtering remains partial. | Focused GET-orders spec passed 6/6 live tests. A disposable-user probe returned 200 for empty `PENDING` and `PAID` lists and deleted the account with 204. |
| 2026-10-27 | AUTH-12, AUTH-14, AUTH-15 | Added missing-bearer and invalid-bearer rejection cases for MFA confirmation, recovery-code rotation, and disablement. | All six new cases passed. A three-spec run passed 13/15 with 3 workers at the default 10-second timeout; two existing AUTH-15 cases timed out and account teardown returned 500. Both cases passed on a focused one-worker rerun with a 30-second timeout (2/2, 12.7 seconds), including cleanup. Prettier, ESLint, TypeScript, and diff checks passed on the agent branches. |
| 2026-10-27 | AUTH-15 | Gave the two multi-request MFA disable workflows a 30-second test timeout after the default 10-second limit was exceeded under load. | Focused AUTH-15 spec passed 5/5 with 3 workers and no retries. Prettier, ESLint, TypeScript, and diff checks passed. |
| 2026-10-27 | AUTH-07, AUTH-14, AUTH-15 | Made the forgot-password token assertion valid for both hosted and local response shapes. After recovery-code rotation, the test now rejects an old code and accepts a new one. The MFA-disable test now proves a previously valid refresh token is rejected after disablement. Token assertions avoid printing secret values on failure. | Hosted AUTH-07 spec passed 3/3; the local profile was unavailable. AUTH-14 spec passed 5/5 before the final token-safe assertion revision, and the revised scenario passed 1/1. The revised AUTH-15 scenario passed 1/1. Disposable probe accounts were deleted. Agent branch formatting, lint, TypeScript, and diff checks passed. |

## Completion criteria

Coverage is complete when each of the 53 method/path operations has its own spec file, each operation has a current status, applicable security and role boundaries are covered, blockers have been revisited, and recent run outcomes are recorded above. Any operation that remains blocked must include a concrete reason and the environment change needed to resume it. Workstreams are organizational views; progress can happen in any order as risk, readiness, and dependencies change.
