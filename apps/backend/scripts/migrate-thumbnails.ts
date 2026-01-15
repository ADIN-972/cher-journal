#!/usr/bin/env ts-node
/**
 * Script de migration pour générer les thumbnails pour les images existantes
 *
 * Usage:
 *   npm run migrate:thumbnails          // Générer les thumbnails pour tous les assets
 *   npm run migrate:thumbnails -- --dry-run  // Simulation sans écrire
 *   npm run migrate:thumbnails -- --chapterId <id>  // Générer pour un chapitre spécifique
 */

import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

interface MigrationOptions {
  dryRun?: boolean;
  chapterId?: string;
  batchSize?: number;
}

async function generateThumbnail(filePath: string): Promise<Buffer> {
  return sharp(filePath)
    .resize(600, 600, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .toBuffer();
}

async function migrateAsset(asset: any, uploadDir: string, dryRun: boolean) {
  try {
    // Skip if already has thumbnail
    if (asset.thumbnailObjectKey) {
      return { status: "skipped", reason: "Already has thumbnail" };
    }

    const originalPath = path.join(uploadDir, asset.objectKey);

    // Check if file exists
    if (!fs.existsSync(originalPath)) {
      return { status: "failed", reason: "Original file not found" };
    }

    // Generate thumbnail
    const thumbnail = await generateThumbnail(originalPath);

    // Determine thumbnail path
    const ext = path.extname(asset.objectKey);
    const baseName = path.basename(asset.objectKey, ext);
    const dir = path.dirname(asset.objectKey);
    const thumbnailObjectKey = `${dir}/${baseName}-thumb${ext}`;
    const thumbnailPath = path.join(uploadDir, thumbnailObjectKey);

    if (!dryRun) {
      // Ensure directory exists
      const thumbnailDir = path.dirname(thumbnailPath);
      if (!fs.existsSync(thumbnailDir)) {
        fs.mkdirSync(thumbnailDir, { recursive: true });
      }

      // Write thumbnail
      fs.writeFileSync(thumbnailPath, thumbnail);

      // Update database
      await prisma.chapterAsset.update({
        where: { id: asset.id },
        data: { thumbnailObjectKey },
      });
    }

    const stats = fs.statSync(originalPath);
    const thumbStats = { size: thumbnail.length };

    return {
      status: "success",
      originalSize: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
      thumbnailSize: `${(thumbStats.size / 1024).toFixed(2)} KB`,
      compression: `${((1 - thumbStats.size / stats.size) * 100).toFixed(0)}%`,
      thumbnailObjectKey,
    };
  } catch (error: any) {
    return { status: "failed", reason: error.message };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const options: MigrationOptions = {
    dryRun: args.includes("--dry-run"),
    chapterId: args[args.indexOf("--chapterId") + 1],
    batchSize: 10,
  };

  const uploadDir = path.join(process.cwd(), "apps", "backend", "uploads");

  if (!fs.existsSync(uploadDir)) {
    console.error(`❌ Upload directory not found: ${uploadDir}`);
    process.exit(1);
  }

  console.log("═".repeat(70));
  console.log("MIGRATION THUMBNAILS");
  console.log("═".repeat(70));
  console.log(`Mode: ${options.dryRun ? "DRY RUN (simulation)" : "REAL"}`);
  console.log(`Upload dir: ${uploadDir}`);
  console.log("");

  try {
    // Fetch assets to migrate
    const where = {
      ...(options.chapterId && { chapterId: options.chapterId }),
      thumbnailObjectKey: null, // Only assets without thumbnails
    };

    const assets = await prisma.chapterAsset.findMany({
      where,
      select: {
        id: true,
        objectKey: true,
        thumbnailObjectKey: true,
        label: true,
        chapter: { select: { id: true, title: true } },
      },
    });

    console.log(`📊 Assets à traiter: ${assets.length}`);

    if (assets.length === 0) {
      console.log("✅ Aucun asset sans thumbnail trouvé!");
      await prisma.$disconnect();
      process.exit(0);
    }

    console.log("");

    const results = {
      success: 0,
      skipped: 0,
      failed: 0,
      details: [] as any[],
    };

    // Process in batches
    for (let i = 0; i < assets.length; i += options.batchSize!) {
      const batch = assets.slice(i, i + options.batchSize);

      console.log(
        `⏳ Traitement du lot ${Math.floor(i / options.batchSize!) + 1}/${Math.ceil(assets.length / options.batchSize!)}`
      );

      for (const asset of batch) {
        const result = await migrateAsset(asset, uploadDir, options.dryRun!);

        results.details.push({
          asset: asset.label || asset.objectKey,
          chapter: asset.chapter.title,
          ...result,
        });

        if (result.status === "success") results.success++;
        else if (result.status === "skipped") results.skipped++;
        else results.failed++;

        const icon =
          result.status === "success"
            ? "✓"
            : result.status === "skipped"
              ? "⊘"
              : "✗";
        console.log(`  ${icon} ${asset.label || asset.objectKey}`);
        if (result.thumbnailSize) {
          console.log(
            `    Original: ${result.originalSize}, Thumbnail: ${result.thumbnailSize} (${result.compression})`
          );
        } else if (result.reason) {
          console.log(`    ${result.reason}`);
        }
      }
    }

    console.log("");
    console.log("═".repeat(70));
    console.log("RÉSUMÉ");
    console.log("═".repeat(70));
    console.log(`✓ Réussis: ${results.success}`);
    console.log(`⊘ Ignorés: ${results.skipped}`);
    console.log(`✗ Échecs: ${results.failed}`);

    if (options.dryRun) {
      console.log("");
      console.log("⚠️  Mode DRY RUN: Aucune modification n'a été effectuée.");
      console.log("   Relancez sans --dry-run pour appliquer les changements.");
    } else {
      console.log("");
      console.log("✅ Migration terminée!");
    }

    await prisma.$disconnect();
    process.exit(results.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error("❌ Erreur:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
