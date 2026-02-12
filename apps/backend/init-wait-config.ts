/**
 * Script to initialize wait configuration
 * Usage: npx tsx init-wait-config.ts
 */

import prisma from './src/lib/prisma';

async function initWaitConfig() {
  console.log('🔍 Checking wait configurations...');

  // Check if wait.default_duration_hours exists
  const existing = await prisma.systemConfig.findUnique({
    where: { key: 'wait.default_duration_hours' },
  });

  if (existing) {
    console.log('✅ wait.default_duration_hours already exists');
    console.log('   Current value:', existing.value, 'hours');
  } else {
    console.log('➕ Creating wait.default_duration_hours...');
    await prisma.systemConfig.create({
      data: {
        key: 'wait.default_duration_hours',
        value: '24',
        category: 'READER',
        type: 'NUMBER',
        description: "Durée d'attente par défaut pour le freeToRead (en heures)",
        isEncrypted: false,
      },
    });
    console.log('✅ Configuration created with default value: 24 hours');
  }

  // List all wait configs
  console.log('\n📋 All wait configurations:');
  const waitConfigs = await prisma.systemConfig.findMany({
    where: { key: { startsWith: 'wait.' } },
    orderBy: { key: 'asc' },
  });

  waitConfigs.forEach((config) => {
    console.log(`   - ${config.key}: ${config.value || 'null'}`);
    console.log(`     ${config.description || 'No description'}`);
  });

  console.log('\n🎉 Done!');
}

initWaitConfig()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
