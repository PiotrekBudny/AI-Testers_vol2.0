export type TransactionRecord = {
  id: number;
  type: "income" | "expense";
  amount: number;
  description: string;
  category?: string;
  referenceId: string | null;
  timestamp: string;
  balanceBefore: number;
  balanceAfter: number;
};

export type FinancialAccountRecord = {
  id: number;
  userId: number;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  transactions: TransactionRecord[];
};

export type FinancialAccountResponseData = { account: FinancialAccountRecord };

export type TransactionsListResponseData = {
  transactions: TransactionRecord[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export type TransactionCreateResponseData = { transaction: TransactionRecord };

export type FinancialStatsResponseData = {
  statistics: {
    currentBalance: number;
    totalIncome: number;
    totalExpenses: number;
    totalTransferred: number;
    transactionCount: number;
  };
};

export type FinancialReportResponseData = {
  encodedReport: string;
  filename: string;
  generatedAt: string;
  totalTransactions: number;
  maxRows: number;
};

export type TransferResponseData = { success: boolean; amount: number };
