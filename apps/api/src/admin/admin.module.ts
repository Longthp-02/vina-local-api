import { Module } from "@nestjs/common";
import { ModerationController } from "./moderation.controller";
import { ModerationService } from "./moderation.service";
import { AdminApiKeyGuard } from "./admin-api-key.guard";

@Module({
  controllers: [ModerationController],
  providers: [ModerationService, AdminApiKeyGuard],
})
export class AdminModule {}
