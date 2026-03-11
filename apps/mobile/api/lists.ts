import { apiRequest } from "./client";
import { CreateVendorListInput, VendorList, VendorListComment } from "../types/list";
import { CreatorProfile, SuggestedCreator, UserNotification } from "../types/user";

export async function getPublicLists(): Promise<VendorList[]> {
  return apiRequest<VendorList[]>("/lists/public");
}

export async function getTopLists(): Promise<VendorList[]> {
  return apiRequest<VendorList[]>("/lists/top");
}

export async function getMyLists(): Promise<VendorList[]> {
  return apiRequest<VendorList[]>("/users/me/lists");
}

export async function getFollowingFeed(): Promise<VendorList[]> {
  return apiRequest<VendorList[]>("/feed/lists");
}

export async function getSuggestedCreators(): Promise<SuggestedCreator[]> {
  return apiRequest<SuggestedCreator[]>("/users/suggested-creators");
}

export async function getCreatorProfile(userId: string): Promise<CreatorProfile> {
  return apiRequest<CreatorProfile>(`/users/${userId}/profile`);
}

export async function getListById(id: string): Promise<VendorList> {
  return apiRequest<VendorList>(`/lists/${id}`);
}

export async function getListComments(listId: string): Promise<VendorListComment[]> {
  return apiRequest<VendorListComment[]>(`/lists/${listId}/comments`);
}

export async function createList(input: CreateVendorListInput): Promise<VendorList> {
  return apiRequest<VendorList>("/lists", {
    method: "POST",
    body: input,
  });
}

export async function updateList(
  listId: string,
  input: CreateVendorListInput,
): Promise<VendorList> {
  return apiRequest<VendorList>(`/lists/${listId}`, {
    method: "PATCH",
    body: input,
  });
}

export async function deleteList(listId: string): Promise<{ success: true }> {
  return apiRequest<{ success: true }>(`/lists/${listId}`, {
    method: "DELETE",
  });
}

export async function addVendorToList(
  listId: string,
  vendorId: string,
): Promise<VendorList> {
  return apiRequest<VendorList>(`/lists/${listId}/vendors`, {
    method: "POST",
    body: { vendorId },
  });
}

export async function removeVendorFromList(
  listId: string,
  vendorId: string,
): Promise<VendorList> {
  return apiRequest<VendorList>(`/lists/${listId}/vendors/${vendorId}`, {
    method: "DELETE",
  });
}

export async function likeList(listId: string): Promise<VendorList> {
  return apiRequest<VendorList>(`/lists/${listId}/like`, {
    method: "POST",
  });
}

export async function unlikeList(listId: string): Promise<VendorList> {
  return apiRequest<VendorList>(`/lists/${listId}/like`, {
    method: "DELETE",
  });
}

export async function followUser(userId: string): Promise<CreatorProfile> {
  return apiRequest<CreatorProfile>(`/users/${userId}/follow`, {
    method: "POST",
  });
}

export async function unfollowUser(userId: string): Promise<CreatorProfile> {
  return apiRequest<CreatorProfile>(`/users/${userId}/follow`, {
    method: "DELETE",
  });
}

export async function getNotifications(): Promise<UserNotification[]> {
  return apiRequest<UserNotification[]>("/notifications");
}

export async function markNotificationRead(
  notificationId: string,
): Promise<UserNotification> {
  return apiRequest<UserNotification>(`/notifications/${notificationId}/read`, {
    method: "POST",
  });
}

export async function markAllNotificationsRead(): Promise<{ success: true }> {
  return apiRequest<{ success: true }>("/notifications/read-all", {
    method: "POST",
  });
}

export async function createListComment(
  listId: string,
  content: string,
): Promise<VendorListComment> {
  return apiRequest<VendorListComment>(`/lists/${listId}/comments`, {
    method: "POST",
    body: { content },
  });
}

export async function reportList(listId: string): Promise<{ success: true }> {
  return apiRequest<{ success: true }>(`/lists/${listId}/report`, {
    method: "POST",
  });
}

export async function reportListComment(
  commentId: string,
): Promise<{ success: true }> {
  return apiRequest<{ success: true }>(`/lists/comments/${commentId}/report`, {
    method: "POST",
  });
}
