import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Prisma, VendorListVisibility, VendorStatus } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { AddVendorToListDto } from "./dto/add-vendor-to-list.dto";
import { CreateListDto } from "./dto/create-list.dto";
import { CreateListCommentDto } from "./dto/create-list-comment.dto";
import { GetListsQueryDto } from "./dto/get-lists-query.dto";
import { UpdateListDto } from "./dto/update-list.dto";

const listInclude = {
  user: {
    select: {
      id: true,
      displayName: true,
      phoneNumber: true,
    },
  },
  items: {
    orderBy: {
      position: "asc",
    },
    include: {
      vendor: true,
    },
  },
} satisfies Prisma.VendorListInclude;

type VendorListWithRelations = Prisma.VendorListGetPayload<{
  include: typeof listInclude;
}>;

@Injectable()
export class ListsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(query: GetListsQueryDto, authUserId?: string) {
    const lists = await this.prisma.vendorList.findMany({
      where: {
        visibility: VendorListVisibility.PUBLIC,
        hiddenAt: null,
      },
      skip: query.offset,
      take: query.limit,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      include: listInclude,
    });

    return this.attachLikedState(lists, authUserId);
  }

  async listMine(authUserId?: string) {
    if (!authUserId) {
      throw new UnauthorizedException("Authentication required");
    }

    const lists = await this.prisma.vendorList.findMany({
      where: {
        userId: authUserId,
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      include: listInclude,
    });

    return this.attachLikedState(lists, authUserId);
  }

  async getCreatorProfile(userId: string, authUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        phoneNumber: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const lists = await this.prisma.vendorList.findMany({
      where: {
        userId,
        visibility: VendorListVisibility.PUBLIC,
        hiddenAt: null,
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      include: listInclude,
    });

    let followedByMe = false;

    if (authUserId) {
      const follow = await this.prisma.userFollow.findUnique({
        where: {
          followerUserId_followingUserId: {
            followerUserId: authUserId,
            followingUserId: userId,
          },
        },
        select: { id: true },
      });

      followedByMe = Boolean(follow);
    }

    return {
      user: {
        id: user.id,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        followerCount: user._count.followers,
        followingCount: user._count.following,
        followedByMe,
      },
      lists: await this.attachLikedState(lists, authUserId),
    };
  }

  async getFollowingFeed(query: GetListsQueryDto, authUserId?: string) {
    if (!authUserId) {
      throw new UnauthorizedException("Authentication required");
    }

    const following = await this.prisma.userFollow.findMany({
      where: {
        followerUserId: authUserId,
      },
      select: {
        followingUserId: true,
      },
    });

    const followingUserIds = following.map((item) => item.followingUserId);

    if (followingUserIds.length === 0) {
      return [];
    }

    const lists = await this.prisma.vendorList.findMany({
      where: {
        userId: {
          in: followingUserIds,
        },
        visibility: VendorListVisibility.PUBLIC,
        hiddenAt: null,
      },
      skip: query.offset,
      take: query.limit,
      orderBy: [{ createdAt: "desc" }, { updatedAt: "desc" }],
      include: listInclude,
    });

    return this.attachLikedState(lists, authUserId);
  }

  async getSuggestedCreators(authUserId?: string) {
    const blockedUserIds = authUserId
      ? [
          authUserId,
          ...(
            await this.prisma.userFollow.findMany({
              where: {
                followerUserId: authUserId,
              },
              select: {
                followingUserId: true,
              },
            })
          ).map((follow) => follow.followingUserId),
        ]
      : [];

    const creators = await this.prisma.user.findMany({
      where: {
        vendorLists: {
          some: {
            visibility: VendorListVisibility.PUBLIC,
            hiddenAt: null,
          },
        },
        id: blockedUserIds.length > 0 ? { notIn: blockedUserIds } : undefined,
      },
      select: {
        id: true,
        displayName: true,
        phoneNumber: true,
        _count: {
          select: {
            followers: true,
            vendorLists: true,
          },
        },
      },
      take: 8,
      orderBy: [
        {
          followers: {
            _count: "desc",
          },
        },
        {
          vendorLists: {
            _count: "desc",
          },
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return creators.map((creator) => ({
      id: creator.id,
      displayName: creator.displayName,
      phoneNumber: creator.phoneNumber,
      followerCount: creator._count.followers,
      publicListCount: creator._count.vendorLists,
    }));
  }

  async listTop(query: GetListsQueryDto, authUserId?: string) {
    const lists = await this.prisma.vendorList.findMany({
      where: {
        visibility: VendorListVisibility.PUBLIC,
        hiddenAt: null,
      },
      skip: query.offset,
      take: query.limit,
      orderBy: [
        { likeCount: "desc" },
        { viewCount: "desc" },
        { updatedAt: "desc" },
      ],
      include: listInclude,
    });

    return this.attachLikedState(lists, authUserId);
  }

  async findOne(id: string, authUserId?: string) {
    const list = await this.prisma.vendorList.findUnique({
      where: { id },
      include: listInclude,
    });

    if (!list) {
      throw new NotFoundException("List not found");
    }

    if (list.hiddenAt && list.userId !== authUserId) {
      throw new NotFoundException("List not found");
    }

    if (
      list.visibility === VendorListVisibility.PRIVATE &&
      list.userId !== authUserId
    ) {
      throw new NotFoundException("List not found");
    }

    if (list.visibility === VendorListVisibility.PUBLIC) {
      await this.prisma.vendorList.update({
        where: { id },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      });
      list.viewCount += 1;
    }

    return this.attachLikedState([list], authUserId).then(
      ([mappedList]) => mappedList,
    );
  }

  async listComments(id: string, authUserId?: string) {
    const list = await this.prisma.vendorList.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        visibility: true,
      },
    });

    if (!list) {
      throw new NotFoundException("List not found");
    }

    if (
      list.visibility === VendorListVisibility.PRIVATE &&
      list.userId !== authUserId
    ) {
      throw new NotFoundException("List not found");
    }

    return this.prisma.vendorListComment.findMany({
      where: {
        listId: id,
        hiddenAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            phoneNumber: true,
          },
        },
      },
    });
  }

  async createComment(
    id: string,
    input: CreateListCommentDto,
    authUserId?: string,
  ) {
    if (!authUserId) {
      throw new UnauthorizedException("Authentication required");
    }

    const list = await this.prisma.vendorList.findUnique({
      where: { id },
      select: {
        id: true,
        visibility: true,
      },
    });

    if (!list || list.visibility !== VendorListVisibility.PUBLIC) {
      throw new NotFoundException("List not found");
    }

    return this.prisma.vendorListComment.create({
      data: {
        listId: id,
        userId: authUserId,
        content: input.content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            phoneNumber: true,
          },
        },
      },
    });
  }

  async reportList(id: string, authUserId?: string) {
    if (!authUserId) {
      throw new UnauthorizedException("Authentication required");
    }

    const list = await this.prisma.vendorList.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        visibility: true,
        hiddenAt: true,
      },
    });

    if (
      !list ||
      list.visibility !== VendorListVisibility.PUBLIC ||
      list.hiddenAt
    ) {
      throw new NotFoundException("List not found");
    }

    if (list.userId === authUserId) {
      throw new BadRequestException("You cannot report your own list");
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.vendorListReport.create({
          data: {
            listId: id,
            userId: authUserId,
          },
        });

        await tx.vendorList.update({
          where: { id },
          data: {
            reportCount: {
              increment: 1,
            },
            reportedAt: new Date(),
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new BadRequestException("You already reported this list");
      }

      throw error;
    }

    return { success: true };
  }

  async reportComment(commentId: string, authUserId?: string) {
    if (!authUserId) {
      throw new UnauthorizedException("Authentication required");
    }

    const comment = await this.prisma.vendorListComment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        userId: true,
        hiddenAt: true,
        list: {
          select: {
            id: true,
            visibility: true,
          },
        },
      },
    });

    if (
      !comment ||
      comment.hiddenAt ||
      comment.list.visibility !== VendorListVisibility.PUBLIC
    ) {
      throw new NotFoundException("Comment not found");
    }

    if (comment.userId === authUserId) {
      throw new BadRequestException("You cannot report your own comment");
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.vendorListCommentReport.create({
          data: {
            commentId,
            userId: authUserId,
          },
        });

        await tx.vendorListComment.update({
          where: { id: commentId },
          data: {
            reportCount: {
              increment: 1,
            },
            reportedAt: new Date(),
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new BadRequestException("You already reported this comment");
      }

      throw error;
    }

    return { success: true };
  }

  async create(input: CreateListDto, authUserId?: string) {
    if (!authUserId) {
      throw new UnauthorizedException("Authentication required");
    }

    const slug = await this.buildUniqueSlug(input.title);

    const list = await this.prisma.vendorList.create({
      data: {
        userId: authUserId,
        title: input.title.trim(),
        slug,
        description: input.description?.trim() || null,
        visibility: input.visibility ?? VendorListVisibility.PRIVATE,
      },
      include: listInclude,
    });

    if (list.visibility === VendorListVisibility.PUBLIC) {
      await this.createListNotifications(list);
    }

    return this.attachLikedState([list], authUserId).then(
      ([mappedList]) => mappedList,
    );
  }

  async update(id: string, input: UpdateListDto, authUserId?: string) {
    const list = await this.ensureOwnedList(id, authUserId);
    const shouldNotifyFollowers =
      list.visibility !== VendorListVisibility.PUBLIC &&
      input.visibility === VendorListVisibility.PUBLIC;

    const slug =
      input.title && input.title.trim() !== list.title
        ? await this.buildUniqueSlug(input.title, id)
        : undefined;

    const updatedList = await this.prisma.vendorList.update({
      where: { id },
      data: {
        title: input.title?.trim(),
        slug,
        description:
          input.description !== undefined
            ? input.description.trim() || null
            : undefined,
        visibility: input.visibility,
      },
      include: listInclude,
    });

    if (shouldNotifyFollowers) {
      await this.createListNotifications(updatedList);
    }

    return this.attachLikedState([updatedList], authUserId).then(
      ([mappedList]) => mappedList,
    );
  }

  async remove(id: string, authUserId?: string) {
    await this.ensureOwnedList(id, authUserId);

    await this.prisma.vendorList.delete({
      where: { id },
    });

    return { success: true };
  }

  async addVendor(id: string, input: AddVendorToListDto, authUserId?: string) {
    await this.ensureOwnedList(id, authUserId);
    await this.ensureVendorCanBeSaved(input.vendorId);

    const existingItem = await this.prisma.vendorListItem.findUnique({
      where: {
        listId_vendorId: {
          listId: id,
          vendorId: input.vendorId,
        },
      },
      select: { id: true },
    });

    if (existingItem) {
      throw new BadRequestException("Vendor is already in this list");
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const currentCount = await tx.vendorListItem.count({
        where: {
          listId: id,
        },
      });

      await tx.vendorListItem.create({
        data: {
          listId: id,
          vendorId: input.vendorId,
          position: currentCount + 1,
        },
      });

      await tx.vendorList.update({
        where: { id },
        data: {
          itemCount: {
            increment: 1,
          },
        },
      });

      const list = await tx.vendorList.findUniqueOrThrow({
        where: { id },
        include: listInclude,
      });

      return list;
    });

    return this.attachLikedState([result], authUserId).then(
      ([mappedList]) => mappedList,
    );
  }

  async removeVendor(id: string, vendorId: string, authUserId?: string) {
    await this.ensureOwnedList(id, authUserId);

    const item = await this.prisma.vendorListItem.findUnique({
      where: {
        listId_vendorId: {
          listId: id,
          vendorId,
        },
      },
    });

    if (!item) {
      throw new NotFoundException("Vendor is not in this list");
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.vendorListItem.delete({
        where: {
          id: item.id,
        },
      });

      const remainingItems = await tx.vendorListItem.findMany({
        where: {
          listId: id,
        },
        orderBy: {
          position: "asc",
        },
      });

      await Promise.all(
        remainingItems.map((remainingItem, index) =>
          tx.vendorListItem.update({
            where: {
              id: remainingItem.id,
            },
            data: {
              position: index + 1,
            },
          }),
        ),
      );

      await tx.vendorList.update({
        where: { id },
        data: {
          itemCount: remainingItems.length,
        },
      });

      const list = await tx.vendorList.findUniqueOrThrow({
        where: { id },
        include: listInclude,
      });

      return list;
    });

    return this.attachLikedState([result], authUserId).then(
      ([mappedList]) => mappedList,
    );
  }

  async like(id: string, authUserId?: string) {
    if (!authUserId) {
      throw new UnauthorizedException("Authentication required");
    }

    const list = await this.prisma.vendorList.findUnique({
      where: { id },
      select: {
        id: true,
        visibility: true,
      },
    });

    if (!list || list.visibility !== VendorListVisibility.PUBLIC) {
      throw new NotFoundException("List not found");
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const existingLike = await tx.vendorListLike.findUnique({
        where: {
          listId_userId: {
            listId: id,
            userId: authUserId,
          },
        },
      });

      if (existingLike) {
        const current = await tx.vendorList.findUniqueOrThrow({
          where: { id },
          include: listInclude,
        });
        return current;
      }

      await tx.vendorListLike.create({
        data: {
          listId: id,
          userId: authUserId,
        },
      });

      await tx.vendorList.update({
        where: { id },
        data: {
          likeCount: {
            increment: 1,
          },
        },
      });

      return tx.vendorList.findUniqueOrThrow({
        where: { id },
        include: listInclude,
      });
    });

    return this.attachLikedState([result], authUserId).then(
      ([mappedList]) => mappedList,
    );
  }

  async unlike(id: string, authUserId?: string) {
    if (!authUserId) {
      throw new UnauthorizedException("Authentication required");
    }

    const list = await this.prisma.vendorList.findUnique({
      where: { id },
      select: {
        id: true,
        visibility: true,
      },
    });

    if (!list || list.visibility !== VendorListVisibility.PUBLIC) {
      throw new NotFoundException("List not found");
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const existingLike = await tx.vendorListLike.findUnique({
        where: {
          listId_userId: {
            listId: id,
            userId: authUserId,
          },
        },
      });

      if (existingLike) {
        await tx.vendorListLike.delete({
          where: {
            listId_userId: {
              listId: id,
              userId: authUserId,
            },
          },
        });

        await tx.vendorList.update({
          where: { id },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
        });
      }

      return tx.vendorList.findUniqueOrThrow({
        where: { id },
        include: listInclude,
      });
    });

    return this.attachLikedState([result], authUserId).then(
      ([mappedList]) => mappedList,
    );
  }

  async followUser(userId: string, authUserId?: string) {
    if (!authUserId) {
      throw new UnauthorizedException("Authentication required");
    }

    if (authUserId === userId) {
      throw new BadRequestException("You cannot follow yourself");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    await this.prisma.userFollow.upsert({
      where: {
        followerUserId_followingUserId: {
          followerUserId: authUserId,
          followingUserId: userId,
        },
      },
      update: {},
      create: {
        followerUserId: authUserId,
        followingUserId: userId,
      },
    });

    return this.getCreatorProfile(userId, authUserId);
  }

  async unfollowUser(userId: string, authUserId?: string) {
    if (!authUserId) {
      throw new UnauthorizedException("Authentication required");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    await this.prisma.userFollow.deleteMany({
      where: {
        followerUserId: authUserId,
        followingUserId: userId,
      },
    });

    return this.getCreatorProfile(userId, authUserId);
  }

  async listNotifications(authUserId?: string) {
    if (!authUserId) {
      throw new UnauthorizedException("Authentication required");
    }

    return this.prisma.userNotification.findMany({
      where: {
        userId: authUserId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
    });
  }

  async markNotificationRead(id: string, authUserId?: string) {
    if (!authUserId) {
      throw new UnauthorizedException("Authentication required");
    }

    const notification = await this.prisma.userNotification.findFirst({
      where: {
        id,
        userId: authUserId,
      },
      select: {
        id: true,
      },
    });

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    return this.prisma.userNotification.update({
      where: { id },
      data: {
        readAt: new Date(),
      },
    });
  }

  async markAllNotificationsRead(authUserId?: string) {
    if (!authUserId) {
      throw new UnauthorizedException("Authentication required");
    }

    await this.prisma.userNotification.updateMany({
      where: {
        userId: authUserId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return { success: true };
  }

  private async ensureOwnedList(id: string, authUserId?: string) {
    if (!authUserId) {
      throw new UnauthorizedException("Authentication required");
    }

    const list = await this.prisma.vendorList.findUnique({
      where: { id },
    });

    if (!list) {
      throw new NotFoundException("List not found");
    }

    if (list.userId !== authUserId) {
      throw new NotFoundException("List not found");
    }

    return list;
  }

  private async ensureVendorCanBeSaved(vendorId: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!vendor) {
      throw new NotFoundException("Vendor not found");
    }

    if (vendor.status !== VendorStatus.APPROVED) {
      throw new BadRequestException(
        "Only approved vendors can be added to lists",
      );
    }
  }

  private async buildUniqueSlug(title: string, excludeId?: string) {
    const base = this.slugify(title);
    let slug = base;
    let counter = 1;

    while (
      await this.prisma.vendorList.findFirst({
        where: {
          slug,
          id: excludeId ? { not: excludeId } : undefined,
        },
        select: { id: true },
      })
    ) {
      counter += 1;
      slug = `${base}-${counter}`;
    }

    return slug;
  }

  private slugify(value: string) {
    const normalized = value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const cleaned = normalized
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);

    return cleaned || `list-${Date.now()}`;
  }

  private async createListNotifications(list: VendorListWithRelations) {
    const followers = await this.prisma.userFollow.findMany({
      where: {
        followingUserId: list.userId,
      },
      select: {
        followerUserId: true,
      },
    });

    if (followers.length === 0) {
      return;
    }

    await this.prisma.userNotification.createMany({
      data: followers.map((follow) => ({
        userId: follow.followerUserId,
        actorUserId: list.userId,
        listId: list.id,
        type: "NEW_PUBLIC_LIST",
        title: `${list.user.displayName} published a new list`,
        body: list.title,
      })),
    });
  }

  private async attachLikedState(
    lists: VendorListWithRelations[],
    authUserId?: string,
  ) {
    if (!authUserId || lists.length === 0) {
      return lists.map((list) => ({
        ...list,
        likedByMe: false,
      }));
    }

    const likes = await this.prisma.vendorListLike.findMany({
      where: {
        userId: authUserId,
        listId: {
          in: lists.map((list) => list.id),
        },
      },
      select: {
        listId: true,
      },
    });

    const likedListIds = new Set(likes.map((like) => like.listId));

    return lists.map((list) => ({
      ...list,
      likedByMe: likedListIds.has(list.id),
    }));
  }
}
