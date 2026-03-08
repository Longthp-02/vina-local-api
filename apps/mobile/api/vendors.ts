import { apiRequest } from "./client";
import {
  CreateReviewInput,
  CreateVendorInput,
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
    body: input,
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
    body: {
      rating: input.rating,
      content: input.content,
      cleanlinessScore: input.rating,
      authenticityScore: input.rating,
      valueScore: input.rating,
      crowdScore: input.rating,
    },
  });
}
