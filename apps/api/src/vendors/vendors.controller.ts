import { Body, Controller, Get, Param, Post, Query, Req } from "@nestjs/common";
import type { AuthenticatedRequest } from "../auth/auth.types";
import { CreateReviewDto } from "./dto/create-review.dto";
import { CreateVendorDto } from "./dto/create-vendor.dto";
import { GetNearbyVendorsQueryDto } from "./dto/get-nearby-vendors-query.dto";
import { GetVendorReviewsQueryDto } from "./dto/get-vendor-reviews-query.dto";
import { GetVendorsQueryDto } from "./dto/get-vendors-query.dto";
import { VendorSummaryService } from "./summary/vendor-summary.service";
import { VendorIdParamDto } from "./dto/vendor-id-param.dto";
import { VendorsService } from "./vendors.service";

@Controller("vendors")
export class VendorsController {
  constructor(
    private readonly vendorsService: VendorsService,
    private readonly vendorSummaryService: VendorSummaryService,
  ) {}

  @Post()
  create(@Body() body: CreateVendorDto, @Req() req: AuthenticatedRequest) {
    return this.vendorsService.create(body, req.authUserId);
  }

  @Get()
  findAll(@Query() query: GetVendorsQueryDto) {
    return this.vendorsService.findAll(query);
  }

  @Get("nearby")
  findNearby(@Query() query: GetNearbyVendorsQueryDto) {
    return this.vendorsService.findNearby(query);
  }

  @Get(":id")
  findOne(@Param() params: VendorIdParamDto) {
    return this.vendorsService.findOne(params.id);
  }

  @Get(":id/reviews")
  listReviews(
    @Param() params: VendorIdParamDto,
    @Query() query: GetVendorReviewsQueryDto,
  ) {
    return this.vendorsService.listReviews(params.id, query);
  }

  @Post(":id/reviews")
  createReview(
    @Param() params: VendorIdParamDto,
    @Body() body: CreateReviewDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.vendorsService.createReview(params.id, body, req.authUserId);
  }

  @Post(":id/summary/regenerate")
  regenerateSummary(@Param() params: VendorIdParamDto) {
    return this.vendorSummaryService.triggerRegeneration(params.id);
  }
}
