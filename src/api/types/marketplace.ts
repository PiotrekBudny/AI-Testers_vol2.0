export type MarketplaceStatsResponseData = {
  totalActiveOffers: number;
  totalOffers: number;
  totalTransactions: number;
  totalVolume: number;
};

export type FieldRecord = {
  id: number;
  userId: number;
  name: string;
  area: number;
  district?: string;
};

export type MarketplaceOfferRecord = {
  id: number;
  sellerId: number;
  itemType: "field" | "animal";
  itemId: number;
  price: number;
  description?: string;
  status: "active" | "cancelled" | "sold";
  createdAt: string;
  updatedAt: string;
};

export type MarketplaceOfferCreateResponseData = {
  offer: MarketplaceOfferRecord;
  message: string;
};

export type MarketplaceOffersListResponseData = {
  offers: MarketplaceOfferRecord[];
  total: number;
};

export type MarketplaceTransactionRecord = {
  id: number;
  offerId: number;
  sellerId: number;
  buyerId: number;
  itemType: "field" | "animal";
  itemId: number;
  price: number;
  status: string;
  createdAt: string;
};

export type MarketplaceBuyResponseData = {
  transaction: MarketplaceTransactionRecord;
  message: string;
};

export type MarketplaceTransactionsListResponseData = {
  transactions: MarketplaceTransactionRecord[];
  total: number;
};
