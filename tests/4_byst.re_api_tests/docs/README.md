# Bystre REST API tests

This folder contains API test assets for the application running at [awesome.byst.re](https://awesome.byst.re).
The service is the **test-secure-backend** application, a Spring Boot backend for a small commerce app. Its REST API
provides authentication and user management, a product catalog, shopping carts, orders, and administrator inventory
operations.

## API under test

- Base URL: `https://awesome.byst.re`
- OpenAPI document: `https://awesome.byst.re/v3/api-docs`
- Local snapshot: [`bystre-api-docs.tmp.json`](./bystre-api-docs.tmp.json)
- The snapshot identifies the API as **JWT Authentication API 1.0** and uses OpenAPI 3.1.0.

Use the OpenAPI snapshot to check request and response schemas and the currently documented routes. It is a point-in-time
copy; refresh it from the live API when its contract changes.

## Application overview

The backend is built with Java and Spring Boot. Its main capabilities include:

- Account signup, password sign-in, refresh-token rotation, logout, password recovery, and user profile management.
- Optional OIDC single sign-on exchange and two-factor authentication (TOTP and recovery codes).
- JWT-protected APIs with `ADMIN` and `CLIENT` roles. Password or SSO authentication issues the application's JWT;
  protected requests use `Authorization: Bearer <token>`.
- Product catalog, customer carts, order creation and cancellation, and administrator order and inventory management.
- QR code generation, email operations and per-user email delivery events, Ollama text/chat endpoints, and HTTP traffic
  monitoring.
- A GraphQL commerce API is enabled by the `graphql` profile; native gRPC inventory operations are optional.

The main data areas are users, products, cart items, orders, and email-event metadata. Depending on the deployment,
the app uses PostgreSQL or an in-memory H2 database. Other integrations documented by the source repository include
ActiveMQ for email messaging, Keycloak for local SSO, and Ollama for AI endpoints.

## REST API areas

The current OpenAPI document includes routes under `/api/v1`, including:

- **Users and authentication:** `/users/signup`, `/users/signin`, `/users/signin/2fa`, `/users/refresh`, `/users/logout`,
  `/users/sso/exchange`, `/users/me`, and `/users/{username}`.
- **Two-factor authentication:** `/users/2fa/setup`, `/users/2fa/confirm`, `/users/2fa/status`,
  `/users/2fa/recovery-codes`, and `/users/2fa/disable`.
- **Password recovery:** `/users/password/forgot` and `/users/password/reset`.
- **Commerce:** `/products`, `/cart`, `/cart/items`, `/orders`, and their item or resource routes.
- **Administrator inventory:** `/admin/inventory` and `/admin/inventory/{productId}` with adjustment and movement routes.
- **Other features:** `/qr/create`, `/email`, `/ollama/*`, and `/traffic/*`.

Check the OpenAPI document for supported HTTP methods, full schemas, and operation-level security requirements. In
general, test unauthenticated access, valid and invalid JWTs, and role boundaries where applicable. The upstream project
organizes endpoint coverage around success cases and expected client or authorization errors (such as 400, 401, 403,
and 404).

## Reusable authenticated-user fixture

User endpoint specs live under `tests/4_byst.re_api_tests/users/`; import `test`
and `expect` from `../support/users/bystre-users-api.fixtures`. Traffic endpoint
specs and their helpers live in the corresponding `traffic/` folders.

The fixtures are lazy and scoped to one test:

- `bystreUsersApi` wraps Playwright's built-in `request` context with the user-controller client.
- `userCleanup` tracks successfully registered users and deletes them during teardown.
  Call `userCleanup(user)` immediately after signup returns `201`; call it again with
  `userCleanup(user, token)` when a validated sign-in token is available.
- `authenticatedUser` registers a fresh user, signs in, and returns `{ user, token }`.
  `user` contains `username`, `email`, `password`, `firstName`, and `lastName`.
  `token` is the raw JWT access token; add `Bearer ` when supplying Authorization.

```typescript
import { expect, test } from "../support/users/bystre-users-api.fixtures";

test(
  "returns the authenticated user",
  { tag: ["@bystre", "@auth", "@smoke"] },
  async ({ bystreUsersApi, authenticatedUser }) => {
    // Arrange
    const { user, token } = authenticatedUser;

    // Act
    const response = await bystreUsersApi.getMe(`Bearer ${token}`);

    // Assert
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  },
);
```

Every authenticated fixture instance, including retries and parallel runs, gets a
fresh UUID-based username and `example.com` email. Password randomness is independent
of the public username/email. First and last names are selected from valid name sets.
Anonymous and malformed-token tests request only `bystreUsersApi`, so they register no users.
Authorization is supplied per request, without a default bearer header on the context.

Setup requires signup `201`, sign-in `200`, `mfaRequired: false`, and a nonempty
access token. Unexpected statuses or invalid responses fail setup with a sanitized
stage-specific error. `authenticatedUser` setup and `userCleanup` teardown each have
a separate 30-second fixture timeout; endpoint tests retain the project's 10-second timeout.

`authenticatedUser` depends on `userCleanup`, so account cleanup runs even if sign-in
or a test fails. Teardown calls
`DELETE /api/v1/users/{username}/right-to-be-forgotten` with the generated user's own
JWT and requires `204`. The backend permits the account owner or an administrator;
its deletion service removes the account, refresh/reset tokens, email events, cart
items, orders, and MFA state. No administrator credentials are needed. Successful
deletion replaces logout. Playwright disposes its request context after cleanup.

If registration succeeded but setup did not produce a usable token, cleanup makes
one sign-in attempt with the generated credentials before deleting the account.
The successful signup test also uses `userCleanup`, signing in only during teardown.
Cleanup failures identify the username and sanitized failure reason, and fail the
run independently of any original setup/test failure. `401`, `403`, and `404` are
not silently accepted as successful deletion. Every tracked user is attempted if
the cleanup timeout permits; credentials and tokens are never included in errors.

Only confirmed `201` registrations are tracked. A lost signup response, persistent
authentication/API failure, exhausted timeout, or forcibly terminated runner can
still leave an account behind. Tests that delete their own account, rename users,
or invalidate authentication need a cleanup strategy appropriate to those mutations.
Existing orphaned accounts require a separate administrator cleanup using an
explicitly reviewed account list; this fixture does not bulk-delete accounts.

Credentials are kept in memory and are not explicitly logged or saved. Playwright's
existing retained failure traces can include request bodies and bearer headers;
treat those artifacts as sensitive.

The fixture uses `BYSTRE_API_BASE_URL` and does not require `BYSTRE_API_USERNAME` or
`BYSTRE_API_PASSWORD`. The repository's centralized configuration still requires
the other application environment values listed in `.env.example` when loaded.
Existing static-credential login tests remain separate.

### Current-user endpoint coverage

`users/bystre-me.api.spec.ts` checks `GET /api/v1/users/me` for a newly issued valid JWT,
missing Authorization, a malformed bearer token, and a modified JWT signature.
The happy path verifies the generated public profile, user ID, client role, and
absence of password/token fields.

Run only this spec from the repository root:

```powershell
npx playwright test tests/4_byst.re_api_tests/users/bystre-me.api.spec.ts --project=bystre-api-tests --workers=1 --retries=0
```

To check isolation across concurrent fixture instances:

```powershell
npx playwright test tests/4_byst.re_api_tests/users/bystre-me.api.spec.ts --project=bystre-api-tests --workers=2 --repeat-each=2 --retries=0
```

These commands create real test accounts on the configured API.

### Refresh-token and logout endpoint coverage

`users/post-users-refresh.api.spec.ts` checks that a valid refresh token is rotated, that the old token cannot be reused, and that blank and unknown tokens are rejected. `users/post-users-logout.api.spec.ts` checks that an authenticated logout revokes the user's refresh tokens and that missing or invalid bearer credentials are rejected. Each operation has its own spec file.

Run either endpoint spec from the repository root:

```powershell
npx playwright test tests/4_byst.re_api_tests/users/post-users-refresh.api.spec.ts --project=bystre-api-tests --workers=1 --retries=0
npx playwright test tests/4_byst.re_api_tests/users/post-users-logout.api.spec.ts --project=bystre-api-tests --workers=1 --retries=0
```

Both specs use the authenticated-user fixture, which creates and cleans up a unique test account. The logout test verifies refresh-token revocation; the fixture's access token remains available for account cleanup.

## Local application profiles

The source repository documents two common test setups:

- **Local profile:** H2 in-memory database with demo seed data; suitable for development and isolated testing.
- **Docker profile:** PostgreSQL-backed services. `docker compose up --build` uses the `docker,demo` profiles and loads
  demo users, products, and orders.

Demo accounts and seed data are intended only for local/demo environments. Use credentials supplied through the test
environment for the hosted API; do not assume that local seed accounts exist on the public service.

## Knowledge base

Application behavior and local setup are summarized from the sibling [`test-secure-backend`](../../../../test-secure-backend/README.md)
repository. The API snapshot in this folder records the contract served by the hosted Bystre API when it was downloaded.
