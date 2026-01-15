import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function initializePriceSchemas() {
  console.log("Initializing price schemas...");

  // Create default price schema
  const defaultSchema = await prisma.priceSchema.create({
    data: {
      id: randomUUID(),
      name: "2026-Q1 Standard",
      description: "Default pricing for Q1 2026",
      priceFreeToRead: 199,
      pricePaywall: 299,
      priceEpilogue: 399,
      isActive: true,
      createdBy: "system",
    },
  });

  console.log("✓ Created default price schema:", defaultSchema.id);

  // Get all chapters
  const chapters = await prisma.chapter.findMany({
    select: { id: true },
  });

  console.log(`✓ Found ${chapters.length} chapters`);

  // Record schema initialization in history
  await prisma.priceHistory.create({
    data: {
      entityType: "SCHEMA",
      entityId: defaultSchema.id,
      previousValues: null,
      newValues: {
        priceFreeToRead: 199,
        pricePaywall: 299,
        priceEpilogue: 399,
        name: "2026-Q1 Standard",
      },
      changeReason: "Initial schema creation during migration",
      changedBy: "system",
    },
  });

  console.log("✓ Schema initialization complete");

  return defaultSchema;
}

async function updateExistingOrdersWithPrices() {
  console.log("Updating existing orders with applied prices...");

  // Get the default schema
  const defaultSchema = await prisma.priceSchema.findFirst({
    where: { isActive: true },
  });

  if (!defaultSchema) {
    console.log("⚠ No active price schema found, skipping order updates");
    return;
  }

  // Get all orders without applied prices
  const ordersToUpdate = await prisma.order.findMany({
    where: {
      appliedPriceFreeToRead: null,
    },
  });

  console.log(`Updating ${ordersToUpdate.length} orders...`);

  // Update each order with the default schema prices
  for (const order of ordersToUpdate) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        appliedPriceFreeToRead: defaultSchema.priceFreeToRead,
        appliedPricePaywall: defaultSchema.pricePaywall,
        appliedPriceEpilogue: defaultSchema.priceEpilogue,
        appliedPriceSchemaId: defaultSchema.id,
      },
    });
  }

  console.log(`✓ Updated ${ordersToUpdate.length} orders`);
}

async function main() {
  try {
    console.log("🔄 Starting price schema migration...\n");

    await initializePriceSchemas();
    await updateExistingOrdersWithPrices();

    console.log("\n✅ Migration complete!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
