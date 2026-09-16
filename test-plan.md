# Test Plan – Rolnopol

Based on the documentation at http://localhost:3000/docs.html

## Scope

Core flows: registration/login, role-based access, farm & resource management, marketplace
trading, financial operations. Feature-flagged areas (Alerts, Contact Form, Interactive Farm
Map) are lower priority.

## Environment

- App: http://localhost:3000
- API docs: /swagger.html
- Demo account: demo@example.com / demo123 (farmer)

## Tags

Tags map to Playwright's `--grep`/`--grep-invert` filters (e.g. `npx playwright test --grep @smoke`).

| Tag            | Meaning                                      |
| -------------- | -------------------------------------------- |
| `@auth`        | Registration & login                         |
| `@rbac`        | Role-based access                            |
| `@farm`        | Farm & resource management                   |
| `@marketplace` | Marketplace trading                          |
| `@finance`     | Financial operations                         |
| `@e2e`         | End-to-end scenario                          |
| `@flagged`     | Behind a feature flag                        |
| `@docs`        | Documentation & API reference                |
| `@system`      | System/health/debug/logs & version endpoints |
| `@smoke`       | Critical path, run on every build            |

## Test Areas

Checkboxes indicate implementation status: `[x]` implemented, `[ ]` not yet implemented.

### Registration & Login

- [x] Register with valid data succeeds and redirects to the login page. `@auth @smoke`
- [x] Registering with a duplicate email fails. `@auth @smoke`
- [x] Registering with invalid fields (invalid email format, password too short, missing required fields) fails. `@auth @smoke`
- [x] Login with valid credentials succeeds. `@auth @smoke`
- [x] Login with invalid credentials fails. `@auth @smoke`
- [x] Logout clears the session. `@auth @smoke`
- [x] Requests without a valid token are rejected. `@auth` (API, tests/3_api_tests/users-system.api.spec.ts + fields-staff-animals.api.spec.ts + financial-marketplace.api.spec.ts)

### Role-Based Access

- [x] Farmers cannot access admin/superadmin endpoints. `@rbac` (API 403 checks on `/users/statistics/all`, `/financial/accounts/all`, `PUT /financial/accounts/balance` with a non-admin token)
- [ ] Admins/superadmins can view and manage all users' resources. `@rbac` (no admin test account is configured in this repo — cannot exercise the 200 admin-success path yet)

### Farm & Resource Management

- [x] Add a field with valid data. `@farm @smoke`
- [x] Find a newly added field via search. `@farm`
- [x] Edit an existing field. `@farm` (API, `PUT /fields/{id}`)
- [x] Remove a field. `@farm` (API, `DELETE /fields/{id}`)
- [x] Add an animal herd with valid data. `@farm`
- [x] Find a newly added animal herd via search. `@farm`
- [x] Edit an animal herd. `@farm` (API, `PUT /animals/{id}`)
- [x] Remove an animal herd. `@farm` (API, `DELETE /animals/{id}`)
- [x] Add, edit, and remove staff. `@farm` (API, `POST`/`PUT`/`DELETE /staff`(`/{id}`))
- [x] Assign staff to a field. `@farm` (API, `POST /fields/assign`, `GET /fields/assign`, `GET /assignments`, `DELETE /assignments/{id}`, `DELETE /fields/assign/{id}`)

### Marketplace Trading

- [ ] Create an offer for an unassigned resource → active; for an assigned one → unavailable. `@marketplace` (offer-creation happy path is covered; the "assigned resource → unavailable" case is not yet tested)
- [x] Buy an active offer → ownership transferred and offer marked sold. `@marketplace @smoke` (API, `POST /marketplace/buy`)
- [ ] Buy an active offer → buyer/seller balances updated accordingly. `@marketplace` — **known app defect**: verified live that `POST /marketplace/buy` does not debit/credit either party's `/financial/account` balance, even though ownership and offer status change correctly. Test intentionally does not assert a balance change until this is confirmed as expected/fixed.
- [x] Buying own offer is blocked. `@marketplace` (API, 400 "cannot buy own offer")
- [ ] Buying with insufficient funds, or buying a non-active/non-existent offer is blocked. `@marketplace` (non-existent offer → 404 is covered; insufficient-funds is not yet tested, since marketplace purchases don't currently move balance at all — see defect above)
- [x] Cancel an active offer → cancelled. `@marketplace` (API, `DELETE /marketplace/offers/{offerId}`)

### Financial Operations

- [x] View balance and transaction history. `@finance` (API, `GET /financial/account`, `GET /financial/transactions`)
- [x] No overdraft allowed for fund transfers (amount exceeding balance is rejected). `@finance @smoke` (API, `POST /financial/transfer` → 400)
- [ ] Balance updates correctly after marketplace purchases. `@finance @marketplace` — see known app defect noted under Marketplace Trading above.

### Navigation & Static Pages

- [x] Homepage loads with the correct title. `@e2e @smoke`
- [x] "Get Started Free" navigates from the homepage to the account creation page. `@auth @smoke`
- [x] Login page loads with the correct title and subtitle. `@auth @smoke`
- [x] Register page loads with the correct title and subtitle. `@auth @smoke`
- [x] Documentation page loads with the correct subtitle. `@docs`
- [x] API Explorer (Swagger) page loads with the correct description. `@docs`

## End-to-End Scenarios

1. [ ] **Register and Set Up Farm** – register → log in → add field, animal, staff → verify farm overview. `@e2e @auth @farm @smoke`
2. [ ] **Sell a Field on the Marketplace** – User A offers a field → User B buys it → ownership and balances updated. `@e2e @marketplace @finance`
3. [ ] **Insufficient Funds** – user tries to buy an offer above their balance → purchase blocked, balance unchanged. `@e2e @marketplace @finance`

## Out of Scope / Lower Priority

- Alerts, Contact Form, Interactive Farm Map — verify only when the related feature flags are enabled. `@flagged`

## Tools

- Swagger UI (/swagger.html) for API-level checks.
- Automate via Playwright specs under `tests/`.
