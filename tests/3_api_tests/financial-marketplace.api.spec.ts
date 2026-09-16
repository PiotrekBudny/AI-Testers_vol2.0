import { expect, test } from "@playwright/test";

import type {
  ApiErrorResponse,
  ApiSuccessResponse,
} from "../../src/api/types/common";
import type {
  FinancialAccountResponseData,
  FinancialReportResponseData,
  FinancialStatsResponseData,
  TransactionCreateResponseData,
  TransactionRecord,
  TransactionsListResponseData,
  TransferResponseData,
} from "../../src/api/types/financial";
import type {
  FieldRecord,
  MarketplaceBuyResponseData,
  MarketplaceOfferCreateResponseData,
  MarketplaceOffersListResponseData,
  MarketplaceStatsResponseData,
  MarketplaceTransactionsListResponseData,
} from "../../src/api/types/marketplace";
import { ApiUrls } from "../../src/api/urls";
import {
  containsKey,
  createFieldForUser,
  createFundedUser,
  fundUserAccount,
  readApiResponse,
  registerFreshUser,
} from "./api-test-helpers";

test(
  "getting the financial account succeeds with a valid token",
  { tag: ["@finance"] },
  async ({ request }) => {
    // Arrange
    const user = await registerFreshUser();

    // Act
    const response = await request.get(ApiUrls.financialAccount, {
      headers: { token: user.token },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<FinancialAccountResponseData>>(
        response,
      );

    // Assert
    expect(
      response.status(),
      "Valid token should return HTTP 200 for the financial account",
    ).toBe(200);
    expect(
      body.data.account.currency,
      "A fresh account should use the ROL currency",
    ).toBe("ROL");
    expect(
      body.data.account.balance,
      "A brand-new account should start with a zero balance",
    ).toBe(0);
  },
);

test(
  "getting the financial account fails without a token",
  { tag: ["@finance"] },
  async ({ request }) => {
    // Act
    const response = await request.get(ApiUrls.financialAccount);
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Missing token should return HTTP 401 for the financial account",
    ).toBe(401);
    expect(body.success, "Missing token should return success: false").toBe(
      false,
    );
  },
);

test(
  "listing transactions with no query params applies default pagination",
  { tag: ["@finance"] },
  async ({ request }) => {
    // Arrange
    const user = await registerFreshUser();
    await fundUserAccount(request, user.token, 50);

    // Act
    const response = await request.get(ApiUrls.financialTransactions, {
      headers: { token: user.token },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<TransactionsListResponseData>>(
        response,
      );

    // Assert
    expect(
      response.status(),
      "Listing transactions with no params should return HTTP 200",
    ).toBe(200);
    expect(body.data.limit, "Default limit should be 50").toBe(50);
    expect(body.data.offset, "Default offset should be 0").toBe(0);
  },
);

test(
  "listing transactions respects the limit=1 boundary",
  { tag: ["@finance"] },
  async ({ request }) => {
    // Arrange
    const user = await registerFreshUser();
    await fundUserAccount(request, user.token, 50);
    await request.post(ApiUrls.financialTransactions, {
      headers: { token: user.token },
      data: { type: "expense", amount: 5, description: "Second transaction" },
    });

    // Act
    const response = await request.get(ApiUrls.financialTransactions, {
      headers: { token: user.token },
      params: { limit: 1 },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<TransactionsListResponseData>>(
        response,
      );

    // Assert
    expect(response.status(), "limit=1 should return HTTP 200").toBe(200);
    expect(
      body.data.transactions,
      "limit=1 should return at most one transaction",
    ).toHaveLength(1);
    expect(
      body.data.hasMore,
      "limit=1 with more records should set hasMore: true",
    ).toBe(true);
  },
);

test(
  "listing transactions respects the limit=100 boundary",
  { tag: ["@finance"] },
  async ({ request }) => {
    // Arrange
    const user = await registerFreshUser();
    await fundUserAccount(request, user.token, 50);

    // Act
    const response = await request.get(ApiUrls.financialTransactions, {
      headers: { token: user.token },
      params: { limit: 100 },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<TransactionsListResponseData>>(
        response,
      );

    // Assert
    expect(response.status(), "limit=100 should return HTTP 200").toBe(200);
    expect(
      body.data.limit,
      "Requested limit of 100 should be echoed back",
    ).toBe(100);
  },
);

test(
  "listing transactions filters by type=income",
  { tag: ["@finance"] },
  async ({ request }) => {
    // Arrange
    const user = await registerFreshUser();
    await fundUserAccount(request, user.token, 50);
    await request.post(ApiUrls.financialTransactions, {
      headers: { token: user.token },
      data: { type: "expense", amount: 5, description: "An expense entry" },
    });

    // Act
    const response = await request.get(ApiUrls.financialTransactions, {
      headers: { token: user.token },
      params: { type: "income" },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<TransactionsListResponseData>>(
        response,
      );

    // Assert
    expect(response.status(), "type=income should return HTTP 200").toBe(200);
    expect(
      body.data.transactions.every(
        (transaction) => transaction.type === "income",
      ),
      "All returned transactions should have type income",
    ).toBe(true);
  },
);

test(
  "listing transactions filters by type=expense",
  { tag: ["@finance"] },
  async ({ request }) => {
    // Arrange
    const user = await registerFreshUser();
    await fundUserAccount(request, user.token, 50);
    await request.post(ApiUrls.financialTransactions, {
      headers: { token: user.token },
      data: { type: "expense", amount: 5, description: "An expense entry" },
    });

    // Act
    const response = await request.get(ApiUrls.financialTransactions, {
      headers: { token: user.token },
      params: { type: "expense" },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<TransactionsListResponseData>>(
        response,
      );

    // Assert
    expect(response.status(), "type=expense should return HTTP 200").toBe(200);
    expect(
      body.data.transactions.every(
        (transaction) => transaction.type === "expense",
      ),
      "All returned transactions should have type expense",
    ).toBe(true);
  },
);

test(
  "listing transactions fails without a token",
  { tag: ["@finance"] },
  async ({ request }) => {
    // Act
    const response = await request.get(ApiUrls.financialTransactions);
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Missing token should return HTTP 401 when listing transactions",
    ).toBe(401);
    expect(body.success, "Missing token should return success: false").toBe(
      false,
    );
  },
);

test(
  "creating a valid expense transaction succeeds",
  { tag: ["@finance"] },
  async ({ request }) => {
    // Arrange
    const user = await registerFreshUser();
    await fundUserAccount(request, user.token, 50);

    // Act
    const response = await request.post(ApiUrls.financialTransactions, {
      headers: { token: user.token },
      data: { type: "expense", amount: 12.5, description: "Seeds purchase" },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<TransactionCreateResponseData>>(
        response,
      );

    // Assert
    expect(
      response.status(),
      "Valid expense transaction should return HTTP 201",
    ).toBe(201);
    expect(
      body.data.transaction.type,
      "Created transaction should have type expense",
    ).toBe("expense");
    expect(
      body.data.transaction.balanceAfter,
      "Balance after an expense should decrease from the previous balance",
    ).toBe(body.data.transaction.balanceBefore - 12.5);
  },
);

test(
  "creating a valid income transaction succeeds and never exposes card data",
  { tag: ["@finance"] },
  async ({ request }) => {
    // Arrange
    const user = await registerFreshUser();

    // Act
    const response = await request.post(ApiUrls.financialTransactions, {
      headers: { token: user.token },
      data: {
        type: "income",
        amount: 99.99,
        description: "Top up",
        cardNumber: "4242424242424242",
        cvv: "123",
      },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<TransactionCreateResponseData>>(
        response,
      );

    // Assert
    expect(
      response.status(),
      "Valid income transaction should return HTTP 201",
    ).toBe(201);
    expect(
      body.data.transaction.type,
      "Created transaction should have type income",
    ).toBe("income");
    expect(
      containsKey(body, "cardNumber"),
      "Response body should never expose the write-only cardNumber field",
    ).toBe(false);
    expect(
      containsKey(body, "cvv"),
      "Response body should never expose the write-only cvv field",
    ).toBe(false);
  },
);

test(
  "creating a transaction fails when type is missing",
  { tag: ["@finance"] },
  async ({ request }) => {
    // Arrange
    const user = await registerFreshUser();

    // Act
    const response = await request.post(ApiUrls.financialTransactions, {
      headers: { token: user.token },
      data: { amount: 10, description: "No type supplied" },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(response.status(), "Missing type should return HTTP 400").toBe(400);
    expect(body.success, "Missing type should return success: false").toBe(
      false,
    );
  },
);

test(
  "creating a transaction fails when amount is zero",
  { tag: ["@finance"] },
  async ({ request }) => {
    // Arrange
    const user = await registerFreshUser();

    // Act
    const response = await request.post(ApiUrls.financialTransactions, {
      headers: { token: user.token },
      data: { type: "expense", amount: 0, description: "Zero amount" },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "amount=0 violates the 0.01 minimum and should return HTTP 400",
    ).toBe(400);
    expect(body.success, "Invalid amount should return success: false").toBe(
      false,
    );
  },
);

test(
  "creating a transaction fails when the description is too short",
  { tag: ["@finance"] },
  async ({ request }) => {
    // Arrange
    const user = await registerFreshUser();

    // Act
    const response = await request.post(ApiUrls.financialTransactions, {
      headers: { token: user.token },
      data: { type: "expense", amount: 10, description: "ab" },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Description shorter than 3 characters should return HTTP 400",
    ).toBe(400);
    expect(
      body.error,
      "Error should explain the description length requirement",
    ).toContain("3 characters");
  },
);

test(
  "creating an income transaction fails when cardNumber and cvv are missing",
  { tag: ["@finance"] },
  async ({ request }) => {
    // Arrange
    const user = await registerFreshUser();

    // Act
    const response = await request.post(ApiUrls.financialTransactions, {
      headers: { token: user.token },
      data: { type: "income", amount: 10, description: "Missing card data" },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Income transaction without cardNumber/cvv should return HTTP 400",
    ).toBe(400);
    expect(
      body.error,
      "Error should mention the missing cardNumber and cvv fields",
    ).toContain("cardNumber");
  },
);

test(
  "creating a transaction fails without a token",
  { tag: ["@finance"] },
  async ({ request }) => {
    // Act
    const response = await request.post(ApiUrls.financialTransactions, {
      data: { type: "expense", amount: 10, description: "No token supplied" },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Missing token should return HTTP 401 when creating a transaction",
    ).toBe(401);
    expect(body.success, "Missing token should return success: false").toBe(
      false,
    );
  },
);

test(
  "fetching an existing transaction by id returns that transaction",
  { tag: ["@finance"] },
  async ({ request }) => {
    // Arrange
    const user = await registerFreshUser();
    await fundUserAccount(request, user.token, 50);
    const createResponse = await request.post(ApiUrls.financialTransactions, {
      headers: { token: user.token },
      data: { type: "expense", amount: 15, description: "Fetch by id test" },
    });
    const createBody =
      await readApiResponse<ApiSuccessResponse<TransactionCreateResponseData>>(
        createResponse,
      );
    const transactionId = createBody.data.transaction.id;

    // Act
    const response = await request.get(
      ApiUrls.financialTransactionById(transactionId),
      { headers: { token: user.token } },
    );
    const body =
      await readApiResponse<ApiSuccessResponse<TransactionRecord>>(response);

    // Assert
    expect(
      response.status(),
      "Fetching an existing own transaction should return HTTP 200",
    ).toBe(200);
    expect(
      body.data.id,
      "Returned transaction should match the requested transaction id",
    ).toBe(transactionId);
  },
);

test(
  "fetching a non-existent transaction id returns 404",
  { tag: ["@finance"] },
  async ({ request }) => {
    // Arrange
    const user = await registerFreshUser();

    // Act
    const response = await request.get(
      ApiUrls.financialTransactionById(999_999_999),
      { headers: { token: user.token } },
    );
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Non-existent transaction id should return HTTP 404",
    ).toBe(404);
    expect(
      body.success,
      "Non-existent transaction should return success: false",
    ).toBe(false);
  },
);

test(
  "getting financial stats succeeds with a valid token",
  { tag: ["@finance"] },
  async ({ request }) => {
    // Arrange
    const user = await registerFreshUser();

    // Act
    const response = await request.get(ApiUrls.financialStats, {
      headers: { token: user.token },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<FinancialStatsResponseData>>(
        response,
      );

    // Assert
    expect(response.status(), "Financial stats should return HTTP 200").toBe(
      200,
    );
    expect(
      body.data.statistics.transactionCount,
      "A brand-new user should have zero recorded transactions",
    ).toBe(0);
  },
);

test(
  "financial report status matches the current financialReportsEnabled flag",
  { tag: ["@finance", "@flagged"] },
  async ({ request }) => {
    // Arrange
    const user = await registerFreshUser();
    const flagsResponse = await request.get(ApiUrls.featureFlags);
    const flagsBody =
      await readApiResponse<
        ApiSuccessResponse<{ flags: Record<string, boolean> }>
      >(flagsResponse);
    const isReportEnabled = flagsBody.data.flags.financialReportsEnabled;

    // Act
    const response = await request.get(ApiUrls.financialReport, {
      headers: { token: user.token },
    });
    const body = await readApiResponse<
      ApiSuccessResponse<FinancialReportResponseData> | ApiErrorResponse
    >(response);

    // Assert
    const expectedStatus = [404, 200][Number(isReportEnabled)];
    expect(
      response.status(),
      `financialReportsEnabled=${String(isReportEnabled)} should return HTTP ${expectedStatus}`,
    ).toBe(expectedStatus);
    expect(
      body.success,
      "Response success flag should match the report status code",
    ).toBe(isReportEnabled);
  },
);

test(
  "financial report fails without a token",
  { tag: ["@finance", "@flagged"] },
  async ({ request }) => {
    // Act
    const response = await request.get(ApiUrls.financialReport);
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Missing token should return HTTP 401 for the financial report",
    ).toBe(401);
    expect(body.success, "Missing token should return success: false").toBe(
      false,
    );
  },
);

test(
  "transferring funds between two funded users succeeds",
  { tag: ["@finance"] },
  async ({ request }) => {
    test.setTimeout(20_000);

    // Arrange
    const [sender, recipient] = await Promise.all([
      createFundedUser(request, 100),
      registerFreshUser(),
    ]);

    // Act
    const response = await request.post(ApiUrls.financialTransfer, {
      headers: { token: sender.token },
      data: {
        toUserId: String(recipient.userId),
        amount: 25,
        description: "Test transfer between users",
      },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<TransferResponseData>>(response);

    // Assert
    expect(
      response.status(),
      "Valid transfer within balance should return HTTP 200",
    ).toBe(200);
    expect(
      body.data.amount,
      "Transfer response should echo the transferred amount",
    ).toBe(25);
  },
);

test(
  "transferring zero funds fails",
  { tag: ["@finance"] },
  async ({ request }) => {
    test.setTimeout(20_000);

    // Arrange
    const [sender, recipient] = await Promise.all([
      createFundedUser(request, 100),
      registerFreshUser(),
    ]);

    // Act
    const response = await request.post(ApiUrls.financialTransfer, {
      headers: { token: sender.token },
      data: {
        toUserId: String(recipient.userId),
        amount: 0,
        description: "Zero amount transfer",
      },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(response.status(), "amount=0 should return HTTP 400").toBe(400);
    expect(
      body.success,
      "Invalid transfer amount should return success: false",
    ).toBe(false);
  },
);

test(
  "transferring an amount above the maximum fails",
  { tag: ["@finance"] },
  async ({ request }) => {
    test.setTimeout(20_000);

    // Arrange
    const [sender, recipient] = await Promise.all([
      createFundedUser(request, 2000),
      registerFreshUser(),
    ]);

    // Act
    const response = await request.post(ApiUrls.financialTransfer, {
      headers: { token: sender.token },
      data: {
        toUserId: String(recipient.userId),
        amount: 1000.0,
        description: "Above maximum transfer",
      },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "amount above the 999.99 maximum should return HTTP 400",
    ).toBe(400);
    expect(
      body.error,
      "Error should explain the 999.99 transfer maximum",
    ).toContain("999.99");
  },
);

test(
  "transferring funds fails when toUserId is missing",
  { tag: ["@finance"] },
  async ({ request }) => {
    // Arrange
    const sender = await createFundedUser(request, 100);

    // Act
    const response = await request.post(ApiUrls.financialTransfer, {
      headers: { token: sender.token },
      data: { amount: 10, description: "Missing recipient id" },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(response.status(), "Missing toUserId should return HTTP 400").toBe(
      400,
    );
    expect(body.success, "Missing toUserId should return success: false").toBe(
      false,
    );
  },
);

test(
  "transferring funds fails when description is missing",
  { tag: ["@finance"] },
  async ({ request }) => {
    test.setTimeout(20_000);

    // Arrange
    const [sender, recipient] = await Promise.all([
      createFundedUser(request, 100),
      registerFreshUser(),
    ]);

    // Act
    const response = await request.post(ApiUrls.financialTransfer, {
      headers: { token: sender.token },
      data: { toUserId: String(recipient.userId), amount: 10 },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Missing description should return HTTP 400",
    ).toBe(400);
    expect(
      body.success,
      "Missing description should return success: false",
    ).toBe(false);
  },
);

test(
  "transferring more than the current balance fails",
  { tag: ["@finance"] },
  async ({ request }) => {
    test.setTimeout(20_000);

    // Arrange
    const [sender, recipient] = await Promise.all([
      createFundedUser(request, 5),
      registerFreshUser(),
    ]);

    // Act
    const response = await request.post(ApiUrls.financialTransfer, {
      headers: { token: sender.token },
      data: {
        toUserId: String(recipient.userId),
        amount: 50,
        description: "Exceeds available balance",
      },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Transfer above the sender's balance should return HTTP 400",
    ).toBe(400);
    expect(
      body.error,
      "Error should explain the insufficient funds condition",
    ).toContain("Insufficient funds");
  },
);

test(
  "transferring funds fails without a token",
  { tag: ["@finance"] },
  async ({ request }) => {
    // Act
    const response = await request.post(ApiUrls.financialTransfer, {
      data: { toUserId: "1", amount: 10, description: "No token supplied" },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Missing token should return HTTP 401 for a transfer",
    ).toBe(401);
    expect(body.success, "Missing token should return success: false").toBe(
      false,
    );
  },
);

test(
  "getting marketplace stats succeeds with a valid token",
  { tag: ["@finance", "@marketplace"] },
  async ({ request }) => {
    // Arrange
    const user = await registerFreshUser();

    // Act
    const response = await request.get(ApiUrls.financialMarketplaceStats, {
      headers: { token: user.token },
    });
    const body =
      await readApiResponse<ApiSuccessResponse<MarketplaceStatsResponseData>>(
        response,
      );

    // Assert
    expect(response.status(), "Marketplace stats should return HTTP 200").toBe(
      200,
    );
    expect(
      body.data.totalOffers,
      "Marketplace stats should report a numeric totalOffers value",
    ).toEqual(expect.any(Number));
  },
);

test(
  "getting all financial accounts is forbidden for a non-admin token",
  { tag: ["@finance", "@rbac"] },
  async ({ request }) => {
    // Arrange
    const user = await registerFreshUser();

    // Act
    const response = await request.get(ApiUrls.financialAccountsAll, {
      headers: { token: user.token },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Non-admin token should return HTTP 403 for all accounts",
    ).toBe(403);
    expect(body.success, "Forbidden access should return success: false").toBe(
      false,
    );
  },
);

test(
  "getting all financial accounts fails without a token",
  { tag: ["@finance", "@rbac"] },
  async ({ request }) => {
    // Act
    const response = await request.get(ApiUrls.financialAccountsAll);
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Missing token should return HTTP 401 for all accounts",
    ).toBe(401);
    expect(body.success, "Missing token should return success: false").toBe(
      false,
    );
  },
);

test(
  "updating account balance is forbidden for a non-admin token",
  { tag: ["@finance", "@rbac"] },
  async ({ request }) => {
    // Arrange
    const user = await registerFreshUser();

    // Act
    const response = await request.put(ApiUrls.financialAccountsBalance, {
      headers: { token: user.token },
      data: {
        userId: String(user.userId),
        amount: 100,
        description: "Non-admin balance update attempt",
      },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Non-admin token should return HTTP 403 for balance updates",
    ).toBe(403);
    expect(body.success, "Forbidden access should return success: false").toBe(
      false,
    );
  },
);

test(
  "updating account balance fails without a token",
  { tag: ["@finance", "@rbac"] },
  async ({ request }) => {
    // Act
    const response = await request.put(ApiUrls.financialAccountsBalance, {
      data: {
        userId: "1",
        amount: 100,
        description: "No token balance update attempt",
      },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Missing token should return HTTP 401 for balance updates",
    ).toBe(401);
    expect(body.success, "Missing token should return success: false").toBe(
      false,
    );
  },
);

test(
  "marketplace offers list excludes the caller's own active offers",
  { tag: ["@marketplace"] },
  async ({ request }) => {
    test.setTimeout(20_000);

    // Arrange
    const [seller, otherUser] = await Promise.all([
      registerFreshUser(),
      registerFreshUser(),
    ]);
    const fieldId = await createFieldForUser(request, seller.token);
    const offerResponse = await request.post(ApiUrls.marketplaceOffers, {
      headers: { token: seller.token },
      data: {
        itemType: "field",
        itemId: fieldId,
        price: 15,
        description: "Selling my field",
      },
    });
    const offerBody =
      await readApiResponse<
        ApiSuccessResponse<MarketplaceOfferCreateResponseData>
      >(offerResponse);
    const offerId = offerBody.data.offer.id;

    // Act & Assert - poll to tolerate the live server's eventual consistency
    // between offer creation and the exclusion filter under parallel load.
    await expect
      .poll(
        async () => {
          const sellerOffersResponse = await request.get(
            ApiUrls.marketplaceOffers,
            { headers: { token: seller.token } },
          );
          const sellerOffersBody =
            await readApiResponse<
              ApiSuccessResponse<MarketplaceOffersListResponseData>
            >(sellerOffersResponse);
          return sellerOffersBody.data.offers.some(
            (offer) => offer.id === offerId,
          );
        },
        {
          message:
            "Seller's own active offer should be excluded from their own offers list",
          timeout: 10_000,
        },
      )
      .toBe(false);

    const otherUserOffersResponse = await request.get(
      ApiUrls.marketplaceOffers,
      { headers: { token: otherUser.token } },
    );
    const otherUserOffersBody = await readApiResponse<
      ApiSuccessResponse<MarketplaceOffersListResponseData>
    >(otherUserOffersResponse);
    expect(
      otherUserOffersBody.data.offers.some((offer) => offer.id === offerId),
      "Another user's offers list should include the seller's active offer",
    ).toBe(true);
  },
);

test(
  "creating a marketplace offer succeeds for an owned field",
  { tag: ["@marketplace"] },
  async ({ request }) => {
    // Arrange
    const seller = await registerFreshUser();
    const fieldId = await createFieldForUser(request, seller.token);

    // Act
    const response = await request.post(ApiUrls.marketplaceOffers, {
      headers: { token: seller.token },
      data: {
        itemType: "field",
        itemId: fieldId,
        price: 25,
        description: "A lovely field",
      },
    });
    const body =
      await readApiResponse<
        ApiSuccessResponse<MarketplaceOfferCreateResponseData>
      >(response);

    // Assert
    expect(
      response.status(),
      "Creating an offer for an owned field should return HTTP 200",
    ).toBe(200);
    expect(
      body.data.offer.itemId,
      "Created offer should reference the owned field id",
    ).toBe(fieldId);
    expect(body.data.offer.status, "Newly created offer should be active").toBe(
      "active",
    );
  },
);

test(
  "creating a marketplace offer fails when price is zero",
  { tag: ["@marketplace"] },
  async ({ request }) => {
    // Arrange
    const seller = await registerFreshUser();
    const fieldId = await createFieldForUser(request, seller.token);

    // Act
    const response = await request.post(ApiUrls.marketplaceOffers, {
      headers: { token: seller.token },
      data: {
        itemType: "field",
        itemId: fieldId,
        price: 0,
        description: "Free field",
      },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(response.status(), "price=0 should return HTTP 400").toBe(400);
    expect(body.success, "Invalid price should return success: false").toBe(
      false,
    );
  },
);

test(
  "creating a marketplace offer fails when itemType is missing",
  { tag: ["@marketplace"] },
  async ({ request }) => {
    // Arrange
    const seller = await registerFreshUser();
    const fieldId = await createFieldForUser(request, seller.token);

    // Act
    const response = await request.post(ApiUrls.marketplaceOffers, {
      headers: { token: seller.token },
      data: { itemId: fieldId, price: 15 },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(response.status(), "Missing itemType should return HTTP 400").toBe(
      400,
    );
    expect(body.success, "Missing itemType should return success: false").toBe(
      false,
    );
  },
);

test(
  "creating a marketplace offer fails when itemId is missing",
  { tag: ["@marketplace"] },
  async ({ request }) => {
    // Arrange
    const seller = await registerFreshUser();

    // Act
    const response = await request.post(ApiUrls.marketplaceOffers, {
      headers: { token: seller.token },
      data: { itemType: "field", price: 15 },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(response.status(), "Missing itemId should return HTTP 400").toBe(
      400,
    );
    expect(body.success, "Missing itemId should return success: false").toBe(
      false,
    );
  },
);

test(
  "creating a marketplace offer fails when price is missing",
  { tag: ["@marketplace"] },
  async ({ request }) => {
    // Arrange
    const seller = await registerFreshUser();
    const fieldId = await createFieldForUser(request, seller.token);

    // Act
    const response = await request.post(ApiUrls.marketplaceOffers, {
      headers: { token: seller.token },
      data: { itemType: "field", itemId: fieldId },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(response.status(), "Missing price should return HTTP 400").toBe(400);
    expect(body.success, "Missing price should return success: false").toBe(
      false,
    );
  },
);

test(
  "creating a marketplace offer fails when the item is not owned by the caller",
  { tag: ["@marketplace"] },
  async ({ request }) => {
    // Arrange
    const owner = await registerFreshUser();
    const otherUser = await registerFreshUser();
    const fieldId = await createFieldForUser(request, owner.token);

    // Act
    const response = await request.post(ApiUrls.marketplaceOffers, {
      headers: { token: otherUser.token },
      data: {
        itemType: "field",
        itemId: fieldId,
        price: 15,
        description: "Not mine",
      },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Offering an item not owned by the caller should return HTTP 404",
    ).toBe(404);
    expect(
      body.error,
      "Error should explain the item is not owned by the caller",
    ).toContain("not owned by user");
  },
);

test(
  "getting my-offers returns offers owned by the caller",
  { tag: ["@marketplace"] },
  async ({ request }) => {
    // Arrange
    const seller = await registerFreshUser();
    const fieldId = await createFieldForUser(request, seller.token);
    await request.post(ApiUrls.marketplaceOffers, {
      headers: { token: seller.token },
      data: {
        itemType: "field",
        itemId: fieldId,
        price: 15,
        description: "My offer",
      },
    });

    // Act
    const response = await request.get(ApiUrls.marketplaceMyOffers, {
      headers: { token: seller.token },
    });
    const body =
      await readApiResponse<
        ApiSuccessResponse<MarketplaceOffersListResponseData>
      >(response);

    // Assert
    expect(response.status(), "My-offers should return HTTP 200").toBe(200);
    expect(
      body.data.offers.every((offer) => offer.sellerId === seller.userId),
      "Every offer in my-offers should belong to the caller",
    ).toBe(true);
  },
);

test(
  "buying an active marketplace offer completes the purchase and transfers ownership",
  { tag: ["@marketplace", "@smoke"] },
  async ({ request }) => {
    test.setTimeout(20_000);

    // Arrange
    const [seller, buyer] = await Promise.all([
      registerFreshUser(),
      createFundedUser(request, 500),
    ]);
    const fieldId = await createFieldForUser(request, seller.token);
    const offerResponse = await request.post(ApiUrls.marketplaceOffers, {
      headers: { token: seller.token },
      data: {
        itemType: "field",
        itemId: fieldId,
        price: 50,
        description: "Selling for smoke test",
      },
    });
    const offerBody =
      await readApiResponse<
        ApiSuccessResponse<MarketplaceOfferCreateResponseData>
      >(offerResponse);
    const offerId = offerBody.data.offer.id;

    // Act
    const buyResponse = await request.post(ApiUrls.marketplaceBuy, {
      headers: { token: buyer.token },
      data: { offerId },
    });
    const buyBody =
      await readApiResponse<ApiSuccessResponse<MarketplaceBuyResponseData>>(
        buyResponse,
      );
    const [sellerOffersAfterResponse, buyerFieldsResponse] = await Promise.all([
      request.get(ApiUrls.marketplaceMyOffers, {
        headers: { token: seller.token },
      }),
      request.get(ApiUrls.fields, { headers: { token: buyer.token } }),
    ]);
    const sellerOffersAfterBody = await readApiResponse<
      ApiSuccessResponse<MarketplaceOffersListResponseData>
    >(sellerOffersAfterResponse);
    const soldOffer = sellerOffersAfterBody.data.offers.find(
      (offer) => offer.id === offerId,
    );
    const buyerFieldsBody =
      await readApiResponse<ApiSuccessResponse<FieldRecord[]>>(
        buyerFieldsResponse,
      );

    // Assert
    expect(
      buyResponse.status(),
      "Successful purchase should return HTTP 200",
    ).toBe(200);
    expect(
      buyBody.data.transaction.offerId,
      "Purchase transaction should reference the purchased offer",
    ).toBe(offerId);
    expect(
      buyBody.data.transaction.buyerId,
      "Purchase transaction should record the buyer's user id",
    ).toBe(buyer.userId);
    expect(
      buyBody.data.transaction.sellerId,
      "Purchase transaction should record the seller's user id",
    ).toBe(seller.userId);
    expect(
      soldOffer?.status,
      "Offer should become sold after a successful purchase",
    ).toBe("sold");
    expect(
      buyerFieldsBody.data.some((field) => field.id === fieldId),
      "Purchased field should now be owned by the buyer",
    ).toBe(true);
  },
);

test(
  "buying an offer fails when offerId is missing",
  { tag: ["@marketplace"] },
  async ({ request }) => {
    // Arrange
    const buyer = await createFundedUser(request, 500);

    // Act
    const response = await request.post(ApiUrls.marketplaceBuy, {
      headers: { token: buyer.token },
      data: {},
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(response.status(), "Missing offerId should return HTTP 400").toBe(
      400,
    );
    expect(body.success, "Missing offerId should return success: false").toBe(
      false,
    );
  },
);

test(
  "buying own offer fails",
  { tag: ["@marketplace"] },
  async ({ request }) => {
    // Arrange
    const seller = await createFundedUser(request, 500);
    const fieldId = await createFieldForUser(request, seller.token);
    const offerResponse = await request.post(ApiUrls.marketplaceOffers, {
      headers: { token: seller.token },
      data: {
        itemType: "field",
        itemId: fieldId,
        price: 15,
        description: "My own field",
      },
    });
    const offerBody =
      await readApiResponse<
        ApiSuccessResponse<MarketplaceOfferCreateResponseData>
      >(offerResponse);

    // Act
    const response = await request.post(ApiUrls.marketplaceBuy, {
      headers: { token: seller.token },
      data: { offerId: offerBody.data.offer.id },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Buying your own offer should return HTTP 400",
    ).toBe(400);
    expect(
      body.error,
      "Error should explain that buying your own offer is not allowed",
    ).toContain("own offer");
  },
);

test(
  "buying a non-existent offer fails",
  { tag: ["@marketplace"] },
  async ({ request }) => {
    // Arrange
    const buyer = await createFundedUser(request, 500);

    // Act
    const response = await request.post(ApiUrls.marketplaceBuy, {
      headers: { token: buyer.token },
      data: { offerId: 999_999_999 },
    });
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Non-existent offerId should return HTTP 404",
    ).toBe(404);
    expect(
      body.success,
      "Non-existent offer should return success: false",
    ).toBe(false);
  },
);

test(
  "cancelling an own active offer succeeds",
  { tag: ["@marketplace"] },
  async ({ request }) => {
    // Arrange
    const seller = await registerFreshUser();
    const fieldId = await createFieldForUser(request, seller.token);
    const offerResponse = await request.post(ApiUrls.marketplaceOffers, {
      headers: { token: seller.token },
      data: {
        itemType: "field",
        itemId: fieldId,
        price: 15,
        description: "To be cancelled",
      },
    });
    const offerBody =
      await readApiResponse<
        ApiSuccessResponse<MarketplaceOfferCreateResponseData>
      >(offerResponse);

    // Act
    const response = await request.delete(
      ApiUrls.marketplaceOfferById(offerBody.data.offer.id),
      { headers: { token: seller.token } },
    );
    const body =
      await readApiResponse<ApiSuccessResponse<{ message: string }>>(response);

    // Assert
    expect(
      response.status(),
      "Cancelling an own active offer should return HTTP 200",
    ).toBe(200);
    expect(
      body.success,
      "Cancelling an own offer should return success: true",
    ).toBe(true);
  },
);

test(
  "cancelling another user's offer is forbidden",
  { tag: ["@marketplace"] },
  async ({ request }) => {
    // Arrange
    const seller = await registerFreshUser();
    const otherUser = await registerFreshUser();
    const fieldId = await createFieldForUser(request, seller.token);
    const offerResponse = await request.post(ApiUrls.marketplaceOffers, {
      headers: { token: seller.token },
      data: {
        itemType: "field",
        itemId: fieldId,
        price: 15,
        description: "Not yours",
      },
    });
    const offerBody =
      await readApiResponse<
        ApiSuccessResponse<MarketplaceOfferCreateResponseData>
      >(offerResponse);

    // Act
    const response = await request.delete(
      ApiUrls.marketplaceOfferById(offerBody.data.offer.id),
      { headers: { token: otherUser.token } },
    );
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Cancelling another user's offer should return HTTP 403",
    ).toBe(403);
    expect(
      body.success,
      "Forbidden cancellation should return success: false",
    ).toBe(false);
  },
);

test(
  "cancelling a non-existent offer returns 404",
  { tag: ["@marketplace"] },
  async ({ request }) => {
    // Arrange
    const user = await registerFreshUser();

    // Act
    const response = await request.delete(
      ApiUrls.marketplaceOfferById(999_999_999),
      { headers: { token: user.token } },
    );
    const body = await readApiResponse<ApiErrorResponse>(response);

    // Assert
    expect(
      response.status(),
      "Non-existent offerId should return HTTP 404 when cancelling",
    ).toBe(404);
    expect(
      body.success,
      "Non-existent offer should return success: false",
    ).toBe(false);
  },
);

test(
  "getting marketplace transactions succeeds with a valid token",
  { tag: ["@marketplace"] },
  async ({ request }) => {
    // Arrange
    const user = await registerFreshUser();

    // Act
    const response = await request.get(ApiUrls.marketplaceTransactions, {
      headers: { token: user.token },
    });
    const body =
      await readApiResponse<
        ApiSuccessResponse<MarketplaceTransactionsListResponseData>
      >(response);

    // Assert
    expect(
      response.status(),
      "Marketplace transactions should return HTTP 200",
    ).toBe(200);
    expect(
      Array.isArray(body.data.transactions),
      "Marketplace transactions data should contain a transactions array",
    ).toBe(true);
  },
);
