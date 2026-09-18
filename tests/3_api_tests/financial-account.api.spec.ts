import { expect, test } from "@playwright/test";

import type { ApiSuccessResponse } from "../../src/api/types/common";
import type {
  FinancialAccountResponseData,
  TransactionCreateResponseData,
  TransferResponseData,
} from "../../src/api/types/financial";
import { ApiUrls } from "../../src/api/urls";
import {
  createFundedUser,
  readApiResponse,
  registerFreshUser,
} from "./api-test-helpers";

test.describe("Financial Account Management", () => {
  test(
    "GET /financial/account returns account info for authenticated user",
    { tag: ["@finance", "@smoke"] },
    async ({ request }) => {
      // Arrange
      const { token } = await registerFreshUser();

      // Act
      const response = await request.get(ApiUrls.financialAccount, {
        headers: { token },
      });
      const body =
        await readApiResponse<ApiSuccessResponse<FinancialAccountResponseData>>(
          response,
        );

      // Assert
      expect(
        response.status(),
        "Financial account retrieval should return HTTP 200",
      ).toBe(200);
      expect(
        body.success,
        "Financial account retrieval should return success: true",
      ).toBe(true);
      expect(body.data.account).toHaveProperty("id");
      expect(body.data.account).toHaveProperty("userId");
      expect(body.data.account).toHaveProperty("balance");
      expect(body.data.account).toHaveProperty("currency");
      expect(body.data.account).toHaveProperty("createdAt");
      expect(body.data.account).toHaveProperty("updatedAt");
    },
  );

  test(
    "GET /financial/account without token returns 401",
    { tag: ["@finance", "@auth"] },
    async ({ request }) => {
      // Act
      const response = await request.get(ApiUrls.financialAccount);

      // Assert
      expect(
        response.status(),
        "Financial account retrieval without token should return HTTP 401",
      ).toBe(401);
    },
  );

  test(
    "POST /financial/transactions creates income transaction",
    { tag: ["@finance"] },
    async ({ request }) => {
      // Arrange
      const { token } = await registerFreshUser();

      // Act
      const response = await request.post(ApiUrls.financialTransactions, {
        headers: { token },
        data: {
          type: "income",
          amount: 50.0,
          description: "Test income",
          category: "general",
          cardNumber: "4242424242424242",
          cvv: "123",
        },
      });
      const body =
        await readApiResponse<
          ApiSuccessResponse<TransactionCreateResponseData>
        >(response);

      // Assert
      expect(
        response.status(),
        "Income transaction creation should return HTTP 201",
      ).toBe(201);
      expect(
        body.success,
        "Income transaction creation should return success: true",
      ).toBe(true);
      expect(body.data.transaction).toHaveProperty("id");
      expect(body.data.transaction.type).toBe("income");
      expect(body.data.transaction.amount).toBe(50.0);
      expect(body.data.transaction.description).toBe("Test income");
    },
  );

  test(
    "POST /financial/transactions creates expense transaction",
    { tag: ["@finance"] },
    async ({ request }) => {
      // Arrange
      const { token } = await createFundedUser(request, 100.0);

      // Act
      const response = await request.post(ApiUrls.financialTransactions, {
        headers: { token },
        data: {
          type: "expense",
          amount: 30.0,
          description: "Test expense",
          category: "general",
        },
      });
      const body =
        await readApiResponse<
          ApiSuccessResponse<TransactionCreateResponseData>
        >(response);

      // Assert
      expect(
        response.status(),
        "Expense transaction creation should return HTTP 201",
      ).toBe(201);
      expect(
        body.success,
        "Expense transaction creation should return success: true",
      ).toBe(true);
      expect(body.data.transaction).toHaveProperty("id");
      expect(body.data.transaction.type).toBe("expense");
      expect(body.data.transaction.amount).toBe(30.0);
      expect(body.data.transaction.description).toBe("Test expense");
    },
  );

  test(
    "POST /financial/transactions with invalid amount returns 400",
    { tag: ["@finance"] },
    async ({ request }) => {
      // Arrange
      const { token } = await registerFreshUser();

      // Act
      const response = await request.post(ApiUrls.financialTransactions, {
        headers: { token },
        data: {
          type: "income",
          amount: 0,
          description: "Test income",
          category: "general",
          cardNumber: "4242424242424242",
          cvv: "123",
        },
      });

      // Assert
      expect(
        response.status(),
        "Invalid transaction amount should return HTTP 400",
      ).toBe(400);
    },
  );

  test(
    "POST /financial/transfer transfers funds between users",
    { tag: ["@finance", "@smoke"] },
    async ({ request }) => {
      test.setTimeout(20_000);

      // Arrange
      const [sender, recipient] = await Promise.all([
        createFundedUser(request, 100.0),
        registerFreshUser(),
      ]);

      // Act
      const response = await request.post(ApiUrls.financialTransfer, {
        headers: { token: sender.token },
        data: {
          toUserId: recipient.userId,
          amount: 25.0,
          description: "Test transfer",
        },
      });
      const body =
        await readApiResponse<ApiSuccessResponse<TransferResponseData>>(
          response,
        );

      // Assert
      expect(response.status(), "Fund transfer should return HTTP 200").toBe(
        200,
      );
      expect(body.success, "Fund transfer should return success: true").toBe(
        true,
      );
      expect(body.data.amount).toBe(25.0);
    },
  );

  test(
    "POST /financial/transfer with insufficient funds returns 400",
    { tag: ["@finance", "@smoke"] },
    async ({ request }) => {
      // Arrange
      const sender = await registerFreshUser();
      const recipient = await registerFreshUser();

      // Act
      const response = await request.post(ApiUrls.financialTransfer, {
        headers: { token: sender.token },
        data: {
          toUserId: recipient.userId,
          amount: 10.0,
          description: "Test transfer",
        },
      });

      // Assert
      expect(
        response.status(),
        "Insufficient funds transfer should return HTTP 400",
      ).toBe(400);
    },
  );
});
