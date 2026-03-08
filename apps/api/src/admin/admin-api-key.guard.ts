import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const configuredKey = this.configService.get<string>("ADMIN_API_KEY");

    // If no key is configured yet, allow internal usage during MVP setup.
    if (!configuredKey) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | string[] | undefined> }>();
    const headerValue = request.headers["x-admin-key"];
    const providedKey = Array.isArray(headerValue)
      ? headerValue[0]
      : headerValue;

    if (providedKey !== configuredKey) {
      throw new UnauthorizedException("Invalid admin key");
    }

    return true;
  }
}
