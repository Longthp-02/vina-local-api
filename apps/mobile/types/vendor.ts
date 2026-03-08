export type VendorStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Vendor = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  latitude: number;
  longitude: number;
  addressText: string;
  district: string;
  city: string;
  category: string;
  priceMin: number | null;
  priceMax: number | null;
  openHoursJson: unknown;
  status: VendorStatus;
  averageRating: number;
  reviewCount: number;
  aiSummary: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateVendorInput = {
  name: string;
  description?: string;
  addressText: string;
  district: string;
  city: string;
  category: string;
  priceMin?: number;
  priceMax?: number;
  latitude: number;
  longitude: number;
};

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Review = {
  id: string;
  userId: string | null;
  vendorId: string;
  rating: number;
  content: string;
  cleanlinessScore: number;
  authenticityScore: number;
  valueScore: number;
  crowdScore: number;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateReviewInput = {
  rating: number;
  content: string;
};
