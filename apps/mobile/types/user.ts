import { VendorList } from "./list";

export type CreatorProfileUser = {
  id: string;
  displayName: string;
  phoneNumber: string | null;
  followerCount: number;
  followingCount: number;
  followedByMe: boolean;
};

export type CreatorProfile = {
  user: CreatorProfileUser;
  lists: VendorList[];
};

export type SuggestedCreator = {
  id: string;
  displayName: string;
  phoneNumber: string | null;
  followerCount: number;
  publicListCount: number;
};

export type UserNotification = {
  id: string;
  userId: string;
  actorUserId: string | null;
  listId: string | null;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};
