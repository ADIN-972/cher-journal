import { PrismaClient, VolumeStatus, ChapterStatus } from '@prisma/client';
import { schedulingService } from './src/modules/admin/scheduling/scheduling.service';

const prisma = new PrismaClient();

async function testPublicationCron() {
  console.log('=== Test Publication Automatique ===\n');

  try {
    // 1. Afficher l'état actuel avant publication
    console.log('📊 État avant publication automatique:\n');

    const allScheduled = await prisma.volume.findMany({
      where: {
        scheduledFor: { not: null }
      },
      select: {
        id: true,
        volumeNumber: true,
        title: true,
        status: true,
        scheduledFor: true,
        publishedAt: true,
      },
      orderBy: { scheduledFor: 'asc' }
    });

    console.log(`Total volumes avec scheduledFor: ${allScheduled.length}\n`);

    allScheduled.forEach(v => {
      const isPast = v.scheduledFor && new Date(v.scheduledFor) <= new Date();
      console.log(`Volume ${v.volumeNumber}: ${v.title}`);
      console.log(`  Status: ${v.status}`);
      console.log(`  ScheduledFor: ${v.scheduledFor?.toISOString()}`);
      console.log(`  PublishedAt: ${v.publishedAt?.toISOString() || 'null'}`);
      console.log(`  Date passée: ${isPast ? '✅ OUI' : '❌ NON (futur)'}`);
      console.log('');
    });

    // 2. Obtenir les éléments à publier
    console.log('\n🔍 Éléments éligibles pour publication (status != PUBLISHED && scheduledFor <= now):\n');
    const due = await schedulingService.getDueForPublication();

    console.log(`Chapitres à publier: ${due.chapters.length}`);
    due.chapters.forEach(c => {
      console.log(`  - Chapitre: ${c.title}`);
      console.log(`    Status: ${c.status}`);
      console.log(`    ScheduledFor: ${c.scheduledFor?.toISOString()}`);
    });
    console.log('');

    console.log(`Volumes à publier: ${due.volumes.length}`);
    due.volumes.forEach(v => {
      console.log(`  - Volume ${v.volumeNumber}: ${v.title}`);
      console.log(`    Status: ${v.status}`);
      console.log(`    ScheduledFor: ${v.scheduledFor?.toISOString()}`);
    });
    console.log('');

    // 3. Vérifier que les volumes PUBLISHED ne sont PAS dans la liste
    const publishedWithScheduled = allScheduled.filter(v => v.status === 'PUBLISHED');
    if (publishedWithScheduled.length > 0) {
      console.log(`\n✅ Vérification: ${publishedWithScheduled.length} volume(s) PUBLISHED avec scheduledFor ne seront PAS republiés\n`);
      publishedWithScheduled.forEach(v => {
        console.log(`  - Volume ${v.volumeNumber}: ${v.title} (status: PUBLISHED) - IGNORÉ`);
      });
    }

    // 4. Option pour exécuter la publication
    console.log('\n⚠️  Pour exécuter la publication, décommentez la section ci-dessous dans le code\n');

    /*
    console.log('\n🚀 Exécution de la publication automatique...\n');

    // Publier les volumes
    for (const volume of due.volumes) {
      console.log(`Publication du volume ${volume.volumeNumber}: ${volume.title}...`);
      await schedulingService.publishVolume(volume.id);
      console.log(`✅ Volume ${volume.id} publié`);
    }

    // Publier les chapitres
    for (const chapter of due.chapters) {
      console.log(`Publication du chapitre: ${chapter.title}...`);
      await schedulingService.publishChapter(chapter.id);
      console.log(`✅ Chapitre ${chapter.id} publié`);
    }

    console.log('\n✅ Publication automatique terminée\n');

    // Vérifier les résultats
    console.log('📊 Vérification après publication:\n');

    for (const volume of due.volumes) {
      const updated = await prisma.volume.findUnique({
        where: { id: volume.id },
        select: {
          volumeNumber: true,
          title: true,
          status: true,
          scheduledFor: true,
          publishedAt: true,
        }
      });

      if (updated) {
        console.log(`Volume ${updated.volumeNumber}: ${updated.title}`);
        console.log(`  Status: ${updated.status} (devrait être PUBLISHED)`);
        console.log(`  ScheduledFor: ${updated.scheduledFor || 'null'} (devrait être null)`);
        console.log(`  PublishedAt: ${updated.publishedAt?.toISOString()} (devrait être défini)`);
        console.log('');
      }
    }
    */

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPublicationCron();
