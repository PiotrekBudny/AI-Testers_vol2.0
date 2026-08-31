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

| Tag            | Meaning                           |
| -------------- | --------------------------------- |
| `@auth`        | Registration & login              |
| `@rbac`        | Role-based access                 |
| `@farm`        | Farm & resource management        |
| `@marketplace` | Marketplace trading               |
| `@finance`     | Financial operations              |
| `@e2e`         | End-to-end scenario               |
| `@flagged`     | Behind a feature flag             |
| `@docs`        | Documentation & API reference     |
| `@smoke`       | Critical path, run on every build |

## Test Areas

### Registration & Login

- Register with valid data succeeds and auto-logs in; duplicate email or invalid fields fail. `@auth @smoke`
- Login with valid/invalid credentials; logout clears the session. `@auth @smoke`
- Requests without a valid token are rejected. `@auth`

### Role-Based Access

- Farmers cannot access admin/superadmin pages or endpoints. `@rbac`
- Admins/superadmins can view and manage all users' resources. `@rbac`

### Farm & Resource Management

- Add, edit, and remove fields, animals, and staff. `@farm @smoke`
- Assign staff/animals to a field. `@farm`

### Marketplace Trading

- Create an offer for an unassigned resource → active; for an assigned one → unavailable. `@marketplace`
- Buy an active offer → ownership transferred, balances updated, offer marked sold. `@marketplace @smoke`
- Buying with insufficient funds, buying own offer, or buying a non-active offer is blocked. `@marketplace`
- Cancel an active offer → cancelled. `@marketplace`

### Financial Operations

- View balance and transaction history. `@finance`
- Balance updates correctly after purchases and transfers; no overdraft allowed. `@finance @smoke`

### Navigation & Static Pages

- Homepage loads with the correct title. `@e2e @smoke`
- "Get Started Free" navigates from the homepage to the account creation page. `@auth @smoke`
- Login and register pages load with the correct title and subtitle. `@auth @smoke`
- Documentation page loads with the correct subtitle. `@docs @smoke`
- API Explorer (Swagger) page loads with the correct description. `@docs @smoke`

## End-to-End Scenarios

1. **Register and Set Up Farm** – register → log in → add field, animal, staff → verify farm overview. `@e2e @auth @farm @smoke`
2. **Sell a Field on the Marketplace** – User A offers a field → User B buys it → ownership and balances updated. `@e2e @marketplace @finance`
3. **Insufficient Funds** – user tries to buy an offer above their balance → purchase blocked, balance unchanged. `@e2e @marketplace @finance`

## Out of Scope / Lower Priority

- Alerts, Contact Form, Interactive Farm Map — verify only when the related feature flags are enabled. `@flagged`

## Tools

- Swagger UI (/swagger.html) for API-level checks.
- Automate via Playwright specs under `tests/`.
