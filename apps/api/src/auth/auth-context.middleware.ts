import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Response } from "express";
import { AuthService } from "./auth.service";
import { AuthenticatedRequest } from "./auth.types";

@Injectable()
export class AuthContextMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction,
  ): Promise<void> {
    const authorization = req.headers.authorization;
    const bearer = Array.isArray(authorization)
      ? authorization[0]
      : authorization;

    if (!bearer || !bearer.startsWith("Bearer ")) {
      next();
      return;
    }

    const token = bearer.slice("Bearer ".length).trim();

    if (!token) {
      next();
      return;
    }

    const resolvedUserId = await this.authService.resolveUserIdFromToken(token);
    req.authUserId = resolvedUserId ?? undefined;
    next();
  }
}
