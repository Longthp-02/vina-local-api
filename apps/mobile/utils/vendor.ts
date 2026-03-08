import { Vendor } from "../types/vendor";

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
