import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AdminApiKeyGuard } from "./admin-api-key.guard";
import { IdParamDto } from "./dto/id-param.dto";
import { ModerationService } from "./moderation.service";

@Controller("admin/moderation")
@UseGuards(AdminApiKeyGuard)
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get("vendors/pending")
  listPendingVendors() {
    return this.moderationService.listPendingVendors();
  }

  @Post("vendors/:id/approve")
  approveVendor(@Param() params: IdParamDto) {
    return this.moderationService.approveVendor(params.id);
  }

  @Post("vendors/:id/reject")
  rejectVendor(@Param() params: IdParamDto) {
    return this.moderationService.rejectVendor(params.id);
  }

  @Get("reviews/pending")
  listPendingReviews() {
    return this.moderationService.listPendingReviews();
  }

  @Get("reviews/flagged")
  listFlaggedReviews() {
    return this.moderationService.listFlaggedReviews();
  }
}
