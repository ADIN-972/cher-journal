import prisma from "../lib/prisma.js";

/**
 * Initialize default price schema if none exists
 * This ensures the system has at least one active price schema
 */
async function initPriceSchema() {
  try {
    // Check if any price schema exists
    const existingSchemas = await prisma.priceSchema.findMany();

    if (existingSchemas.length === 0) {
      console.log("📊 Creating default price schema...");

      const defaultSchema = await prisma.priceSchema.create({
        data: {
          name: "Default Pricing",
          description: "Default pricing scheme for all chapters",
          priceFreeToRead: 199, // €1.99
          pricePaywall: 299, // €2.99
          priceEpilogue: 399, // €3.99
          priceProtagonistUnlock: 499, // €4.99
          isActive: true,
          createdBy: "system",
        },
      });

      console.log("✅ Default price schema created and activated");
      console.log(`   ID: ${defaultSchema.id}`);
    } else {
      // Check if any schema is active
      const activeSchema = await prisma.priceSchema.findFirst({
        where: { isActive: true },
      });

      if (!activeSchema) {
        console.log("⚠️  No active price schema found. Activating first schema...");
        const firstSchema = existingSchemas[0];

        await prisma.priceSchema.update({
          where: { id: firstSchema.id },
          data: { isActive: true },
        });

        console.log("✅ Price schema activated");
        console.log(`   ID: ${firstSchema.id}`);
      } else {
        console.log("✅ Active price schema already exists");
        console.log(`   ID: ${activeSchema.id}`);
      }
    }
  } catch (error) {
    console.error("❌ Error initializing price schema:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

initPriceSchema();
