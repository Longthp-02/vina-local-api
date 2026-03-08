export type AuthenticatedRequest = {
  headers: Record<string, string | string[] | undefined>;
  authUserId?: string;
};
