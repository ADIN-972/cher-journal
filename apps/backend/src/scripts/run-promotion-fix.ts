/**
 * Script pour exécuter la correction des promotions FREE manquantes
 * Exécution: npx tsx src/scripts/run-promotion-fix.ts
 */

import { promotionsService } from '../modules/admin/promotions/promotions.service.js';

async function main() {
  console.log('\n🔧 Exécution de la correction des promotions FREE manquantes...\n');

  try {
    const result = await promotionsService.fixMissingFreePromotionEntitlements();

    console.log('\n✅ Correction Complétée!');
    console.log('═'.repeat(60));
    console.log(`📊 Statistiques:`);
    console.log(`   • Entitlements créés: ${result.created}`);
    console.log(`   • Entitlements existants: ${result.skipped}`);
    console.log(`   • Total traité: ${result.total}`);
    console.log('═'.repeat(60));

    if (result.created > 0) {
      console.log(`\n✨ ${result.created} utilisateurs ont maintenant accès aux contenus!`);
    } else {
      console.log('\n✓ Tous les comptes ont déjà les entitlements nécessaires.');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur lors de la correction:', error);
    process.exit(1);
  }
}

main();
