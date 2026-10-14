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
