import { Injectable, NotFoundException } from "@nestjs/common";
import { ReviewStatus, VendorStatus } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class ModerationService {
  constructor(private readonly prisma: PrismaService) {}

  listPendingVendors() {
    return this.prisma.vendor.findMany({
      where: { status: VendorStatus.PENDING },
      orderBy: { createdAt: "asc" },
    });
  }

  listPendingReviews() {
    return this.prisma.review.findMany({
      where: { status: ReviewStatus.PENDING },
      orderBy: { createdAt: "asc" },
    });
  }

  listFlaggedReviews() {
    return this.prisma.review.findMany({
      where: { status: ReviewStatus.REJECTED },
      orderBy: { createdAt: "desc" },
    });
  }

  async approveVendor(id: string) {
    await this.ensureVendorExists(id);

    return this.prisma.vendor.update({
      where: { id },
      data: { status: VendorStatus.APPROVED },
    });
  }

  async rejectVendor(id: string) {
    await this.ensureVendorExists(id);

    return this.prisma.vendor.update({
      where: { id },
      data: { status: VendorStatus.REJECTED },
    });
  }

  private async ensureVendorExists(id: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!vendor) {
      throw new NotFoundException("Vendor not found");
    }
  }
}
