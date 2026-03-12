import prisma from "../lib/prisma.js";

async function checkScopesFormat() {
  try {
    // Get an entitlement for julia
    const entitlements = await prisma.entitlement.findMany({
      where: {
        user: { email: "julia@dev.com" },
      },
      take: 3,
    });

    if (entitlements.length === 0) {
      console.log("❌ No entitlements found for julia@dev.com");
      return;
    }

    console.log(`✅ Found ${entitlements.length} entitlements:`);
    entitlements.forEach((e, idx) => {
      console.log(`\n${idx + 1}. Entitlement:`);
      console.log(`   ID: ${e.id}`);
      console.log(`   scopes type: ${typeof e.scopes}`);
      console.log(`   scopes: ${JSON.stringify(e.scopes)}`);
      console.log(`   scopes raw: ${e.scopes}`);

      // Check if it's an array
      if (Array.isArray(e.scopes)) {
        console.log(`   ✅ scopes is an array with ${e.scopes.length} items`);
        e.scopes.forEach(s => console.log(`      - "${s}" (type: ${typeof s})`));
      } else {
        console.log(`   ❌ scopes is NOT an array, it's ${typeof e.scopes}`);
      }
    });

    // Test the { has: 'POV' } query
    console.log("\n\n📊 Testing { has: 'POV' } filter:");
    const withPOV = await prisma.entitlement.findMany({
      where: {
        user: { email: "julia@dev.com" },
        scopes: { has: "POV" },
      },
    });
    console.log(`Found ${withPOV.length} entitlements with POV scope`);

    // Test the { has: 'BASE' } query
    console.log("\n📊 Testing { has: 'BASE' } filter:");
    const withBASE = await prisma.entitlement.findMany({
      where: {
        user: { email: "julia@dev.com" },
        scopes: { has: "BASE" },
      },
    });
    console.log(`Found ${withBASE.length} entitlements with BASE scope`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkScopesFormat();
