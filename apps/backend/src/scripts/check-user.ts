import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "julia@dev.com" },
    });

    if (!user) {
      console.log("❌ User not found: julia@dev.com");
    } else {
      console.log("✅ User found:");
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Has password hash: ${user.passwordHash ? "YES" : "NO"}`);

      // Test password
      if (user.passwordHash) {
        const isValid = await bcrypt.compare("user123", user.passwordHash);
        console.log(`   Password "user123" valid: ${isValid ? "✅ YES" : "❌ NO"}`);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
