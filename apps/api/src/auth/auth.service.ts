import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../database/prisma.service";
import { createHash, randomBytes } from "node:crypto";

@Injectable()
export class AuthService {
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

    const token = this.generateToken();
    const tokenHash = this.hashToken(token);

    const ttlDays = this.configService.get<number>("AUTH_TOKEN_TTL_DAYS", 30);
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    await this.prisma.authToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return {
      accessToken: token,
      user: {
        id: user.id,
        displayName: user.displayName,
      },
      expiresAt,
    };
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

  private hashToken(rawToken: string): string {
    return createHash("sha256").update(rawToken).digest("hex");
  }

  private generateToken(): string {
    return randomBytes(32).toString("hex");
  }
}
