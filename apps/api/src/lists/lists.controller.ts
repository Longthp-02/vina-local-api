import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import type { AuthenticatedRequest } from "../auth/auth.types";
import { AddVendorToListDto } from "./dto/add-vendor-to-list.dto";
import { CreateListDto } from "./dto/create-list.dto";
import { CreateListCommentDto } from "./dto/create-list-comment.dto";
import { GetListsQueryDto } from "./dto/get-lists-query.dto";
import { ListIdParamDto } from "./dto/list-id-param.dto";
import { ListVendorParamDto } from "./dto/list-vendor-param.dto";
import { NotificationIdParamDto } from "./dto/notification-id-param.dto";
import { UpdateListDto } from "./dto/update-list.dto";
import { UserIdParamDto } from "./dto/user-id-param.dto";
import { ListsService } from "./lists.service";

@Controller()
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Get("lists/public")
  listPublic(
    @Query() query: GetListsQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.listsService.listPublic(query, req.authUserId);
  }

  @Get("lists/top")
  listTop(@Query() query: GetListsQueryDto, @Req() req: AuthenticatedRequest) {
    return this.listsService.listTop(query, req.authUserId);
  }

  @Get("users/me/lists")
  listMine(@Req() req: AuthenticatedRequest) {
    return this.listsService.listMine(req.authUserId);
  }

  @Get("users/suggested-creators")
  getSuggestedCreators(@Req() req: AuthenticatedRequest) {
    return this.listsService.getSuggestedCreators(req.authUserId);
  }

  @Get("feed/lists")
  getFollowingFeed(
    @Query() query: GetListsQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.listsService.getFollowingFeed(query, req.authUserId);
  }

  @Get("users/:id/profile")
  getCreatorProfile(
    @Param() params: UserIdParamDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.listsService.getCreatorProfile(params.id, req.authUserId);
  }

  @Get("notifications")
  listNotifications(@Req() req: AuthenticatedRequest) {
    return this.listsService.listNotifications(req.authUserId);
  }

  @Get("lists/:id")
  findOne(@Param() params: ListIdParamDto, @Req() req: AuthenticatedRequest) {
    return this.listsService.findOne(params.id, req.authUserId);
  }

  @Get("lists/:id/comments")
  listComments(
    @Param() params: ListIdParamDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.listsService.listComments(params.id, req.authUserId);
  }

  @Post("lists")
  create(@Body() body: CreateListDto, @Req() req: AuthenticatedRequest) {
    return this.listsService.create(body, req.authUserId);
  }

  @Post("lists/:id/comments")
  createComment(
    @Param() params: ListIdParamDto,
    @Body() body: CreateListCommentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.listsService.createComment(params.id, body, req.authUserId);
  }

  @Post("lists/:id/report")
  reportList(
    @Param() params: ListIdParamDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.listsService.reportList(params.id, req.authUserId);
  }

  @Post("lists/comments/:id/report")
  reportComment(
    @Param() params: ListIdParamDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.listsService.reportComment(params.id, req.authUserId);
  }

  @Patch("lists/:id")
  update(
    @Param() params: ListIdParamDto,
    @Body() body: UpdateListDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.listsService.update(params.id, body, req.authUserId);
  }

  @Delete("lists/:id")
  remove(@Param() params: ListIdParamDto, @Req() req: AuthenticatedRequest) {
    return this.listsService.remove(params.id, req.authUserId);
  }

  @Post("lists/:id/vendors")
  addVendor(
    @Param() params: ListIdParamDto,
    @Body() body: AddVendorToListDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.listsService.addVendor(params.id, body, req.authUserId);
  }

  @Delete("lists/:id/vendors/:vendorId")
  removeVendor(
    @Param() params: ListVendorParamDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.listsService.removeVendor(
      params.id,
      params.vendorId,
      req.authUserId,
    );
  }

  @Post("lists/:id/like")
  like(@Param() params: ListIdParamDto, @Req() req: AuthenticatedRequest) {
    return this.listsService.like(params.id, req.authUserId);
  }

  @Delete("lists/:id/like")
  unlike(@Param() params: ListIdParamDto, @Req() req: AuthenticatedRequest) {
    return this.listsService.unlike(params.id, req.authUserId);
  }

  @Post("users/:id/follow")
  followUser(
    @Param() params: UserIdParamDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.listsService.followUser(params.id, req.authUserId);
  }

  @Delete("users/:id/follow")
  unfollowUser(
    @Param() params: UserIdParamDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.listsService.unfollowUser(params.id, req.authUserId);
  }

  @Post("notifications/:id/read")
  markNotificationRead(
    @Param() params: NotificationIdParamDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.listsService.markNotificationRead(params.id, req.authUserId);
  }

  @Post("notifications/read-all")
  markAllNotificationsRead(@Req() req: AuthenticatedRequest) {
    return this.listsService.markAllNotificationsRead(req.authUserId);
  }
}
