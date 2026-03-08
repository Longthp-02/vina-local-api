import { Injectable } from "@nestjs/common";
import {
  VendorSummaryInput,
  VendorSummaryProvider,
} from "./vendor-summary.provider";

@Injectable()
export class PlaceholderVendorSummaryProvider implements VendorSummaryProvider {
  generateSummary(input: VendorSummaryInput): Promise<string> {
    if (input.reviewContents.length === 0) {
      return Promise.resolve(`${input.vendorName} has no review summary yet.`);
    }

    const snippets = input.reviewContents
      .map((text) => text.trim())
      .filter((text) => text.length > 0)
      .slice(0, 3)
      .map((text) => (text.length > 80 ? `${text.slice(0, 77)}...` : text));

    if (snippets.length === 0) {
      return Promise.resolve(`${input.vendorName} has no review summary yet.`);
    }

    return Promise.resolve(`Based on recent reviews: ${snippets.join(" | ")}`);
  }
}
