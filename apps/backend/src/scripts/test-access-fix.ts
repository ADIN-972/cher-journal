import prisma from "../lib/prisma.js";
import { AccessControlService } from "../lib/accessControl.js";
import { Perspective } from "@prisma/client";

async function testAccessFix() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "julia@dev.com" },
    });

    if (!user) {
      console.log("❌ User not found");
      return;
    }

    console.log(`✅ Testing access for: ${user.email}`);

    // Get a chapter where julia has entitlements
    const entitlement = await prisma.entitlement.findFirst({
      where: { userId: user.id },
      include: { chapter: true },
    });

    if (!entitlement) {
      console.log("❌ No entitlements found");
      return;
    }

    const chapterId = entitlement.chapterId;
    console.log(`\n📖 Chapter: ${entitlement.chapter.protagonistName} - ${entitlement.chapter.title}`);
    console.log(`   Entitlement volumes: ${entitlement.volumeFrom}-${entitlement.volumeTo}`);
    console.log(`   Entitlement source: ${entitlement.source}`);
    console.log(`   Entitlement scopes: ${entitlement.scopes.join(", ")}`);

    const accessControl = new AccessControlService();

    // Test volumes
    console.log("\n\n📊 Access Tests:");
    const volumes = [1, 2, 3, 4, 5, 9, 10];

    for (const volNum of volumes) {
      const narratorAccess = await accessControl.getVolumeAccessInfo(
        user.id,
        chapterId,
        volNum,
        Perspective.NARRATOR
      );

      const povAccess = await accessControl.getVolumeAccessInfo(
        user.id,
        chapterId,
        volNum,
        Perspective.PROTAGONIST
      );

      console.log(`\nVolume ${volNum}:`);
      console.log(`  NARRATOR:`);
      console.log(
        `    isAccessible: ${narratorAccess.isAccessible} ${narratorAccess.isAccessible ? "✅" : "❌"}`
      );
      console.log(`    blockageType: ${narratorAccess.blockageType}`);
      console.log(`  PROTAGONIST:`);
      console.log(
        `    isAccessible: ${povAccess.isAccessible} ${povAccess.isAccessible ? "✅" : "❌"}`
      );
      console.log(`    blockageType: ${povAccess.blockageType}`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAccessFix();
