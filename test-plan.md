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

## Test Areas

### Registration & Login

- Register with valid data succeeds and auto-logs in; duplicate email or invalid fields fail.
- Login with valid/invalid credentials; logout clears the session.
- Requests without a valid token are rejected.

### Role-Based Access

- Farmers cannot access admin/superadmin pages or endpoints.
- Admins/superadmins can view and manage all users' resources.

### Farm & Resource Management

- Add, edit, and remove fields, animals, and staff.
- Assign staff/animals to a field.

### Marketplace Trading

- Create an offer for an unassigned resource → active; for an assigned one → unavailable.
- Buy an active offer → ownership transferred, balances updated, offer marked sold.
- Buying with insufficient funds, buying own offer, or buying a non-active offer is blocked.
- Cancel an active offer → cancelled.

### Financial Operations

- View balance and transaction history.
- Balance updates correctly after purchases and transfers; no overdraft allowed.

## End-to-End Scenarios

1. **Register and Set Up Farm** – register → log in → add field, animal, staff → verify farm overview.
2. **Sell a Field on the Marketplace** – User A offers a field → User B buys it → ownership and balances updated.
3. **Insufficient Funds** – user tries to buy an offer above their balance → purchase blocked, balance unchanged.

## Out of Scope / Lower Priority

- Alerts, Contact Form, Interactive Farm Map — verify only when the related feature flags are enabled.

## Tools

- Swagger UI (/swagger.html) for API-level checks.
- Automate via Playwright specs under `tests/`.
