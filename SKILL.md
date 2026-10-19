# AI-Testers API Testing Skill

**AI-Testers Repository Conventions** — This skill guides API test design and implementation using the patterns, helpers, and best practices from the AI-Testers project.

## When to Use This Skill

Use this skill when:

- Writing, extending, or fixing REST API tests using Playwright's `request` fixture
- Designing new API test cases for specific endpoints or modules
- Creating API client abstractions, helpers, or support utilities
- Adding assertions on HTTP status codes, response bodies, or error contracts
- Organizing API tests into spec files and support structures
- Implementing test data factories or fixtures for API tests

## Key Principles

### 1. Test Structure: Arrange/Act/Assert

All API tests follow a clear three-section structure with mandatory comment markers:

```typescript
test(
  "description of what should happen",
  { tag: ["@auth", "@smoke"] },
  async ({ request }) => {
    // Arrange
    const user = createTestUser();
    const credentials = { email: user.email, password: user.password };

    // Act
    const response = await request.post(ApiUrls.login, {
      data: credentials,
    });
    const body =
      await readApiResponse<ApiSuccessResponse<LoginResponseData>>(response);

    // Assert
    expect(response.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.token).toEqual(expect.any(String));
  },
);
```

- **Arrange**: Set up test data, users, and request payloads
- **Act**: Make the HTTP request(s) and capture the response
- **Assert**: Verify status codes, response structure, and data integrity

### 2. Response Handling

Use the `readApiResponse<T>()` helper to parse and type responses:

```typescript
const body =
  await readApiResponse<ApiSuccessResponse<LoginResponseData>>(response);
```

This ensures:

- Type-safe response bodies
- Consistent JSON parsing across all tests
- Clear separation of concerns (reading vs. asserting)

For external APIs (e.g., Bystre), create API client classes that handle response parsing internally.

### 3. API Client Abstraction

Encapsulate endpoint logic in dedicated client classes:

```typescript
// bystre-users-api.client.ts
export class BystreUsersApiClient {
  constructor(private request: APIRequestContext) {}

  async login(credentials: LoginPayload, token?: string): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/users/login`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      data: credentials,
    });
  }

  async getMe(token: string): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
```

**Benefits:**

- Reduced duplication across test files
- Centralized endpoint URL and header management
- Easy mocking and testing of HTTP interactions
- Clear API contract documentation

### 4. Test Data Factories

Create reusable test data generators:

```typescript
// api-test-helpers.ts
export async function registerFreshUser(
  overrides: Partial<User> = {},
): Promise<{ user: User; token: string; userId: number }> {
  const context = await playwrightRequest.newContext({
    baseURL: config.BASE_URL,
  });
  const user = createTestUser(overrides);
  const response = await context.post(ApiUrls.register, {
    data: {
      email: user.email,
      password: user.password,
      displayedName: user.displayName,
    },
  });
  const body =
    await readApiResponse<ApiSuccessResponse<RegisterResponseData>>(response);
  await context.dispose();
  return { user, token: body.data.token, userId: body.data.user.id };
}
```

**Best practices:**

- Use a **disposable request context** for setup that should not affect the test's shared `request` fixture
- Provide **partial overrides** for flexible parameterization
- Return all relevant data (user, token, ID) for downstream assertions
- Keep factories focused on single concerns (e.g., user registration, field creation)

### 5. Fixtures and Shared Setup

For Bystre and other complex APIs, create fixtures to manage authentication state:

```typescript
// bystre-users-api.fixtures.ts
export const bystreAuthFixture = test.extend<BystreAuthFixtureType>({
  bystreAuth: async ({ request }, use) => {
    const client = new BystreUsersApiClient(request);
    const loginResponse = await client.login({
      username: requiredBystreCredential(
        config.BYSTRE_API_USERNAME,
        "BYSTRE_API_USERNAME",
      ),
      password: requiredBystreCredential(
        config.BYSTRE_API_PASSWORD,
        "BYSTRE_API_PASSWORD",
      ),
    });
    const { token } = await readApiResponse<BystreLoginResponse>(loginResponse);

    await use({ client, token, request });
  },
});
```

Use fixtures to:

- Manage expensive setup (e.g., login, token generation)
- Provide consistent authentication across multiple tests
- Allow per-test teardown or state reset

### 6. Assertion Helpers

Create focused helpers for common assertion patterns:

```typescript
// bystre-api.assertions.ts
export function expectBystreLoginAuthState(body: BystreLoginResponse) {
  expect(body).toMatchObject({
    username: expect.any(String),
    email: expect.stringMatching(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    roles: expect.arrayContaining([expect.any(String)]),
    mfaRequired: expect.any(Boolean),
  });
}
```

Helpers should:

- Encapsulate complex multi-field assertions
- Provide descriptive failure messages via `expect` descriptions
- Be reusable across multiple tests or test files
- Document the contract being validated

### 7. Error Response Validation

Always validate error responses with status codes and messages:

```typescript
test("rejects unknown credentials", async ({ request }) => {
  // Arrange
  const api = new BystreUsersApiClient(request);

  // Act
  const response = await api.login({
    username: "unknown-user",
    password: "invalid-password",
  });
  const body = await readApiResponse<BystreErrorResponse>(response);

  // Assert
  expect(response.status()).toBe(422);
  expect(body).toMatchObject({
    message: expect.stringMatching(/unauthorized|invalid|credential/i),
  });
});
```

**Error validation checklist:**

- ✅ Verify HTTP status code (400, 401, 403, 422, 500, etc.)
- ✅ Check error message matches expected pattern or exact text
- ✅ Validate error structure (`{ message }`, `{ errors: {...} }`, etc.)
- ✅ Test both missing and invalid credentials separately

### 8. Test Tagging and Organization

Tag tests with relevant categories from `test-plan.md`:

```typescript
test(
  "returns a session or MFA challenge for valid credentials",
  { tag: ["@bystre", "@auth", "@smoke", "@bystre-credentials"] },
  async ({ request }) => { ... },
);
```

**Common tags:**

- `@smoke` — Critical path tests (login, basic CRUD)
- `@auth` — Authentication/authorization tests
- `@bystre` — Bystre API tests
- `@bystre-credentials` — Tests requiring Bystre credentials
- `@farm`, `@marketplace`, `@finance` — Feature areas
- `@rbac` — Role-based access control tests

Tag rules:

- Every test must have **at least one tag** matching its feature area
- Use `@smoke` only for critical, fast-running tests
- Add `@bystre-credentials` if the test requires valid login credentials
- Keep tags in `test-plan.md` as the source of truth

### 9. File Organization

Organize API tests and support code by feature or endpoint:

```
tests/3_api_tests/
├── api-test-helpers.ts          # Shared helpers (registerFreshUser, fundUserAccount, etc.)
├── login.api.spec.ts             # Authentication endpoint tests
├── fields-staff-animals.api.spec.ts
├── financial-*.api.spec.ts
└── marketplace-offers.api.spec.ts

tests/4_byst.re_api_tests/
├── docs/
│   └── bystre-docs.api.spec.ts
├── products/
│   ├── get-products.api.spec.ts
│   └── get-products-by-id.api.spec.ts
├── traffic/
│   ├── get-traffic-info.api.spec.ts
│   └── get-traffic-logs.api.spec.ts
├── users/
│   ├── bystre-login.api.spec.ts
│   ├── bystre-me.api.spec.ts
│   ├── bystre-signup.api.spec.ts
│   ├── get-users-*.api.spec.ts
│   ├── post-users-*.api.spec.ts
│   └── put-users-*.api.spec.ts
└── support/
    ├── shared/
    │   └── bystre-api.assertions.ts
    ├── users/
    │   ├── bystre-users-api.client.ts
    │   ├── bystre-users-api.fixtures.ts
    │   ├── bystre-users-api.helpers.ts
    │   ├── bystre-users-api.models.ts
    │   └── bystre-user-lifecycle.ts
    └── traffic/
        └── bystre-traffic-api.client.ts
```

**Rules:**

- Spec files: `<endpoint-or-feature>.api.spec.ts`
- Support files organize by: client classes, helpers, fixtures, models, assertions
- Share helpers and models across related endpoint specs
- Keep API clients focused on a single resource or feature area

### 10. Configuration and Base URLs

Use `playwright.config.ts` to define base URLs per test project:

```typescript
{
  name: "api-tests",
  testMatch: /.*3_api_tests\/.*\.spec\.ts/,
  use: { baseURL: config.BASE_URL },
},

{
  name: "bystre-api-tests",
  testMatch: /.*4_byst\.re_api_tests\/.*\.api\.spec\.ts/,
  use: { baseURL: config.BYSTRE_API_BASE_URL },
},
```

Access base URLs from:

```typescript
const baseUrl = config.BASE_URL; // from src/config/environment.ts
const bystreUrl = config.BYSTRE_API_BASE_URL;
```

## Common Patterns

### Checking for Credential Requirements

For tests that conditionally need credentials (e.g., Bystre API login):

```typescript
import { requiredBystreCredential } from "../support/users/bystre-users-api.helpers";

const username = requiredBystreCredential(
  config.BYSTRE_API_USERNAME,
  "BYSTRE_API_USERNAME",
);
```

This helper throws a meaningful error if the credential is missing at test time.

### Multi-Step Test Workflows

Chain API calls in the Arrange phase:

```typescript
// Arrange
const { user, token, userId } = await registerFreshUser();
const fieldId = await createFieldForUser(request, token);
const staffId = (await createOwnedStaff(request, token, { name: "John" })).id;

// Act
const response = await request.post(ApiUrls.fieldsAssign, {
  headers: { token },
  data: { fieldId, staffId },
});
const body = await readApiResponse<ApiSuccessResponse<Assignment>>(response);

// Assert
expect(response.status()).toBe(200);
expect(body.data).toMatchObject({
  fieldId,
  staffId,
  assignedAt: expect.any(String),
});
```

### Testing Pagination and Filtering

```typescript
test("returns paginated results", async ({ request }) => {
  // Arrange
  const { token } = await registerFreshUser();

  // Act
  const response = await request.get(ApiUrls.products, {
    params: { skip: 0, take: 10, filter: "active" },
    headers: { token },
  });
  const body = await readApiResponse<PaginatedResponse<Product>>(response);

  // Assert
  expect(body.total).toBeGreaterThanOrEqual(0);
  expect(body.items).toHaveLength(Math.min(body.total, 10));
  expect(body.items).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
      }),
    ]),
  );
});
```

### Testing Validation Errors

```typescript
test("rejects invalid field data", async ({ request }) => {
  // Arrange
  const { token } = await registerFreshUser();
  const invalidField = { name: "", district: "invalid-code", area: -5 };

  // Act
  const response = await request.post(ApiUrls.fields, {
    headers: { token },
    data: invalidField,
  });
  const body = await readApiResponse<ValidationErrors>(response);

  // Assert
  expect(response.status()).toBe(400);
  expect(body.errors).toMatchObject({
    name: expect.stringMatching(/required|empty|name/i),
    district: expect.stringMatching(/invalid|code/i),
    area: expect.stringMatching(/positive|greater/i),
  });
});
```

## No-Nos

❌ **Don't:**

- Use `page` (browser automation) for API tests — use `request` fixture only
- Put assertions in page objects or helpers — keep them in test files
- Mix business logic with test setup — use factories and fixtures
- Hardcode credentials in tests — always use config or environment variables
- Create tests without Arrange/Act/Assert sections marked with comments
- Skip or ignore failing API tests — fix them promptly
- Create custom request helpers that duplicate Playwright's built-in methods

## References

- [Playwright API Testing Docs](https://playwright.dev/docs/api-testing)
- [AI-Testers Coding Standards](./coding-standards.md)
- [Playwright Configuration](./playwright.config.ts)
