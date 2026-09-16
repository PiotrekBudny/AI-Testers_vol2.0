export type ContactResponseBody = {
  success: boolean;
  message?: string;
  id?: string;
  error?: string;
};

export type FeatureFlagsData = {
  flags: Record<string, boolean>;
  updatedAt: string | null;
};

export type FeatureFlagsWithDescriptionsData = {
  flags: Record<string, { value: boolean; description?: string }>;
};
