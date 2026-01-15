/**
 * Migration script to decrypt existing text from EncryptedBlob and copy to VolumeVersion.text
 * Run this AFTER applying the remove_encryption_from_volume_version migration
 * 
 * Usage: npx ts-node prisma/migrate-text-data.ts
 */

import { PrismaClient } from '@prisma/client';
import { decrypt } from '../src/lib/crypto';

const prisma = new PrismaClient();

async function migrateTextData() {
  console.log('Starting text data migration...');
  
  try {
    // Get all volume versions
    const versions = await prisma.volumeVersion.findMany({
      select: { id: true },
    });
    
    console.log(`Found ${versions.length} volume versions`);
    
    let successCount = 0;
    let errorCount = 0;
    let noTextCount = 0;
    
    for (const version of versions) {
      try {
        // Find the encrypted blob by ownerId (which is the version ID)
        const blob = await prisma.encryptedBlob.findFirst({
          where: { 
            ownerId: version.id,
            purpose: 'volume_text',
          },
        });
        
        if (!blob) {
          console.log(`No text blob found for version ${version.id}`);
          noTextCount++;
          continue;
        }
        
        // Decrypt the text
        const plainText = decrypt({
          cipherText: blob.cipherText,
          iv: blob.iv,
          tag: blob.tag,
          wrappedDek: blob.wrappedDek,
          alg: blob.alg,
          version: blob.version,
        });
        
        // Update the version with the plain text
        await prisma.volumeVersion.update({
          where: { id: version.id },
          data: { text: plainText },
        });
        
        successCount++;
        console.log(`✓ Migrated text for version ${version.id} (${plainText.length} chars)`);
      } catch (error) {
        console.error(`✗ Error migrating version ${version.id}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n=== Migration Summary ===');
    console.log(`Total versions: ${versions.length}`);
    console.log(`Successfully migrated: ${successCount}`);
    console.log(`No text found: ${noTextCount}`);
    console.log(`Errors: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n✓ All text data migrated successfully!');
      console.log('You can now safely delete the old EncryptedBlob records (after backup)');
      console.log('Run: DELETE FROM encrypted_blobs WHERE purpose = \'volume_text\';');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateTextData()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
