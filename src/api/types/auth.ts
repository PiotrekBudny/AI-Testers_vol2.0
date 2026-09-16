export type LoginResponseData = {
  token: string;
  user: {
    email: string;
  };
};

export type RegisterResponseData = {
  token: string;
  user: {
    id: number;
    email: string;
    displayedName?: string;
    isActive: boolean;
  };
};
