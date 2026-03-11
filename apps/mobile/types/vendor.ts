export type VendorStatus = "PENDING" | "APPROVED" | "REJECTED";

export type VendorPhoto = {
  id: string;
  url: string;
  storagePath: string;
  mimeType: string;
  createdAt: string;
};

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
  photos: VendorPhoto[];
  createdAt: string;
  updatedAt: string;
};

export type PhotoUploadInput = {
  uri: string;
  name?: string | null;
  mimeType?: string | null;
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
  photos?: PhotoUploadInput[];
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
  photos: VendorPhoto[];
  createdAt: string;
  updatedAt: string;
};

export type CreateReviewInput = {
  rating: number;
  content: string;
  photos?: PhotoUploadInput[];
};
