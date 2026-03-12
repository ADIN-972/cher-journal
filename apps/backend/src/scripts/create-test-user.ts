import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

async function createTestUser() {
  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: "julia@dev.com" },
    });

    if (existing) {
      console.log("✅ Test user already exists: julia@dev.com");
      console.log(`   ID: ${existing.id}`);
      console.log(`   Status: ${existing.status}`);
      return;
    }

    // Create test user
    const passwordHash = await bcrypt.hash("user123", 10);
    const user = await prisma.user.create({
      data: {
        email: "julia@dev.com",
        passwordHash,
        firstName: "Julia",
        lastName: "Test",
        status: "ACTIVE",
        role: "USER",
      },
    });

    console.log("✅ Test user created successfully:");
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: user123`);
    console.log(`   ID: ${user.id}`);
  } catch (error) {
    console.error("❌ Error creating test user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
