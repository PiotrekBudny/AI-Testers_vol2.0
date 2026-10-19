---
name: "API Testing Skill"
type: "skill"
domain: "testing"
applies_to: ["claude", "copilot", "codex", "custom"]
version: "1.0"
task_types: ["api_testing", "api_automation", "api_debugging"]
status: "stable"
---

# API Testing Skill

This skill documents the API testing patterns, helpers, and best practices from the AI-Testers project. Use this when writing, extending, or fixing REST API tests with Playwright's `request` fixture.

## When to Use

- Exploring API documentation and designing test strategies
- Writing new API test cases for specific endpoints or modules
- Creating API client abstractions and helper utilities
- Adding assertions on HTTP status codes, response bodies, or error contracts
- Organizing API tests into spec files and support structures
- Implementing test data factories or fixtures for API tests
- Debugging failing API tests
- Validating implementation against requirements before coding

## API Testing Workflow

Before implementing tests, follow this structured workflow:

### 1. Explore & Understand the API

**Step 1a: Locate & Review Documentation**

- Find API documentation: OpenAPI/Swagger spec, README, inline comments
- If live docs available: navigate to `/swagger.html`, `/api/docs`, or similar
- Extract: endpoints, methods, parameters, request/response shapes, status codes
- Identify: authentication requirements, rate limits, data models

**Step 1b: Exploratory Testing with curl or Tools**

```bash
# Test endpoint with curl
curl -X GET http://localhost:3000/api/products
curl -X GET http://localhost:3000/api/products/123
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","price":99.99}'

# With authentication
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test error scenarios
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{}' # Missing required fields
```

**Step 1c: Document Findings**

- Request format (URL, method, headers, body)
- Response format (status codes, body structure, headers)
- Authentication method and token format
- Required vs. optional fields
- Validation rules and error messages
- Edge cases and rate limits

### 2. Create Implementation Plan

**Step 2a: Design Test Matrix**

| Scenario         | Method | Path              | Params        | Expected Status | Notes      |
| ---------------- | ------ | ----------------- | ------------- | --------------- | ---------- |
| List products    | GET    | /api/products     | -             | 200             | happy path |
| List with filter | GET    | /api/products     | ?category=foo | 200             | filtering  |
| Get single       | GET    | /api/products/123 | -             | 200             | happy path |
| Get non-existent | GET    | /api/products/999 | -             | 404             | error case |
| Create product   | POST   | /api/products     | {...}         | 201             | happy path |

**Step 2b: Categorize Tests**

- ✅ Happy path: Valid requests, expected success
- ❌ Sad paths: Invalid input, missing fields, invalid IDs
- ⚠️ Edge cases: Empty results, boundary values, large payloads

**Step 2c: Plan Test Structure**

```typescript
// Suggested file organization
tests/3_api_tests/
├── products-list.api.spec.ts      // GET /products, filtering
├── products-get.api.spec.ts       // GET /products/:id
├── products-create.api.spec.ts    // POST /products
└── products-update.api.spec.ts    // PUT /products/:id
```

### 3. Validate Plan with User

**Before coding, confirm:**

- [ ] All important endpoints are included
- [ ] Happy path, sad path, and edge cases are covered
- [ ] Test count is reasonable (not over-testing)
- [ ] Dependencies between tests are minimal
- [ ] Authentication approach is correct
- [ ] Status codes and error messages match documentation

**Ask user:**

```
"I plan to create 3 test files with ~12 total tests covering:
1. List products (happy path, filtering, error handling)
2. Get single product (found, not found)
3. Create product (valid, validation errors, unauthorized)

Does this match your needs? Any scenarios I missed?"
```

### 4. Implement Tests

Once plan is approved, implement following the patterns in this skill.

---

## Core Concepts

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

**Three sections:**

- **Arrange**: Set up test data, users, and request payloads. Call all setup helpers here.
- **Act**: Make the HTTP request(s) and capture the response. Never put assertions here.
- **Assert**: Verify status codes, response structure, and data integrity. All `expect()` calls go here.

**Why it matters:**

- Clear separation makes tests easy to read and debug
- Setup failures vs. assertion failures are immediately obvious
- New contributors can quickly understand test intent

### 2. Response Handling with Type Safety

Use the `readApiResponse<T>()` helper to parse and type responses:

```typescript
const body =
  await readApiResponse<ApiSuccessResponse<LoginResponseData>>(response);
```

**Benefits:**

- Type-safe response bodies with TypeScript
- Consistent JSON parsing across all tests
- Clear separation of concerns (reading vs. asserting)
- Single error point for malformed responses

**Implementation:**

```typescript
export async function readApiResponse<TResponse>(
  response: APIResponse,
): Promise<TResponse> {
  return response.json() as Promise<TResponse>;
}
```

### 3. API Client Abstraction

Encapsulate endpoint logic in dedicated client classes:

```typescript
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

**Why use client classes:**

- ✅ Reduced duplication across test files
- ✅ Centralized endpoint URLs and header management
- ✅ Easy mocking and testing of HTTP interactions
- ✅ Clear API contract documentation
- ✅ Consistent authentication handling

**Structure:**

- One client per resource (Users, Products, Traffic)
- Encapsulate URL building, headers, and auth
- Return raw `APIResponse` (let caller handle parsing)
- Use descriptive method names matching API semantics

### 4. Test Data Factories

Create reusable test data generators with partial overrides:

```typescript
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

**Key patterns:**

- Use **disposable request context** for setup that shouldn't affect test's shared `request` fixture
- Provide **partial overrides** for flexible parameterization
- Return all relevant data (user, token, ID) needed downstream
- Keep factories focused on single concerns

**Why disposable contexts matter:**

- Test's `request` stays free of auth cookies from setup
- Allows assertions on "no token provided" scenarios
- Each factory is isolated and reusable

### 5. Fixtures and Shared Setup

For complex APIs, create fixtures to manage authentication state:

```typescript
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

**Fixture advantages:**

- Manage expensive setup (login, token generation) once
- Provide consistent authentication across multiple tests
- Allow per-test teardown or state reset
- Integrate seamlessly with Playwright test lifecycle

### 6. Assertion Helpers

Create focused helpers for common assertion patterns:

```typescript
export function expectBystreLoginAuthState(body: BystreLoginResponse) {
  expect(body).toMatchObject({
    username: expect.any(String),
    email: expect.stringMatching(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    roles: expect.arrayContaining([expect.any(String)]),
    mfaRequired: expect.any(Boolean),
  });
}
```

**Helper design:**

- Encapsulate complex multi-field assertions
- Provide descriptive failure messages via `expect` descriptions
- Be reusable across multiple test files
- Document the contract being validated

**When to create helpers:**

- Assertion appears in 3+ tests
- Contract requires validating 4+ fields
- Validation logic is non-obvious

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
- ✅ Verify error is i18n compatible (use regex for flexibility)

## Patterns & Best Practices

### Pattern 1: Multi-Step Test Workflows

Chain API calls in the Arrange phase:

```typescript
test("assigns staff to field", async ({ request }) => {
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
});
```

### Pattern 2: Testing Pagination and Filtering

```typescript
test("returns paginated results with filtering", async ({ request }) => {
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
  body.items.forEach((item) => {
    expect(item).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      status: "active",
    });
  });
});
```

### Pattern 3: Testing Validation Errors

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

### Pattern 4: Checking for Credential Requirements

For tests that conditionally need credentials (e.g., Bystre API login):

```typescript
import { requiredBystreCredential } from "../support/users/bystre-users-api.helpers";

const username = requiredBystreCredential(
  config.BYSTRE_API_USERNAME,
  "BYSTRE_API_USERNAME",
);
```

This helper throws a meaningful error if the credential is missing at test time.

### Pattern 5: Testing Authentication Edge Cases

```typescript
test("rejects requests with invalid token", async ({ request }) => {
  // Arrange
  const api = new BystreUsersApiClient(request);
  const invalidToken = "invalid-jwt-token";

  // Act
  const response = await api.getMe(invalidToken);

  // Assert
  expect(response.status()).toBe(401);
});

test("rejects requests without token", async ({ request }) => {
  // Arrange
  const api = new BystreUsersApiClient(request);

  // Act
  const response = await request.get(`${ApiUrls.base}/users/me`);

  // Assert
  expect(response.status()).toBe(401);
});
```

## File Organization

Organize API tests and support code by feature or endpoint:

```
tests/3_api_tests/
├── api-test-helpers.ts              # Shared helpers
├── login.api.spec.ts                # Authentication tests
├── fields-staff-animals.api.spec.ts
└── financial-marketplace.api.spec.ts

tests/4_byst.re_api_tests/
├── support/
│   ├── shared/
│   │   └── bystre-api.assertions.ts
│   ├── users/
│   │   ├── bystre-users-api.client.ts
│   │   ├── bystre-users-api.fixtures.ts
│   │   ├── bystre-users-api.helpers.ts
│   │   └── bystre-users-api.models.ts
│   └── traffic/
│       └── bystre-traffic-api.client.ts
├── users/
│   ├── bystre-login.api.spec.ts
│   ├── bystre-me.api.spec.ts
│   └── post-users-refresh.api.spec.ts
├── traffic/
│   ├── get-traffic-info.api.spec.ts
│   └── get-traffic-logs.api.spec.ts
└── products/
    ├── get-products.api.spec.ts
    └── get-products-by-id.api.spec.ts
```

**Organization rules:**

- Spec files: `<endpoint-or-feature>.api.spec.ts`
- Support files organize by: clients, helpers, fixtures, models, assertions
- Share helpers and models across related endpoint specs
- Keep API clients focused on a single resource area

## Common Pitfalls

❌ **Don't:**

- Use `page` (browser automation) for API tests — use `request` fixture only
- Put assertions in page objects or helpers — keep them in test files
- Mix business logic with test setup — use factories and fixtures
- Hardcode credentials in tests — always use config or environment variables
- Create tests without Arrange/Act/Assert sections marked with comments
- Skip or ignore failing API tests — fix them promptly
- Create custom request helpers that duplicate Playwright's built-in methods
- Parse response manually — always use `readApiResponse<T>()`
- Store tokens or auth state across tests — create fresh state per test

## References

- [Playwright API Testing Documentation](https://playwright.dev/docs/api-testing)
- [HTTP Status Codes](https://httpwg.org/specs/rfc9110.html#status.codes)
- [REST API Best Practices](https://restfulapi.net/)
