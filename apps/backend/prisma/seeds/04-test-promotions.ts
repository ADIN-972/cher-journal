import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Test promotions seed
 * Creates active test promotions for development
 */
export async function seedTestPromotions() {
  console.log("🎁 Seeding test promotions...");

  try {
    // Check if test promotions already exist
    const existingPromo = await prisma.promotion.findFirst({
      where: { code: "TEST_EARLYBIRD" },
    });

    if (existingPromo) {
      console.log("ℹ️  Test promotions already exist, skipping creation");
      return;
    }

    // Get the early.adopter user
    const earlyAdopterUser = await prisma.user.findUnique({
      where: { email: "early.adopter@example.com" },
    });

    if (!earlyAdopterUser) {
      console.log("⚠️  early.adopter user not found, skipping test promotion assignment");
      return;
    }

    // Get first chapter for reference
    const firstChapter = await prisma.chapter.findFirst({
      orderBy: { createdAt: "desc" },
      include: {
        volumes: {
          take: 1,
          orderBy: { volumeNumber: "asc" },
        },
      },
    });

    if (!firstChapter) {
      console.log("⚠️  No chapters found, skipping test promotion creation");
      return;
    }

    const now = new Date();
    const startsAt = new Date(now.getTime() - 1000 * 60 * 60); // 1 hour ago
    const endsAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30); // 30 days from now

    // Create test promotions
    const promo1 = await prisma.promotion.create({
      data: {
        name: "Early Adopter Welcome",
        description: "Special discount for early adopters",
        scope: "CHAPTER",
        refId: firstChapter.id, // Reference specific chapter
        type: "PERCENT",
        value: 20,
        startsAt,
        endsAt,
        maxUses: 1000,
        perUserLimit: 5,
        isActive: true,
        code: "TEST_EARLYBIRD",
        targetType: "SPECIFIC_USERS",
        targetUserIds: [earlyAdopterUser.id],
        targetCriteria: null,
        priceId: null,
      },
    });

    // Create volume promotion if volumes exist
    let promo2 = null;
    if (firstChapter.volumes && firstChapter.volumes.length > 0) {
      const volumeNumber = firstChapter.volumes[0].volumeNumber;
      promo2 = await prisma.promotion.create({
        data: {
          name: "Volume Explorer",
          description: "Free access to first volume",
          scope: "VOLUME",
          refId: `${firstChapter.id}:${volumeNumber}`, // Format: chapterId:volumeNumber
          type: "FREE",
          value: null,
          startsAt,
          endsAt,
          maxUses: 500,
          perUserLimit: 1,
          isActive: true,
          code: "VOLUME_FREE",
          targetType: "SPECIFIC_USERS",
          targetUserIds: [earlyAdopterUser.id],
          targetCriteria: null,
          priceId: null,
        },
      });
    }

    const promo3 = await prisma.promotion.create({
      data: {
        name: "Limited Time Discount",
        description: "€3 fixed discount on any purchase",
        scope: "CHAPTER",
        refId: firstChapter.id,
        type: "FIXED",
        value: 300, // 3€ in cents
        startsAt,
        endsAt,
        maxUses: 100,
        perUserLimit: 2,
        isActive: true,
        code: "FIXED_300",
        targetType: "ALL_USERS",
        targetUserIds: [],
        targetCriteria: null,
        priceId: null,
      },
    });

    // Create Jasmine-specific promotion if chapter exists
    let jasminePromo = null;
    const jasmineChapter = await prisma.chapter.findFirst({
      where: { protagonistName: "Jasmine" },
      include: {
        volumes: {
          take: 1,
          orderBy: { volumeNumber: "asc" },
        },
      },
    });

    if (jasmineChapter && jasmineChapter.volumes.length > 0) {
      const volumeNumber = jasmineChapter.volumes[0].volumeNumber;
      jasminePromo = await prisma.promotion.create({
        data: {
          name: "Jasmine's Love Story",
          description: "Discover the romance of L'amour sans couronne",
          scope: "VOLUME",
          refId: `${jasmineChapter.id}:${volumeNumber}`,
          type: "PERCENT",
          value: 25,
          startsAt,
          endsAt,
          maxUses: 200,
          perUserLimit: 1,
          isActive: true,
          code: "JASMINE_25",
          targetType: "SPECIFIC_USERS",
          targetUserIds: [earlyAdopterUser.id],
          targetCriteria: null,
          priceId: null,
        },
      });
    }

    console.log(`✅ Created test promotions:`);
    console.log(`   - ${promo1.name} (${promo1.code}) for chapter ${firstChapter.id}`);
    if (promo2) {
      console.log(`   - ${promo2.name} (${promo2.code})`);
    }
    console.log(`   - ${promo3.name} (${promo3.code})`);
    if (jasminePromo) {
      console.log(`   - ${jasminePromo.name} (${jasminePromo.code})`);
    }
    console.log(`✅ Assigned promotions to early.adopter user`);
  } catch (error) {
    console.error("❌ Error seeding test promotions:", error);
    throw error;
  }
}
