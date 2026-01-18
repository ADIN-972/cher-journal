import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { config } from "@cher-journal/config";

const prisma = new PrismaClient();

function createDate2025(month: number, day: number): Date {
  return new Date(2025, month, day, 10, 0, 0);
}

async function main() {
  console.log("🌱 Starting simplified seed...");

  // Clean
  await prisma.order.deleteMany();
  await prisma.volumeVersion.deleteMany();
  await prisma.volume.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await bcrypt.hash(config.seed.adminPassword, 10);
  const userHash = await bcrypt.hash(config.seed.userPassword, 10);

  // Create admin
  const admin = await prisma.user.create({
    data: {
      email: config.seed.adminEmail,
      passwordHash: adminHash,
      role: "ADMIN",
      status: "ACTIVE",
      firstName: "Admin",
      lastName: "Test",
    },
  });

  console.log("✅ Admin created");

  // Create 3 simple chapters
  for (let i = 1; i <= 3; i++) {
    const chapter = await prisma.chapter.create({
      data: {
        title: `Chapitre ${i}`,
        protagonistName: `Hero ${i}`,
        status: "PUBLISHED",
        publishedAt: createDate2025(0, i),
      },
    });

    // Create 5 volumes per chapter
    for (let v = 1; v <= 5; v++) {
      const volume = await prisma.volume.create({
        data: {
          chapterId: chapter.id,
          volumeNumber: v,
          title: `Volume ${v}`,
          publishedAt: createDate2025(0, i + v),
        },
      });

      await prisma.volumeVersion.create({
        data: { volumeId: volume.id, perspective: "NARRATOR" },
      });
    }
  }

  console.log("✅ 3 chapters with 5 volumes each");

  // Create 3 users with orders
  const users = [];
  for (let u = 1; u <= 3; u++) {
    const user = await prisma.user.create({
      data: {
        email: `user${u}@example.com`,
        passwordHash: userHash,
        role: "USER",
        status: "ACTIVE",
        firstName: `User`,
        lastName: `${u}`,
      },
    });
    users.push(user);
  }

  console.log("✅ 3 users created");

  // Create realistic orders spread across 2025
  const types = ["CHAPTER", "BUNDLE", "VERSION_PACK", "COLORING"];
  const amounts = [699, 349, 699, 299];

  let orderCount = 0;
  for (let month = 0; month < 12; month++) {
    for (let userIdx = 0; userIdx < users.length; userIdx++) {
      // Each user buys 1-3 items per month
      const itemsThisMonth = 1 + ((month + userIdx) % 3);
      for (let item = 0; item < itemsThisMonth; item++) {
        const typeIdx = (month + userIdx + item) % types.length;
        await prisma.order.create({
          data: {
            userId: users[userIdx].id,
            type: types[typeIdx],
            status: "PAID",
            provider: "stripe",
            currency: "EUR",
            amountTotal: amounts[typeIdx],
            createdAt: createDate2025(month, 5 + item * 5),
          },
        });
        orderCount++;
      }
    }
  }

  console.log(`✅ ${orderCount} orders created across 2025`);
  console.log("\n✨ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
