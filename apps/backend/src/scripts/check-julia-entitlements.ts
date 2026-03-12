import prisma from "../lib/prisma.js";

async function checkJuliaEntitlements() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "julia@dev.com" },
      include: {
        entitlements: {
          include: {
            chapter: {
              select: {
                id: true,
                title: true,
                protagonistName: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      console.log("❌ User not found: julia@dev.com");
      return;
    }

    console.log("✅ User found: julia@dev.com");
    console.log(`   ID: ${user.id}`);
    console.log(`\n📋 Entitlements (${user.entitlements.length}):`);

    if (user.entitlements.length === 0) {
      console.log("   ❌ No entitlements found");
    } else {
      user.entitlements.forEach((ent, idx) => {
        console.log(
          `\n   ${idx + 1}. ${ent.chapter.protagonistName} - ${ent.chapter.title}`
        );
        console.log(`      Volumes: ${ent.volumeFrom} to ${ent.volumeTo}`);
        console.log(`      Scopes: ${ent.scopes.join(", ")}`);
        console.log(`      Source: ${ent.source}`);
      });
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkJuliaEntitlements();
