import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ReviewStatus } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { VENDOR_SUMMARY_PROVIDER } from "./vendor-summary.provider";
import type { VendorSummaryProvider } from "./vendor-summary.provider";

type VendorSummaryJob = {
  id: string;
  vendorId: string;
};

@Injectable()
export class VendorSummaryService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(VENDOR_SUMMARY_PROVIDER)
    private readonly summaryProvider: VendorSummaryProvider,
  ) {}

  async triggerRegeneration(vendorId: string) {
    const job: VendorSummaryJob = {
      id: `vendor-summary-${vendorId}-${Date.now()}`,
      vendorId,
    };

    const result = await this.processJob(job);

    return {
      jobId: job.id,
      ...result,
    };
  }

  async processJob(job: VendorSummaryJob) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: job.vendorId },
      select: {
        id: true,
        name: true,
      },
    });

    if (!vendor) {
      throw new NotFoundException("Vendor not found");
    }

    const reviews = await this.prisma.review.findMany({
      where: {
        vendorId: job.vendorId,
        status: {
          not: ReviewStatus.REJECTED,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
      select: {
        content: true,
      },
    });

    const summary = await this.summaryProvider.generateSummary({
      vendorName: vendor.name,
      reviewContents: reviews.map((review) => review.content),
    });

    const updatedVendor = await this.prisma.vendor.update({
      where: { id: job.vendorId },
      data: { aiSummary: summary },
      select: {
        id: true,
        aiSummary: true,
      },
    });

    return {
      vendorId: updatedVendor.id,
      aiSummary: updatedVendor.aiSummary,
    };
  }
}
