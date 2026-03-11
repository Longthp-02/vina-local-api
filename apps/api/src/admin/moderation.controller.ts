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

  @Get("list-comments/reported")
  listReportedListComments() {
    return this.moderationService.listReportedListComments();
  }

  @Get("lists/reported")
  listReportedLists() {
    return this.moderationService.listReportedLists();
  }

  @Get("lists/hidden")
  listHiddenLists() {
    return this.moderationService.listHiddenLists();
  }

  @Get("list-comments/hidden")
  listHiddenListComments() {
    return this.moderationService.listHiddenListComments();
  }

  @Post("lists/:id/hide")
  hideList(@Param() params: IdParamDto) {
    return this.moderationService.hideList(params.id);
  }

  @Post("lists/:id/restore")
  restoreList(@Param() params: IdParamDto) {
    return this.moderationService.restoreList(params.id);
  }

  @Post("lists/:id/clear-reports")
  clearListReports(@Param() params: IdParamDto) {
    return this.moderationService.clearListReports(params.id);
  }

  @Post("list-comments/:id/hide")
  hideListComment(@Param() params: IdParamDto) {
    return this.moderationService.hideListComment(params.id);
  }

  @Post("list-comments/:id/restore")
  restoreListComment(@Param() params: IdParamDto) {
    return this.moderationService.restoreListComment(params.id);
  }

  @Post("list-comments/:id/clear-reports")
  clearListCommentReports(@Param() params: IdParamDto) {
    return this.moderationService.clearListCommentReports(params.id);
  }
}
