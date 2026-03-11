import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../database/prisma.service";
import { createHash, randomBytes } from "node:crypto";
import { RequestPhoneCodeDto } from "./dto/request-phone-code.dto";
import { VerifyPhoneCodeDto } from "./dto/verify-phone-code.dto";
import type { AuthUser } from "./auth.types";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async createGuestSession() {
    const user = await this.prisma.user.create({
      data: {
        displayName: `Guest ${Date.now()}`,
      },
    });

    return this.createSessionForUser(user.id);
  }

  async requestPhoneCode(input: RequestPhoneCodeDto) {
    const phoneNumber = this.normalizePhoneNumber(input.phoneNumber);
    const recentWindow = new Date(Date.now() - 60 * 1000);
    const recentCount = await this.prisma.phoneVerification.count({
      where: {
        phoneNumber,
        createdAt: {
          gte: recentWindow,
        },
      },
    });

    if (recentCount >= 3) {
      throw new HttpException(
        "Too many code requests. Please try again in a minute.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const user = await this.prisma.user.upsert({
      where: {
        phoneNumber,
      },
      update: {},
      create: {
        phoneNumber,
        displayName: this.buildPhoneDisplayName(phoneNumber),
      },
    });

    const code = this.generatePhoneCode();
    const expiresInMinutes = this.configService.get<number>(
      "PHONE_VERIFICATION_TTL_MINUTES",
      5,
    );
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    await this.prisma.phoneVerification.create({
      data: {
        userId: user.id,
        phoneNumber,
        codeHash: this.hashCode(code),
        expiresAt,
      },
    });

    this.logger.log(`Phone verification code for ${phoneNumber}: ${code}`);

    return {
      phoneNumber,
      expiresAt,
      message:
        "Verification code generated. Check server logs in local development.",
    };
  }

  async verifyPhoneCode(input: VerifyPhoneCodeDto) {
    const phoneNumber = this.normalizePhoneNumber(input.phoneNumber);
    const verification = await this.prisma.phoneVerification.findFirst({
      where: {
        phoneNumber,
        consumedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!verification) {
      throw new UnauthorizedException(
        "Verification code is invalid or expired",
      );
    }

    if (verification.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException(
        "Verification code is invalid or expired",
      );
    }

    if (verification.codeHash !== this.hashCode(input.code)) {
      throw new UnauthorizedException(
        "Verification code is invalid or expired",
      );
    }

    const user = verification.userId
      ? await this.prisma.user.update({
          where: {
            id: verification.userId,
          },
          data: {
            phoneVerifiedAt: new Date(),
            phoneNumber,
            displayName: this.buildPhoneDisplayName(phoneNumber),
          },
        })
      : await this.prisma.user.upsert({
          where: {
            phoneNumber,
          },
          update: {
            phoneVerifiedAt: new Date(),
            displayName: this.buildPhoneDisplayName(phoneNumber),
          },
          create: {
            phoneNumber,
            phoneVerifiedAt: new Date(),
            displayName: this.buildPhoneDisplayName(phoneNumber),
          },
        });

    await this.prisma.phoneVerification.update({
      where: {
        id: verification.id,
      },
      data: {
        consumedAt: new Date(),
      },
    });

    return this.createSessionForUser(user.id);
  }

  async getCurrentUser(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      select: {
        id: true,
        displayName: true,
        phoneNumber: true,
      },
    });

    return user;
  }

  async resolveUserIdFromToken(rawToken: string): Promise<string | null> {
    const tokenHash = this.hashToken(rawToken);

    const authToken = await this.prisma.authToken.findUnique({
      where: { tokenHash },
      select: {
        userId: true,
        revokedAt: true,
        expiresAt: true,
      },
    });

    if (!authToken) {
      return null;
    }

    if (authToken.revokedAt) {
      return null;
    }

    if (authToken.expiresAt && authToken.expiresAt.getTime() < Date.now()) {
      return null;
    }

    return authToken.userId;
  }

  private async createSessionForUser(userId: string) {
    const token = this.generateToken();
    const tokenHash = this.hashToken(token);
    const ttlDays = this.configService.get<number>("AUTH_TOKEN_TTL_DAYS", 30);
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    await this.prisma.authToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    const user = await this.getCurrentUser(userId);

    return {
      accessToken: token,
      user,
      expiresAt,
    };
  }

  private normalizePhoneNumber(rawPhoneNumber: string): string {
    return rawPhoneNumber.replace(/\s+/g, "").trim();
  }

  private buildPhoneDisplayName(phoneNumber: string): string {
    return `User ${phoneNumber.slice(-4)}`;
  }

  private hashCode(code: string): string {
    return createHash("sha256").update(code).digest("hex");
  }

  private hashToken(rawToken: string): string {
    return createHash("sha256").update(rawToken).digest("hex");
  }

  private generateToken(): string {
    return randomBytes(32).toString("hex");
  }

  private generatePhoneCode(): string {
    return String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
  }
}
