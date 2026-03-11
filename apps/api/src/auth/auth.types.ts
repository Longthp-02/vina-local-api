export type AuthenticatedRequest = {
  headers: Record<string, string | string[] | undefined>;
  authUserId?: string;
};

export type AuthUser = {
  id: string;
  displayName: string;
  phoneNumber: string | null;
};
