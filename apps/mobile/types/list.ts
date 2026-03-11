import { Vendor } from "./vendor";

export type VendorListVisibility = "PRIVATE" | "PUBLIC";

export type VendorListUser = {
  id: string;
  displayName: string;
  phoneNumber: string | null;
};

export type VendorListComment = {
  id: string;
  listId: string;
  userId: string;
  content: string;
  reportCount: number;
  reportedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: VendorListUser;
};

export type VendorListItem = {
  id: string;
  listId: string;
  vendorId: string;
  position: number;
  createdAt: string;
  vendor: Vendor;
};

export type VendorList = {
  id: string;
  userId: string;
  title: string;
  slug: string;
  description: string | null;
  visibility: VendorListVisibility;
  likeCount: number;
  viewCount: number;
  itemCount: number;
  reportCount: number;
  reportedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: VendorListUser;
  items: VendorListItem[];
  likedByMe: boolean;
};

export type CreateVendorListInput = {
  title: string;
  description?: string;
  visibility?: VendorListVisibility;
};
