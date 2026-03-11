import { Injectable, NotFoundException } from "@nestjs/common";
import {
  ReviewStatus,
  VendorListVisibility,
  VendorStatus,
} from "@prisma/client";
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

  listReportedListComments() {
    return this.prisma.vendorListComment.findMany({
      where: {
        reportedAt: {
          not: null,
        },
        hiddenAt: null,
      },
      orderBy: [{ reportCount: "desc" }, { reportedAt: "desc" }],
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            phoneNumber: true,
          },
        },
        list: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  listReportedLists() {
    return this.prisma.vendorList.findMany({
      where: {
        reportedAt: {
          not: null,
        },
        hiddenAt: null,
        visibility: VendorListVisibility.PUBLIC,
      },
      orderBy: [{ reportCount: "desc" }, { reportedAt: "desc" }],
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            phoneNumber: true,
          },
        },
        items: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  listHiddenLists() {
    return this.prisma.vendorList.findMany({
      where: {
        hiddenAt: {
          not: null,
        },
      },
      orderBy: { hiddenAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            phoneNumber: true,
          },
        },
        items: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  listHiddenListComments() {
    return this.prisma.vendorListComment.findMany({
      where: {
        hiddenAt: {
          not: null,
        },
      },
      orderBy: { hiddenAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            phoneNumber: true,
          },
        },
        list: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
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

  async hideListComment(id: string) {
    await this.ensureListCommentExists(id);

    return this.prisma.vendorListComment.update({
      where: { id },
      data: {
        hiddenAt: new Date(),
      },
    });
  }

  async hideList(id: string) {
    await this.ensureListExists(id);

    return this.prisma.vendorList.update({
      where: { id },
      data: {
        hiddenAt: new Date(),
      },
    });
  }

  async restoreList(id: string) {
    await this.ensureListExists(id);

    return this.prisma.vendorList.update({
      where: { id },
      data: {
        hiddenAt: null,
      },
    });
  }

  async clearListReports(id: string) {
    await this.ensureListExists(id);

    return this.prisma.$transaction(async (tx) => {
      await tx.vendorListReport.deleteMany({
        where: { listId: id },
      });

      return tx.vendorList.update({
        where: { id },
        data: {
          reportCount: 0,
          reportedAt: null,
        },
      });
    });
  }

  async restoreListComment(id: string) {
    await this.ensureListCommentExists(id);

    return this.prisma.vendorListComment.update({
      where: { id },
      data: {
        hiddenAt: null,
      },
    });
  }

  async clearListCommentReports(id: string) {
    await this.ensureListCommentExists(id);

    return this.prisma.$transaction(async (tx) => {
      await tx.vendorListCommentReport.deleteMany({
        where: { commentId: id },
      });

      return tx.vendorListComment.update({
        where: { id },
        data: {
          reportCount: 0,
          reportedAt: null,
        },
      });
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

  private async ensureListExists(id: string) {
    const list = await this.prisma.vendorList.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!list) {
      throw new NotFoundException("List not found");
    }
  }

  private async ensureListCommentExists(id: string) {
    const comment = await this.prisma.vendorListComment.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!comment) {
      throw new NotFoundException("List comment not found");
    }
  }
}
