export type PingResponse = {
  message: string;
};

export type SystemStatisticsData = {
  users: number;
  farms: number;
  staff: number;
  animals: number;
  offers: number;
  area: number;
  avgStaffAge: number;
};

export type UserProfileData = {
  id: number;
  email: string;
  displayedName?: string;
};
