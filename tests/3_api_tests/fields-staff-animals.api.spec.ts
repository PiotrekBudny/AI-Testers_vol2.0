import { expect, test } from "@playwright/test";

import type {
  ApiErrorResponse,
  ApiSuccessResponse,
} from "../../src/api/types/common";
import type {
  Animal,
  AnimalTypesResponse,
  Assignment,
  AssignmentRemovedResponse,
  DeleteMessageData,
  DistrictLookup,
  DistrictsSummary,
  Field,
  FieldsMap,
  MapInfo,
  Staff,
} from "../../src/api/types/farm";
import { ApiUrls } from "../../src/api/urls";
import {
  createTestAnimal,
  VALID_ANIMAL_TYPES,
} from "../../src/test-data/animals";
import {
  createAssignment,
  createOwnedAnimal,
  createOwnedField,
  createOwnedStaff,
  readApiResponse,
  registerFreshUser,
} from "./api-test-helpers";

test(
  "GET /fields returns fields scoped to the authenticated caller",
  { tag: ["@farm", "@smoke"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();

    // Act
    const response = await request.get(ApiUrls.fields, { headers: { token } });
    const body = await readApiResponse<ApiSuccessResponse<Field[]>>(response);

    // Assert
    expect(
      response.status(),
      "Listing fields for a brand-new user should return HTTP 200",
    ).toBe(200);
    expect(body.success, "Listing fields should return success: true").toBe(
      true,
    );
    expect(body.data, "A brand-new user should have no fields yet").toEqual([]);
  },
);

test(
  "POST /fields creates a field owned by the caller",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token, userId } = await registerFreshUser();
    const payload = { name: "North Field", district: "Mazovia", area: 12.5 };

    // Act
    const response = await request.post(ApiUrls.fields, {
      headers: { token },
      data: payload,
    });
    const body = await readApiResponse<ApiSuccessResponse<Field>>(response);

    // Assert
    expect(
      response.status(),
      "Creating a field with valid data should return HTTP 201",
    ).toBe(201);
    expect(body.data.id, "Created field should have a generated id").toEqual(
      expect.any(Number),
    );
    expect(
      body.data.userId,
      "Created field should be owned by the caller",
    ).toBe(userId);
    expect(
      body.data.name,
      "Created field should echo back the submitted name",
    ).toBe(payload.name);
    expect(
      body.data.district,
      "Created field should echo back the submitted district",
    ).toBe(payload.district);
    expect(
      body.data.area,
      "Created field should echo back the submitted area",
    ).toBe(payload.area);
  },
);

test(
  "POST /fields is created even when name, district, and area are omitted",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token, userId } = await registerFreshUser();

    // Act
    const response = await request.post(ApiUrls.fields, {
      headers: { token },
      data: {},
    });
    const body = await readApiResponse<ApiSuccessResponse<Field>>(response);

    // Assert
    expect(
      response.status(),
      "The Field schema declares no required array, so an empty payload should still return HTTP 201",
    ).toBe(201);
    expect(
      body.data.userId,
      "Field created without a body should still be owned by the caller",
    ).toBe(userId);
    expect(
      body.data.name,
      "Field created without a name should not have one set",
    ).toBeUndefined();
  },
);

test(
  "PUT /fields/{id} updates a field owned by the caller",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();
    const field = await createOwnedField(request, token);
    const update = { name: "Updated Field", district: "Podlasie", area: 30 };

    // Act
    const response = await request.put(ApiUrls.fieldById(field.id), {
      headers: { token },
      data: update,
    });
    const body = await readApiResponse<ApiSuccessResponse<Field>>(response);

    // Assert
    expect(
      response.status(),
      "Updating an owned field should return HTTP 200",
    ).toBe(200);
    expect(
      body.data.id,
      "Updated field response should reference the same field id",
    ).toBe(field.id);
    expect(body.data.name, "Updated field should reflect the new name").toBe(
      update.name,
    );
    expect(
      body.data.district,
      "Updated field should reflect the new district",
    ).toBe(update.district);
    expect(body.data.area, "Updated field should reflect the new area").toBe(
      update.area,
    );
  },
);

test(
  "PUT /fields/{id} fails for a non-existent field id",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();

    // Act
    const response = await request.put(ApiUrls.fieldById(999_999), {
      headers: { token },
      data: { name: "X", district: "Y", area: 1 },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Updating a non-existent field should return HTTP 404",
    ).toBe(404);
    expect(
      body.success,
      "Updating a non-existent field should return success: false",
    ).toBe(false);
    expect(
      body.error,
      "Updating a non-existent field should explain it was not found",
    ).toBe("Not found");
  },
);

test(
  "PUT /fields/{id} fails when the field is owned by a different user",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const owner = await registerFreshUser();
    const otherUser = await registerFreshUser();
    const field = await createOwnedField(request, owner.token);

    // Act
    const response = await request.put(ApiUrls.fieldById(field.id), {
      headers: { token: otherUser.token },
      data: { name: "Hijacked", district: "Y", area: 1 },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Updating another user's field is scoped to the caller and returns HTTP 404, not 403",
    ).toBe(404);
    expect(
      body.success,
      "Updating another user's field should return success: false",
    ).toBe(false);
  },
);

test(
  "DELETE /fields/{id} removes a field owned by the caller",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();
    const field = await createOwnedField(request, token);

    // Act
    const response = await request.delete(ApiUrls.fieldById(field.id), {
      headers: { token },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<DeleteMessageData>>(response);

    // Assert
    expect(
      response.status(),
      "Deleting an owned field should return HTTP 200",
    ).toBe(200);
    expect(body.success, "Deleting a field should return success: true").toBe(
      true,
    );
  },
);

test(
  "DELETE /fields/{id} returns success again when deleting the same field twice",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();
    const field = await createOwnedField(request, token);
    await request.delete(ApiUrls.fieldById(field.id), { headers: { token } });

    // Act
    const response = await request.delete(ApiUrls.fieldById(field.id), {
      headers: { token },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<DeleteMessageData>>(response);

    // Assert
    expect(
      response.status(),
      "Deleting an already-deleted field is idempotent and still returns HTTP 200 rather than 404",
    ).toBe(200);
    expect(
      body.success,
      "Repeated deletion should still return success: true",
    ).toBe(true);
  },
);

test(
  "POST /fields/districts summarizes districts for the caller's fields",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();
    await createOwnedField(request, token);

    // Act
    const response = await request.post(ApiUrls.fieldsDistricts, {
      headers: { token },
      data: {},
    });
    const body =
      await readApiResponse<ApiSuccessResponse<DistrictsSummary>>(response);

    // Assert
    expect(
      response.status(),
      "Listing districts for the caller's fields should return HTTP 200",
    ).toBe(200);
    expect(
      body.data["Mazovia"],
      "The caller's field district should appear in the summary",
    ).toBeDefined();
    expect(
      body.data["Mazovia"].fieldsCount,
      "The Mazovia district should count exactly the one field the caller created",
    ).toBe(1);
  },
);

test(
  "POST /fields/districts/{id} returns a summary for an owned field id",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();
    const field = await createOwnedField(request, token);

    // Act
    const response = await request.post(ApiUrls.fieldsDistrictsById(field.id), {
      headers: { token },
      data: {},
    });
    const body =
      await readApiResponse<ApiSuccessResponse<DistrictLookup>>(response);

    // Assert
    expect(
      response.status(),
      "Looking up districts for an owned field id should return HTTP 200",
    ).toBe(200);
    expect(
      body.success,
      "Looking up districts for an owned field should return success: true",
    ).toBe(true);
  },
);

test(
  "POST /fields/districts/{id} returns HTTP 200 even for a non-existent field id",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();

    // Act
    const response = await request.post(ApiUrls.fieldsDistrictsById(999_999), {
      headers: { token },
      data: {},
    });
    const body =
      await readApiResponse<ApiSuccessResponse<DistrictLookup>>(response);

    // Assert
    expect(
      response.status(),
      "This endpoint does not validate that the field id exists, so a non-existent id still returns HTTP 200",
    ).toBe(200);
    expect(
      body.data.fieldsCount,
      "A non-existent field id should be reported as having zero fields",
    ).toBe(0);
  },
);

test(
  "GET /staff returns staff scoped to the authenticated caller",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();

    // Act
    const response = await request.get(ApiUrls.staff, { headers: { token } });
    const body = await readApiResponse<ApiSuccessResponse<Staff[]>>(response);

    // Assert
    expect(
      response.status(),
      "Listing staff for a brand-new user should return HTTP 200",
    ).toBe(200);
    expect(body.data, "A brand-new user should have no staff yet").toEqual([]);
  },
);

test(
  "POST /staff creates a staff member owned by the caller",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token, userId } = await registerFreshUser();
    const payload = { name: "John", surname: "Doe", age: 30 };

    // Act
    const response = await request.post(ApiUrls.staff, {
      headers: { token },
      data: payload,
    });
    const body = await readApiResponse<ApiSuccessResponse<Staff>>(response);

    // Assert
    expect(
      response.status(),
      "Creating a staff member with valid data should return HTTP 201",
    ).toBe(201);
    expect(
      body.data.userId,
      "Created staff member should be owned by the caller",
    ).toBe(userId);
    expect(
      body.data.name,
      "Created staff member should echo back the submitted name",
    ).toBe(payload.name);
    expect(
      body.data.surname,
      "Created staff member should echo back the submitted surname",
    ).toBe(payload.surname);
    expect(
      body.data.age,
      "Created staff member should echo back the submitted age",
    ).toBe(payload.age);
  },
);

test(
  "PUT /staff/{id} updates a staff member owned by the caller",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();
    const staff = await createOwnedStaff(request, token);
    const update = { name: "Jane", surname: "Doe", age: 31 };

    // Act
    const response = await request.put(ApiUrls.staffById(staff.id), {
      headers: { token },
      data: update,
    });
    const body = await readApiResponse<ApiSuccessResponse<Staff>>(response);

    // Assert
    expect(
      response.status(),
      "Updating an owned staff member should return HTTP 200",
    ).toBe(200);
    expect(
      body.data.name,
      "Updated staff member should reflect the new name",
    ).toBe(update.name);
    expect(
      body.data.age,
      "Updated staff member should reflect the new age",
    ).toBe(update.age);
  },
);

test(
  "PUT /staff/{id} fails for a non-existent staff id",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();

    // Act
    const response = await request.put(ApiUrls.staffById(999_999), {
      headers: { token },
      data: { name: "X", surname: "Y", age: 1 },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Updating a non-existent staff member should return HTTP 404",
    ).toBe(404);
    expect(
      body.error,
      "Updating a non-existent staff member should explain it was not found",
    ).toBe("Not found");
  },
);

test(
  "DELETE /staff/{id} removes a staff member owned by the caller",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();
    const staff = await createOwnedStaff(request, token);

    // Act
    const response = await request.delete(ApiUrls.staffById(staff.id), {
      headers: { token },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<DeleteMessageData>>(response);

    // Assert
    expect(
      response.status(),
      "Deleting an owned staff member should return HTTP 200",
    ).toBe(200);
    expect(
      body.success,
      "Deleting a staff member should return success: true",
    ).toBe(true);
  },
);

test(
  "DELETE /staff/{id} succeeds even when called by a different user",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const owner = await registerFreshUser();
    const otherUser = await registerFreshUser();
    const staff = await createOwnedStaff(request, owner.token);

    // Act
    const response = await request.delete(ApiUrls.staffById(staff.id), {
      headers: { token: otherUser.token },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<DeleteMessageData>>(response);

    // Assert
    expect(
      response.status(),
      "The staff delete endpoint does not scope deletion to the caller, so a different authenticated user still gets HTTP 200",
    ).toBe(200);
    expect(
      body.success,
      "Cross-user staff deletion should return success: true",
    ).toBe(true);
  },
);

test(
  "POST /fields/assign creates an assignment linking an owned field and staff member",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token, userId } = await registerFreshUser();
    const field = await createOwnedField(request, token);
    const staff = await createOwnedStaff(request, token);

    // Act
    const response = await request.post(ApiUrls.fieldsAssign, {
      headers: { token },
      data: { fieldId: field.id, staffId: staff.id },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<Assignment>>(response);

    // Assert
    expect(
      response.status(),
      "Assigning an owned staff member to an owned field should return HTTP 201",
    ).toBe(201);
    expect(
      body.data.fieldId,
      "Created assignment should reference the requested field",
    ).toBe(field.id);
    expect(
      body.data.staffId,
      "Created assignment should reference the requested staff member",
    ).toBe(staff.id);
    expect(
      body.data.userId,
      "Created assignment should be owned by the caller",
    ).toBe(userId);
  },
);

test(
  "POST /fields/assign allows creating a duplicate assignment for the same field and staff",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();
    const field = await createOwnedField(request, token);
    const staff = await createOwnedStaff(request, token);
    await createAssignment(request, token, field.id, staff.id);

    // Act
    const response = await request.post(ApiUrls.fieldsAssign, {
      headers: { token },
      data: { fieldId: field.id, staffId: staff.id },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<Assignment>>(response);

    // Assert
    expect(
      response.status(),
      "The API does not reject duplicate field/staff assignments, so a second identical assignment still returns HTTP 201",
    ).toBe(201);
    expect(
      body.success,
      "Duplicate assignment creation should return success: true",
    ).toBe(true);
  },
);

test(
  "GET /fields/assign returns assignments scoped to the caller",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();
    const field = await createOwnedField(request, token);
    const staff = await createOwnedStaff(request, token);
    const assignment = await createAssignment(
      request,
      token,
      field.id,
      staff.id,
    );

    // Act
    const response = await request.get(ApiUrls.fieldsAssign, {
      headers: { token },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<Assignment[]>>(response);

    // Assert
    expect(
      response.status(),
      "Listing assignments for the caller should return HTTP 200",
    ).toBe(200);
    expect(
      body.data.map((entry) => entry.id),
      "The caller's assignment list should include the newly created assignment",
    ).toContain(assignment.id);
  },
);

test(
  "GET /assignments is not an implemented route despite being a documented duplicate of GET /fields/assign",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();

    // Act
    const response = await request.get(ApiUrls.assignments, {
      headers: { token },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Unlike GET /fields/assign, GET /assignments is not mounted on the running server and returns HTTP 404",
    ).toBe(404);
    expect(
      body.error,
      "The unmounted route should report that the API endpoint was not found",
    ).toBe("API endpoint not found");
  },
);

test(
  "DELETE /assignments/{id} is not an implemented route",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();
    const field = await createOwnedField(request, token);
    const staff = await createOwnedStaff(request, token);
    const assignment = await createAssignment(
      request,
      token,
      field.id,
      staff.id,
    );

    // Act
    const response = await request.delete(
      ApiUrls.assignmentById(assignment.id),
      { headers: { token } },
    );
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "DELETE /assignments/{id} is not mounted on the running server and returns HTTP 404, unlike DELETE /fields/assign/{id}",
    ).toBe(404);
    expect(
      body.error,
      "The unmounted route should report that the API endpoint was not found",
    ).toBe("API endpoint not found");
  },
);

test(
  "DELETE /fields/assign/{id} removes an assignment via the alternate route",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();
    const field = await createOwnedField(request, token);
    const staff = await createOwnedStaff(request, token);
    const assignment = await createAssignment(
      request,
      token,
      field.id,
      staff.id,
    );

    // Act
    const response = await request.delete(
      ApiUrls.fieldsAssignById(assignment.id),
      { headers: { token } },
    );
    const body = await readApiResponse<AssignmentRemovedResponse>(response);

    // Assert
    expect(
      response.status(),
      "Deleting an assignment via the alternate route should return HTTP 200",
    ).toBe(200);
    expect(
      body.success,
      "Deleting an assignment via the alternate route should return success: true",
    ).toBe(true);
  },
);

test(
  "GET /animals returns animals scoped to the authenticated caller",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();

    // Act
    const response = await request.get(ApiUrls.animals, {
      headers: { token },
    });
    const body = await readApiResponse<ApiSuccessResponse<Animal[]>>(response);

    // Assert
    expect(
      response.status(),
      "Listing animals for a brand-new user should return HTTP 200",
    ).toBe(200);
    expect(body.data, "A brand-new user should have no animals yet").toEqual(
      [],
    );
  },
);

test(
  "POST /animals creates an animal herd owned by the caller",
  { tag: ["@farm", "@smoke"] },
  async ({ request }) => {
    // Arrange
    const { token, userId } = await registerFreshUser();
    const animal = createTestAnimal();

    // Act
    const response = await request.post(ApiUrls.animals, {
      headers: { token },
      data: { type: animal.type, amount: animal.amount },
    });
    const body = await readApiResponse<ApiSuccessResponse<Animal>>(response);

    // Assert
    expect(
      response.status(),
      "Creating an animal with a valid type and amount should return HTTP 201",
    ).toBe(201);
    expect(
      body.data.userId,
      "Created animal should be owned by the caller",
    ).toBe(userId);
    expect(
      body.data.type,
      "Created animal should echo back the submitted type",
    ).toBe(animal.type);
    expect(
      body.data.amount,
      "Created animal should echo back the submitted amount",
    ).toBe(animal.amount);
  },
);

test(
  "POST /animals fails when type is missing",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();

    // Act
    const response = await request.post(ApiUrls.animals, {
      headers: { token },
      data: { amount: 5 },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Creating an animal without a type should return HTTP 400, matching AnimalCreate.required",
    ).toBe(400);
    expect(
      body.error,
      "Missing type should explain which animal types are allowed",
    ).toContain("Invalid animal type");
  },
);

test(
  "POST /animals fails when amount is missing",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();

    // Act
    const response = await request.post(ApiUrls.animals, {
      headers: { token },
      data: { type: "cow" },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Creating an animal without an amount should return HTTP 400, matching AnimalCreate.required",
    ).toBe(400);
    expect(
      body.error,
      "Missing amount should explain that a positive amount is required",
    ).toBe("Amount must be a positive number.");
  },
);

test(
  "POST /animals fails when amount is zero",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();

    // Act
    const response = await request.post(ApiUrls.animals, {
      headers: { token },
      data: { type: "cow", amount: 0 },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Creating an animal with amount 0 should return HTTP 400, per the minimum: 1 constraint",
    ).toBe(400);
    expect(
      body.error,
      "Zero amount should explain that a positive amount is required",
    ).toBe("Amount must be a positive number.");
  },
);

test(
  "POST /animals fails when amount is negative",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();

    // Act
    const response = await request.post(ApiUrls.animals, {
      headers: { token },
      data: { type: "cow", amount: -5 },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Creating an animal with a negative amount should return HTTP 400, per the minimum: 1 constraint",
    ).toBe(400);
    expect(
      body.error,
      "Negative amount should explain that a positive amount is required",
    ).toBe("Amount must be a positive number.");
  },
);

test(
  "PUT /animals/{id} updates an animal owned by the caller",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();
    const createdAnimal = await createOwnedAnimal(request, token);

    // Act
    const response = await request.put(ApiUrls.animalById(createdAnimal.id), {
      headers: { token },
      data: { type: "cow", amount: 10 },
    });
    const body = await readApiResponse<ApiSuccessResponse<Animal>>(response);

    // Assert
    expect(
      response.status(),
      "Updating an owned animal should return HTTP 200",
    ).toBe(200);
    expect(
      body.data.amount,
      "Updated animal should reflect the new amount",
    ).toBe(10);
  },
);

test(
  "PUT /animals/{id} fails for a non-existent animal id",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();

    // Act
    const response = await request.put(ApiUrls.animalById(999_999), {
      headers: { token },
      data: { type: "cow", amount: 10 },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Updating a non-existent animal should return HTTP 404, as documented in the schema",
    ).toBe(404);
    expect(
      body.error,
      "Updating a non-existent animal should explain it was not found",
    ).toBe("Animal not found");
  },
);

test(
  "DELETE /animals/{id} removes an animal owned by the caller",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();
    const createdAnimal = await createOwnedAnimal(request, token);

    // Act
    const response = await request.delete(
      ApiUrls.animalById(createdAnimal.id),
      { headers: { token } },
    );
    const body =
      await readApiResponse<ApiSuccessResponse<DeleteMessageData>>(response);

    // Assert
    expect(
      response.status(),
      "Deleting an owned animal should return HTTP 200",
    ).toBe(200);
    expect(body.success, "Deleting an animal should return success: true").toBe(
      true,
    );
  },
);

test(
  "GET /animals/types returns the catalog of animal types without requiring a token",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange

    // Act
    const response = await request.get(ApiUrls.animalTypes);
    const body = await readApiResponse<AnimalTypesResponse>(response);
    const types = Object.values(body.data);

    // Assert
    expect(
      response.status(),
      "GET /animals/types should return HTTP 200 even though no token header is sent",
    ).toBe(200);
    expect(
      types.length,
      "The animal type catalog should not be empty",
    ).toBeGreaterThan(0);
    for (const animalType of types) {
      expect(animalType.key, "Every animal type should declare a key").toEqual(
        expect.any(String),
      );
      expect(
        animalType.fullName,
        "Every animal type should declare a fullName",
      ).toEqual(expect.any(String));
      expect(
        animalType.description,
        "Every animal type should declare a description",
      ).toEqual(expect.any(String));
      expect(
        animalType.icon,
        "Every animal type should declare an icon",
      ).toEqual(expect.any(String));
    }
    for (const validType of VALID_ANIMAL_TYPES) {
      expect(
        body.data[validType],
        `The known valid type "${validType}" used by createTestAnimal() should be present in the catalog`,
      ).toBeDefined();
    }
  },
);

test(
  "GET /map returns map API info for an authenticated caller",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();

    // Act
    const response = await request.get(ApiUrls.map, { headers: { token } });
    const body = await readApiResponse<MapInfo>(response);

    // Assert
    expect(
      response.status(),
      "GET /map with a valid token should return HTTP 200",
    ).toBe(200);
    expect(
      body.endpoints,
      "The map API info should list its available endpoints",
    ).toEqual(expect.any(Array));
  },
);

test(
  "GET /map fails without a token",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange

    // Act
    const response = await request.get(ApiUrls.map);
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "GET /map without a token should return HTTP 401",
    ).toBe(401);
    expect(
      body.error,
      "Missing token should explain that an access token is required",
    ).toBe("Access token required");
  },
);

test(
  "GET /map/fieldsmap returns a GeoJSON feature collection for an authenticated caller",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();

    // Act
    const response = await request.get(ApiUrls.mapFieldsmap, {
      headers: { token },
    });
    const body = await readApiResponse<FieldsMap>(response);

    // Assert
    expect(
      response.status(),
      "GET /map/fieldsmap with a valid token should return HTTP 200",
    ).toBe(200);
    expect(
      body.type,
      "The response should be a GeoJSON FeatureCollection",
    ).toBe("FeatureCollection");
    expect(
      body.features,
      "The response should include a features array",
    ).toEqual(expect.any(Array));
  },
);

test(
  "GET /map/districts returns an array of district names for an authenticated caller",
  { tag: ["@farm"] },
  async ({ request }) => {
    // Arrange
    const { token } = await registerFreshUser();

    // Act
    const response = await request.get(ApiUrls.mapDistricts, {
      headers: { token },
    });
    const body = await readApiResponse<string[]>(response);

    // Assert
    expect(
      response.status(),
      "GET /map/districts with a valid token should return HTTP 200",
    ).toBe(200);
    expect(
      body.length,
      "The districts list should not be empty",
    ).toBeGreaterThan(0);
    expect(body[0], "Each district entry should be a string").toEqual(
      expect.any(String),
    );
  },
);
