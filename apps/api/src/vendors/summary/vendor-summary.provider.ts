export type VendorSummaryInput = {
  vendorName: string;
  reviewContents: string[];
};

export type VendorSummaryProvider = {
  generateSummary(input: VendorSummaryInput): Promise<string>;
};

export const VENDOR_SUMMARY_PROVIDER = "VENDOR_SUMMARY_PROVIDER";
