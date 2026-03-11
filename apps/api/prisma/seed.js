const { PrismaClient, VendorListVisibility, VendorStatus } = require("@prisma/client");

const prisma = new PrismaClient();

const vendors = [
  {
    name: "Pho Hoa Pasteur",
    slug: "pho-hoa-pasteur-q3",
    description: "Traditional southern-style pho with clear, aromatic broth.",
    latitude: 10.7851,
    longitude: 106.6957,
    addressText: "260C Pasteur Street",
    district: "District 3",
    city: "Ho Chi Minh City",
    category: "Pho",
    priceMin: 70000,
    priceMax: 120000,
    openHoursJson: { daily: "06:00-22:00" },
    status: "APPROVED",
    aiSummary: "Reliable classic pho spot for breakfast and late dinner.",
  },
  {
    name: "Com Tam Ba Ghien",
    slug: "com-tam-ba-ghien-tan-binh",
    description: "Broken rice plates known for large grilled pork chops.",
    latitude: 10.7995,
    longitude: 106.6531,
    addressText: "84 Dang Van Ngu Street",
    district: "Tan Binh District",
    city: "Ho Chi Minh City",
    category: "Com Tam",
    priceMin: 50000,
    priceMax: 95000,
    openHoursJson: { daily: "07:00-21:30" },
    status: "APPROVED",
    aiSummary: "Famous com tam with generous portions and smoky grilled meat.",
  },
  {
    name: "Bun Bo Hue O Xuan",
    slug: "bun-bo-hue-o-xuan-binh-thanh",
    description: "Spicy Hue beef noodle soup with rich lemongrass broth.",
    latitude: 10.8058,
    longitude: 106.7144,
    addressText: "12 Dinh Tien Hoang Street",
    district: "Binh Thanh District",
    city: "Ho Chi Minh City",
    category: "Bun Bo Hue",
    priceMin: 55000,
    priceMax: 90000,
    openHoursJson: { daily: "06:30-21:00" },
    status: "APPROVED",
    aiSummary: "Comforting spicy noodle soup with balanced broth depth.",
  },
  {
    name: "Hu Tieu Nam Vang Thanh Dat",
    slug: "hu-tieu-nam-vang-thanh-dat-q10",
    description: "Dry and soup hu tieu with pork, shrimp, and quail egg.",
    latitude: 10.7747,
    longitude: 106.6678,
    addressText: "34 Nguyen Tri Phuong Street",
    district: "District 10",
    city: "Ho Chi Minh City",
    category: "Hu Tieu",
    priceMin: 50000,
    priceMax: 85000,
    openHoursJson: { daily: "06:00-22:00" },
    status: "APPROVED",
    aiSummary: "Popular hu tieu place with both dry and broth options.",
  },
  {
    name: "Banh Mi Huynh Hoa",
    slug: "banh-mi-huynh-hoa-q1",
    description: "Loaded Vietnamese baguette with pate and cold cuts.",
    latitude: 10.7732,
    longitude: 106.6915,
    addressText: "26 Le Thi Rieng Street",
    district: "District 1",
    city: "Ho Chi Minh City",
    category: "Banh Mi",
    priceMin: 58000,
    priceMax: 75000,
    openHoursJson: { daily: "14:30-23:00" },
    status: "APPROVED",
    aiSummary: "Iconic banh mi known for rich fillings and long queues.",
  },
  {
    name: "Bun Thit Nuong Chi Tuyen",
    slug: "bun-thit-nuong-chi-tuyen-phu-nhuan",
    description: "Grilled pork vermicelli bowls with fresh herbs and fish sauce.",
    latitude: 10.7992,
    longitude: 106.679,
    addressText: "9 Nguyen Dinh Chieu Street",
    district: "Phu Nhuan District",
    city: "Ho Chi Minh City",
    category: "Bun Thit Nuong",
    priceMin: 45000,
    priceMax: 70000,
    openHoursJson: { daily: "09:00-21:00" },
    status: "APPROVED",
    aiSummary: "Balanced bun thit nuong with fragrant grilled pork.",
  },
  {
    name: "Banh Xeo 46A",
    slug: "banh-xeo-46a-dinh-cong-trang",
    description: "Crispy southern pancakes served with herbs and dipping sauce.",
    latitude: 10.7903,
    longitude: 106.6934,
    addressText: "46A Dinh Cong Trang Street",
    district: "District 1",
    city: "Ho Chi Minh City",
    category: "Banh Xeo",
    priceMin: 90000,
    priceMax: 140000,
    openHoursJson: { daily: "10:00-21:30" },
    status: "APPROVED",
    aiSummary: "Well-known crispy banh xeo with plenty of greens.",
  },
  {
    name: "Oc Dao",
    slug: "oc-dao-nguyen-thai-hoc-q1",
    description: "Sea snail and shellfish dishes with bold garlic and butter sauces.",
    latitude: 10.7679,
    longitude: 106.6895,
    addressText: "212B Nguyen Trai Street",
    district: "District 1",
    city: "Ho Chi Minh City",
    category: "Seafood",
    priceMin: 70000,
    priceMax: 180000,
    openHoursJson: { daily: "15:00-23:00" },
    status: "APPROVED",
    aiSummary: "Busy evening seafood spot with many sauce options.",
  },
  {
    name: "Che Ha Ky",
    slug: "che-ha-ky-q5",
    description: "Traditional sweet dessert soups and herbal drinks.",
    latitude: 10.7543,
    longitude: 106.6639,
    addressText: "138 Chau Van Liem Street",
    district: "District 5",
    city: "Ho Chi Minh City",
    category: "Dessert",
    priceMin: 20000,
    priceMax: 45000,
    openHoursJson: { daily: "10:00-22:00" },
    status: "APPROVED",
    aiSummary: "Classic Chinatown dessert stop for sweet soups and drinks.",
  },
  {
    name: "Lau De 404",
    slug: "lau-de-404-nguyen-chi-thanh-q10",
    description: "Goat hotpot and grilled dishes for group meals.",
    latitude: 10.7637,
    longitude: 106.6714,
    addressText: "404 Nguyen Chi Thanh Street",
    district: "District 10",
    city: "Ho Chi Minh City",
    category: "Hotpot",
    priceMin: 120000,
    priceMax: 280000,
    openHoursJson: { daily: "11:00-23:00" },
    status: "APPROVED",
    aiSummary: "Casual spot for hearty goat hotpot and grilled plates.",
  },
  {
    name: "Mi Quang My Son",
    slug: "mi-quang-my-son-q3",
    description: "Central-style turmeric noodles with shrimp and pork.",
    latitude: 10.7817,
    longitude: 106.6849,
    addressText: "96 Vo Van Tan Street",
    district: "District 3",
    city: "Ho Chi Minh City",
    category: "Mi Quang",
    priceMin: 50000,
    priceMax: 85000,
    openHoursJson: { daily: "07:00-21:00" },
    status: "APPROVED",
    aiSummary: "Comforting central Vietnamese noodles with rich toppings.",
  },
  {
    name: "Bo La Lot Co Lien",
    slug: "bo-la-lot-co-lien-go-vap",
    description: "Betel-leaf wrapped beef served with vermicelli and rice paper.",
    latitude: 10.8391,
    longitude: 106.6684,
    addressText: "31 Quang Trung Street",
    district: "Go Vap District",
    city: "Ho Chi Minh City",
    category: "Grill",
    priceMin: 60000,
    priceMax: 110000,
    openHoursJson: { daily: "16:00-22:00" },
    status: "APPROVED",
    aiSummary: "Local favorite for smoky bo la lot in the evening.",
  },
];

const users = [
  {
    key: "minh",
    displayName: "Minh Tran",
    phoneNumber: "+84901111001",
  },
  {
    key: "linh",
    displayName: "Linh Nguyen",
    phoneNumber: "+84901111002",
  },
  {
    key: "bao",
    displayName: "Bao Le",
    phoneNumber: "+84901111003",
  },
  {
    key: "hana",
    displayName: "Hana Pham",
    phoneNumber: "+81901111004",
  },
];

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function seedVendors() {
  const vendorMap = {};

  for (const vendor of vendors) {
    const savedVendor = await prisma.vendor.upsert({
      where: { slug: vendor.slug },
      update: vendor,
      create: vendor,
    });

    vendorMap[vendor.slug] = savedVendor;
  }

  return vendorMap;
}

async function seedUsers() {
  const userMap = {};

  for (const user of users) {
    const savedUser = await prisma.user.upsert({
      where: { phoneNumber: user.phoneNumber },
      update: {
        displayName: user.displayName,
        phoneVerifiedAt: new Date(),
      },
      create: {
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        phoneVerifiedAt: new Date(),
      },
    });

    userMap[user.key] = savedUser;
  }

  return userMap;
}

async function seedLists(userMap, vendorMap) {
  const listDefinitions = [
    {
      key: "minh-breakfast",
      userKey: "minh",
      title: "Sai Gon Breakfast Classics",
      slug: "sai-gon-breakfast-classics",
      description: "Reliable early spots for pho, hu tieu, and morning noodles.",
      visibility: VendorListVisibility.PUBLIC,
      likeCount: 2,
      viewCount: 18,
      itemSlugs: ["pho-hoa-pasteur-q3", "hu-tieu-nam-vang-thanh-dat-q10", "mi-quang-my-son-q3"],
      createdAt: daysAgo(10),
      updatedAt: hoursAgo(18),
    },
    {
      key: "linh-night",
      userKey: "linh",
      title: "Late Night Sai Gon",
      slug: "late-night-sai-gon",
      description: "Good options when dinner turns into supper.",
      visibility: VendorListVisibility.PUBLIC,
      likeCount: 3,
      viewCount: 27,
      itemSlugs: ["oc-dao-nguyen-thai-hoc-q1", "banh-mi-huynh-hoa-q1", "lau-de-404-nguyen-chi-thanh-q10"],
      createdAt: daysAgo(7),
      updatedAt: hoursAgo(12),
    },
    {
      key: "bao-budget",
      userKey: "bao",
      title: "Under 70k Favorites",
      slug: "under-70k-favorites",
      description: "Casual picks when you want flavor without spending much.",
      visibility: VendorListVisibility.PUBLIC,
      likeCount: 1,
      viewCount: 9,
      itemSlugs: ["bun-thit-nuong-chi-tuyen-phu-nhuan", "che-ha-ky-q5", "com-tam-ba-ghien-tan-binh"],
      createdAt: daysAgo(5),
      updatedAt: hoursAgo(6),
    },
    {
      key: "hana-japanese",
      userKey: "hana",
      title: "First Week in Ho Chi Minh City",
      slug: "first-week-in-ho-chi-minh-city",
      description: "A visitor-friendly starter list with classic local dishes.",
      visibility: VendorListVisibility.PUBLIC,
      likeCount: 4,
      viewCount: 31,
      itemSlugs: ["pho-hoa-pasteur-q3", "banh-xeo-46a-dinh-cong-trang", "banh-mi-huynh-hoa-q1"],
      createdAt: daysAgo(3),
      updatedAt: hoursAgo(2),
    },
    {
      key: "minh-private",
      userKey: "minh",
      title: "Need To Revisit",
      slug: "need-to-revisit",
      description: "Private note list for places worth another try.",
      visibility: VendorListVisibility.PRIVATE,
      likeCount: 0,
      viewCount: 0,
      itemSlugs: ["bun-bo-hue-o-xuan-binh-thanh", "bo-la-lot-co-lien-go-vap"],
      createdAt: daysAgo(2),
      updatedAt: hoursAgo(4),
    },
    {
      key: "hidden-list",
      userKey: "bao",
      title: "Too Much Hype",
      slug: "too-much-hype",
      description: "An intentionally controversial public list to test moderation flows.",
      visibility: VendorListVisibility.PUBLIC,
      likeCount: 0,
      viewCount: 2,
      reportCount: 2,
      reportedAt: hoursAgo(5),
      hiddenAt: hoursAgo(3),
      itemSlugs: ["banh-mi-huynh-hoa-q1", "oc-dao-nguyen-thai-hoc-q1"],
      createdAt: daysAgo(1),
      updatedAt: hoursAgo(3),
    },
  ];

  const listMap = {};

  for (const definition of listDefinitions) {
    const list = await prisma.vendorList.upsert({
      where: { slug: definition.slug },
      update: {
        userId: userMap[definition.userKey].id,
        title: definition.title,
        description: definition.description,
        visibility: definition.visibility,
        likeCount: definition.likeCount,
        viewCount: definition.viewCount,
        itemCount: definition.itemSlugs.length,
        reportCount: definition.reportCount ?? 0,
        reportedAt: definition.reportedAt ?? null,
        hiddenAt: definition.hiddenAt ?? null,
        createdAt: definition.createdAt,
        updatedAt: definition.updatedAt,
      },
      create: {
        userId: userMap[definition.userKey].id,
        title: definition.title,
        slug: definition.slug,
        description: definition.description,
        visibility: definition.visibility,
        likeCount: definition.likeCount,
        viewCount: definition.viewCount,
        itemCount: definition.itemSlugs.length,
        reportCount: definition.reportCount ?? 0,
        reportedAt: definition.reportedAt ?? null,
        hiddenAt: definition.hiddenAt ?? null,
        createdAt: definition.createdAt,
        updatedAt: definition.updatedAt,
      },
    });

    await prisma.vendorListItem.deleteMany({
      where: { listId: list.id },
    });

    for (const [index, itemSlug] of definition.itemSlugs.entries()) {
      await prisma.vendorListItem.create({
        data: {
          listId: list.id,
          vendorId: vendorMap[itemSlug].id,
          position: index + 1,
          createdAt: definition.updatedAt,
        },
      });
    }

    listMap[definition.key] = list;
  }

  return listMap;
}

async function seedLikes(userMap, listMap) {
  const likes = [
    { userKey: "linh", listKey: "minh-breakfast" },
    { userKey: "hana", listKey: "minh-breakfast" },
    { userKey: "minh", listKey: "linh-night" },
    { userKey: "bao", listKey: "linh-night" },
    { userKey: "hana", listKey: "linh-night" },
    { userKey: "minh", listKey: "bao-budget" },
    { userKey: "minh", listKey: "hana-japanese" },
    { userKey: "linh", listKey: "hana-japanese" },
    { userKey: "bao", listKey: "hana-japanese" },
    { userKey: "hana", listKey: "hana-japanese" },
  ];

  await prisma.vendorListLike.deleteMany({
    where: {
      listId: {
        in: likes.map((like) => listMap[like.listKey].id),
      },
    },
  });

  for (const like of likes) {
    await prisma.vendorListLike.create({
      data: {
        userId: userMap[like.userKey].id,
        listId: listMap[like.listKey].id,
      },
    });
  }
}

async function seedFollows(userMap) {
  const follows = [
    { follower: "minh", following: "linh" },
    { follower: "minh", following: "hana" },
    { follower: "linh", following: "minh" },
    { follower: "bao", following: "hana" },
    { follower: "hana", following: "minh" },
  ];

  await prisma.userFollow.deleteMany({
    where: {
      OR: follows.map((follow) => ({
        followerUserId: userMap[follow.follower].id,
        followingUserId: userMap[follow.following].id,
      })),
    },
  });

  for (const follow of follows) {
    await prisma.userFollow.create({
      data: {
        followerUserId: userMap[follow.follower].id,
        followingUserId: userMap[follow.following].id,
      },
    });
  }
}

async function seedComments(userMap, listMap) {
  const comments = [
    {
      key: "comment-good",
      listKey: "hana-japanese",
      userKey: "minh",
      content: "This is a very solid starter list for friends visiting the city.",
      createdAt: hoursAgo(20),
    },
    {
      key: "comment-spicy",
      listKey: "linh-night",
      userKey: "bao",
      content: "Oc Dao is the right call here. I would add one more 24h pho spot.",
      createdAt: hoursAgo(10),
    },
    {
      key: "comment-reported",
      listKey: "bao-budget",
      userKey: "hana",
      content: "This take is wrong and the list title is clickbait.",
      reportCount: 1,
      reportedAt: hoursAgo(3),
      createdAt: hoursAgo(8),
    },
    {
      key: "comment-hidden",
      listKey: "minh-breakfast",
      userKey: "bao",
      content: "Spam comment hidden for moderation testing.",
      reportCount: 2,
      reportedAt: hoursAgo(6),
      hiddenAt: hoursAgo(4),
      createdAt: hoursAgo(7),
    },
  ];

  const commentMap = {};

  for (const comment of comments) {
    const existing = await prisma.vendorListComment.findFirst({
      where: {
        listId: listMap[comment.listKey].id,
        userId: userMap[comment.userKey].id,
        content: comment.content,
      },
      select: { id: true },
    });

    const savedComment = existing
      ? await prisma.vendorListComment.update({
          where: { id: existing.id },
          data: {
            content: comment.content,
            reportCount: comment.reportCount ?? 0,
            reportedAt: comment.reportedAt ?? null,
            hiddenAt: comment.hiddenAt ?? null,
            createdAt: comment.createdAt,
          },
        })
      : await prisma.vendorListComment.create({
          data: {
            listId: listMap[comment.listKey].id,
            userId: userMap[comment.userKey].id,
            content: comment.content,
            reportCount: comment.reportCount ?? 0,
            reportedAt: comment.reportedAt ?? null,
            hiddenAt: comment.hiddenAt ?? null,
            createdAt: comment.createdAt,
          },
        });

    commentMap[comment.key] = savedComment;
  }

  return commentMap;
}

async function seedReports(userMap, listMap, commentMap) {
  const listReports = [
    { listKey: "hidden-list", userKey: "minh" },
    { listKey: "hidden-list", userKey: "linh" },
  ];

  const commentReports = [
    { commentKey: "comment-reported", userKey: "minh" },
    { commentKey: "comment-hidden", userKey: "linh" },
    { commentKey: "comment-hidden", userKey: "hana" },
  ];

  await prisma.vendorListReport.deleteMany({
    where: {
      listId: {
        in: listReports.map((report) => listMap[report.listKey].id),
      },
    },
  });

  await prisma.vendorListCommentReport.deleteMany({
    where: {
      commentId: {
        in: commentReports.map((report) => commentMap[report.commentKey].id),
      },
    },
  });

  for (const report of listReports) {
    await prisma.vendorListReport.create({
      data: {
        listId: listMap[report.listKey].id,
        userId: userMap[report.userKey].id,
      },
    });
  }

  for (const report of commentReports) {
    await prisma.vendorListCommentReport.create({
      data: {
        commentId: commentMap[report.commentKey].id,
        userId: userMap[report.userKey].id,
      },
    });
  }
}

async function seedNotifications(userMap, listMap) {
  const notifications = [
    {
      userKey: "minh",
      actorUserKey: "hana",
      listKey: "hana-japanese",
      type: "list_published",
      title: "Hana published a new list",
      body: "First Week in Ho Chi Minh City is now public.",
      readAt: null,
      createdAt: hoursAgo(2),
    },
    {
      userKey: "bao",
      actorUserKey: "hana",
      listKey: "hana-japanese",
      type: "list_published",
      title: "Hana published a new list",
      body: "First Week in Ho Chi Minh City is now public.",
      readAt: null,
      createdAt: hoursAgo(2),
    },
    {
      userKey: "linh",
      actorUserKey: "minh",
      listKey: "minh-breakfast",
      type: "list_published",
      title: "Minh updated a breakfast list",
      body: "Sai Gon Breakfast Classics picked up more attention today.",
      readAt: hoursAgo(1),
      createdAt: hoursAgo(14),
    },
  ];

  await prisma.userNotification.deleteMany({
    where: {
      type: "list_published",
      listId: {
        in: notifications.map((notification) => listMap[notification.listKey].id),
      },
    },
  });

  for (const notification of notifications) {
    await prisma.userNotification.create({
      data: {
        userId: userMap[notification.userKey].id,
        actorUserId: userMap[notification.actorUserKey].id,
        listId: listMap[notification.listKey].id,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        readAt: notification.readAt,
        createdAt: notification.createdAt,
      },
    });
  }
}

async function seedReviews(userMap, vendorMap) {
  const reviews = [
    {
      userKey: "minh",
      vendorSlug: "pho-hoa-pasteur-q3",
      rating: 4,
      content: "Broth is consistent and service is fast in the morning.",
    },
    {
      userKey: "linh",
      vendorSlug: "banh-mi-huynh-hoa-q1",
      rating: 5,
      content: "Still heavy but worth it when you want the classic experience.",
    },
    {
      userKey: "hana",
      vendorSlug: "banh-xeo-46a-dinh-cong-trang",
      rating: 4,
      content: "Good for first-timers. Big portion, crispy shell, friendly staff.",
    },
  ];

  for (const review of reviews) {
    const vendor = vendorMap[review.vendorSlug];

    await prisma.review.upsert({
      where: {
        id: `${vendor.id}:${userMap[review.userKey].id}`,
      },
      update: {
        rating: review.rating,
        content: review.content,
        cleanlinessScore: review.rating,
        authenticityScore: review.rating,
        valueScore: review.rating,
        crowdScore: 3,
        status: "APPROVED",
      },
      create: {
        id: `${vendor.id}:${userMap[review.userKey].id}`,
        vendorId: vendor.id,
        userId: userMap[review.userKey].id,
        rating: review.rating,
        content: review.content,
        cleanlinessScore: review.rating,
        authenticityScore: review.rating,
        valueScore: review.rating,
        crowdScore: 3,
        status: "APPROVED",
      },
    });
  }

  const vendorReviewStats = [
    { slug: "pho-hoa-pasteur-q3", averageRating: 4.3, reviewCount: 12 },
    { slug: "banh-mi-huynh-hoa-q1", averageRating: 4.7, reviewCount: 34 },
    { slug: "banh-xeo-46a-dinh-cong-trang", averageRating: 4.5, reviewCount: 18 },
    { slug: "com-tam-ba-ghien-tan-binh", averageRating: 4.4, reviewCount: 21 },
  ];

  for (const stat of vendorReviewStats) {
    await prisma.vendor.update({
      where: { slug: stat.slug },
      data: {
        averageRating: stat.averageRating,
        reviewCount: stat.reviewCount,
        status: VendorStatus.APPROVED,
      },
    });
  }
}

async function main() {
  const vendorMap = await seedVendors();
  const userMap = await seedUsers();
  const listMap = await seedLists(userMap, vendorMap);

  await seedLikes(userMap, listMap);
  await seedFollows(userMap);
  const commentMap = await seedComments(userMap, listMap);
  await seedReports(userMap, listMap, commentMap);
  await seedNotifications(userMap, listMap);
  await seedReviews(userMap, vendorMap);

  console.log(
    `Seeded ${vendors.length} vendors, ${users.length} users, and social demo data.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
