import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import type { AuthenticatedRequest } from "./auth.types";
import { RequestPhoneCodeDto } from "./dto/request-phone-code.dto";
import { VerifyPhoneCodeDto } from "./dto/verify-phone-code.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("guest")
  createGuestSession() {
    return this.authService.createGuestSession();
  }

  @Post("request-code")
  requestPhoneCode(@Body() body: RequestPhoneCodeDto) {
    return this.authService.requestPhoneCode(body);
  }

  @Post("verify-code")
  verifyPhoneCode(@Body() body: VerifyPhoneCodeDto) {
    return this.authService.verifyPhoneCode(body);
  }

  @Get("me")
  async getCurrentUser(@Req() req: AuthenticatedRequest) {
    if (!req.authUserId) {
      throw new UnauthorizedException("Authentication required");
    }

    return this.authService.getCurrentUser(req.authUserId);
  }
}
