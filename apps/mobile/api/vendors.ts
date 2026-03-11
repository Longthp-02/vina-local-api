import { apiRequest } from "./client";
import {
  CreateReviewInput,
  CreateVendorInput,
  PhotoUploadInput,
  Review,
  Vendor,
} from "../types/vendor";

type GetVendorsParams = {
  limit?: number;
  offset?: number;
};

export async function getVendors(params: GetVendorsParams = {}): Promise<Vendor[]> {
  const queryParts: string[] = [];

  if (params.limit !== undefined) {
    queryParts.push(`limit=${encodeURIComponent(String(params.limit))}`);
  }

  if (params.offset !== undefined) {
    queryParts.push(`offset=${encodeURIComponent(String(params.offset))}`);
  }

  const query = queryParts.join("&");
  const path = query ? `/vendors?${query}` : "/vendors";

  return apiRequest<Vendor[]>(path);
}

export async function getVendorById(id: string): Promise<Vendor> {
  return apiRequest<Vendor>(`/vendors/${id}`);
}

export async function createVendor(input: CreateVendorInput): Promise<Vendor> {
  return apiRequest<Vendor>("/vendors", {
    method: "POST",
    body: buildVendorFormData(input),
  });
}

export async function getVendorReviews(
  vendorId: string,
  params: GetVendorsParams = {},
): Promise<Review[]> {
  const queryParts: string[] = [];

  if (params.limit !== undefined) {
    queryParts.push(`limit=${encodeURIComponent(String(params.limit))}`);
  }

  if (params.offset !== undefined) {
    queryParts.push(`offset=${encodeURIComponent(String(params.offset))}`);
  }

  const query = queryParts.join("&");
  const path = query
    ? `/vendors/${vendorId}/reviews?${query}`
    : `/vendors/${vendorId}/reviews`;

  return apiRequest<Review[]>(path);
}

export async function createVendorReview(
  vendorId: string,
  input: CreateReviewInput,
): Promise<Review> {
  return apiRequest<Review>(`/vendors/${vendorId}/reviews`, {
    method: "POST",
    body: buildReviewFormData(input),
  });
}

function buildVendorFormData(input: CreateVendorInput): FormData {
  const formData = new FormData();

  formData.append("name", input.name);

  if (input.description) {
    formData.append("description", input.description);
  }

  formData.append("addressText", input.addressText);
  formData.append("district", input.district);
  formData.append("city", input.city);
  formData.append("category", input.category);
  formData.append("latitude", String(input.latitude));
  formData.append("longitude", String(input.longitude));

  if (input.priceMin !== undefined) {
    formData.append("priceMin", String(input.priceMin));
  }

  if (input.priceMax !== undefined) {
    formData.append("priceMax", String(input.priceMax));
  }

  appendPhotos(formData, input.photos);
  return formData;
}

function buildReviewFormData(input: CreateReviewInput): FormData {
  const formData = new FormData();

  formData.append("rating", String(input.rating));
  formData.append("content", input.content);
  formData.append("cleanlinessScore", String(input.rating));
  formData.append("authenticityScore", String(input.rating));
  formData.append("valueScore", String(input.rating));
  formData.append("crowdScore", String(input.rating));

  appendPhotos(formData, input.photos);
  return formData;
}

function appendPhotos(formData: FormData, photos?: PhotoUploadInput[]) {
  photos?.forEach((photo, index) => {
    formData.append("photos", {
      uri: photo.uri,
      name: photo.name ?? `photo-${index + 1}.jpg`,
      type: photo.mimeType ?? "image/jpeg",
    } as never);
  });
}
