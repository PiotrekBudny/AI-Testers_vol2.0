export type Field = {
  id: number;
  userId: number;
  name?: string;
  district?: string;
  area?: number;
};

export type Staff = {
  id: number;
  userId: number;
  name?: string;
  surname?: string;
  age?: number;
};

export type Assignment = {
  id: number;
  userId: number;
  fieldId: number;
  staffId: number;
  createdAt: string;
};

export type Animal = {
  id: number;
  userId: number;
  type: string;
  amount: number;
  createdAt: string;
};

export type AnimalType = {
  key: string;
  fullName: string;
  description: string;
  icon: string;
};

export type AnimalTypesResponse = {
  success: true;
  data: Record<string, AnimalType>;
};

export type DistrictsSummary = Record<
  string,
  { fieldsCount: number; fieldsAreaHa: number }
>;

export type DistrictLookup = {
  districtName: string;
  fieldsCount: number;
  fieldsAreaHa: number;
};

export type DeleteMessageData = { message: string };

export type AssignmentRemovedResponse = { success: true; message: string };

export type MapInfo = {
  message: string;
  endpoints: Array<{ method: string; path: string; description: string }>;
};

export type FieldsMap = { type: string; features: unknown[] };
