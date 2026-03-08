import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, ReviewStatus, VendorStatus } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { CreateVendorDto } from "./dto/create-vendor.dto";
import { GetNearbyVendorsQueryDto } from "./dto/get-nearby-vendors-query.dto";
import { GetVendorReviewsQueryDto } from "./dto/get-vendor-reviews-query.dto";
import { GetVendorsQueryDto } from "./dto/get-vendors-query.dto";

@Injectable()
export class VendorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateVendorDto, authUserId?: string) {
    if (
      input.priceMin !== undefined &&
      input.priceMax !== undefined &&
      input.priceMax < input.priceMin
    ) {
      throw new BadRequestException(
        "priceMax must be greater than or equal to priceMin",
      );
    }

    const slug = await this.buildUniqueSlug(input.name);

    return this.prisma.vendor.create({
      data: {
        name: input.name,
        slug,
        description: input.description ?? null,
        latitude: input.latitude,
        longitude: input.longitude,
        addressText: input.addressText,
        district: input.district,
        city: input.city,
        category: input.category,
        priceMin: input.priceMin ?? null,
        priceMax: input.priceMax ?? null,
        openHoursJson: input.openHoursJson as Prisma.InputJsonValue | undefined,
        status: VendorStatus.PENDING,
        submittedByUserId: authUserId ?? null,
      },
    });
  }

  findAll(query: GetVendorsQueryDto) {
    return this.prisma.vendor.findMany({
      skip: query.offset,
      take: query.limit,
      orderBy: { createdAt: "desc" },
    });
  }

  async findNearby(query: GetNearbyVendorsQueryDto) {
    const { latitude, longitude, radiusKm } = query;

    const latitudeDelta = radiusKm / 111;
    const longitudeDelta =
      radiusKm / (111 * Math.max(Math.cos((latitude * Math.PI) / 180), 0.01));

    const candidates = await this.prisma.vendor.findMany({
      where: {
        status: VendorStatus.APPROVED,
        latitude: {
          gte: latitude - latitudeDelta,
          lte: latitude + latitudeDelta,
        },
        longitude: {
          gte: longitude - longitudeDelta,
          lte: longitude + longitudeDelta,
        },
      },
    });

    return candidates
      .map((vendor) => ({
        vendor,
        distanceKm: this.haversineKm(
          latitude,
          longitude,
          vendor.latitude,
          vendor.longitude,
        ),
      }))
      .filter((item) => item.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .map((item) => item.vendor);
  }

  async findOne(id: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
    });

    if (!vendor) {
      throw new NotFoundException("Vendor not found");
    }

    return {
      ...vendor,
      aiSummary: vendor.aiSummary?.trim() || null,
    };
  }

  async listReviews(vendorId: string, query: GetVendorReviewsQueryDto) {
    await this.ensureVendorExists(vendorId);

    return this.prisma.review.findMany({
      where: {
        vendorId,
        status: {
          not: ReviewStatus.REJECTED,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: query.offset,
      take: query.limit,
    });
  }

  async createReview(
    vendorId: string,
    input: CreateReviewDto,
    authUserId?: string,
  ) {
    await this.ensureVendorExists(vendorId);

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          userId: authUserId ?? input.userId ?? null,
          vendorId,
          rating: input.rating,
          content: input.content,
          cleanlinessScore: input.cleanlinessScore,
          authenticityScore: input.authenticityScore,
          valueScore: input.valueScore,
          crowdScore: input.crowdScore,
          status: ReviewStatus.PENDING,
        },
      });

      const aggregate = await tx.review.aggregate({
        where: {
          vendorId,
          status: {
            not: ReviewStatus.REJECTED,
          },
        },
        _avg: {
          rating: true,
        },
        _count: {
          rating: true,
        },
      });

      await tx.vendor.update({
        where: {
          id: vendorId,
        },
        data: {
          averageRating: aggregate._avg.rating ?? 0,
          reviewCount: aggregate._count.rating,
        },
      });

      return review;
    });
  }

  private async buildUniqueSlug(name: string): Promise<string> {
    const base = this.slugify(name);
    let slug = base;
    let counter = 1;

    while (await this.prisma.vendor.findUnique({ where: { slug } })) {
      counter += 1;
      slug = `${base}-${counter}`;
    }

    return slug;
  }

  private slugify(value: string): string {
    const normalized = value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const cleaned = normalized
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);

    return cleaned || `vendor-${Date.now()}`;
  }

  private haversineKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  private async ensureVendorExists(vendorId: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { id: true },
    });

    if (!vendor) {
      throw new NotFoundException("Vendor not found");
    }
  }
}
