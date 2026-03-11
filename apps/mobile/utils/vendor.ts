import { Vendor } from "../types/vendor";
import { resolveApiMediaUrl } from "../api/client";

export function formatPriceRange(vendor: Vendor): string {
  if (vendor.priceMin == null && vendor.priceMax == null) {
    return "Price: updating";
  }

  if (vendor.priceMin != null && vendor.priceMax != null) {
    return `Price: ${vendor.priceMin.toLocaleString()} - ${vendor.priceMax.toLocaleString()} VND`;
  }

  if (vendor.priceMin != null) {
    return `Price: from ${vendor.priceMin.toLocaleString()} VND`;
  }

  return `Price: up to ${vendor.priceMax?.toLocaleString()} VND`;
}

export function formatRating(vendor: Vendor): string {
  if (vendor.reviewCount <= 0) {
    return "No ratings yet";
  }

  return `${vendor.averageRating.toFixed(1)} (${vendor.reviewCount} reviews)`;
}

export function getVendorCoverUrl(vendor: Vendor): string | null {
  const firstPhoto = vendor.photos[0];

  if (!firstPhoto) {
    return null;
  }

  return resolveApiMediaUrl(firstPhoto.url);
}
