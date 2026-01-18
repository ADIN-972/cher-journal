import { PrismaClient, VolumeStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function testReaderAccess() {
  console.log('=== Test Accès Lecteur ===\n');

  try {
    // Test 1: Volumes PUBLISHED sans scheduledFor (devraient être accessibles)
    console.log('📚 Test 1: Volumes PUBLISHED sans scheduledFor (accessibles immédiatement)\n');

    const volumesA = await prisma.volume.findMany({
      where: {
        status: VolumeStatus.PUBLISHED,
        scheduledFor: null,
      },
      select: {
        id: true,
        volumeNumber: true,
        title: true,
        status: true,
        scheduledFor: true,
        chapter: {
          select: { title: true }
        }
      },
      take: 5
    });

    console.log(`Trouvé ${volumesA.length} volume(s):\n`);
    volumesA.forEach(v => {
      console.log(`✅ Volume ${v.volumeNumber}: ${v.title}`);
      console.log(`   Chapitre: ${v.chapter.title}`);
      console.log(`   Status: ${v.status}, ScheduledFor: null`);
      console.log(`   → ACCESSIBLE pour la lecture\n`);
    });

    // Test 2: Volumes PUBLISHED avec scheduledFor futur (NE devraient PAS être accessibles)
    console.log('\n📚 Test 2: Volumes PUBLISHED avec scheduledFor futur (pas encore accessibles)\n');

    const volumesB = await prisma.volume.findMany({
      where: {
        status: VolumeStatus.PUBLISHED,
        scheduledFor: { gt: new Date() }
      },
      select: {
        id: true,
        volumeNumber: true,
        title: true,
        status: true,
        scheduledFor: true,
        chapter: {
          select: { title: true }
        }
      }
    });

    if (volumesB.length === 0) {
      console.log('⚠️  Aucun volume trouvé avec scheduledFor futur');
      console.log('   Pour tester ce cas, créez un volume avec:');
      console.log('   UPDATE volumes SET "scheduledFor" = NOW() + INTERVAL \'1 day\' WHERE id = \'[ID]\';\n');
    } else {
      console.log(`Trouvé ${volumesB.length} volume(s):\n`);
      volumesB.forEach(v => {
        console.log(`❌ Volume ${v.volumeNumber}: ${v.title}`);
        console.log(`   Chapitre: ${v.chapter.title}`);
        console.log(`   Status: ${v.status}`);
        console.log(`   ScheduledFor: ${v.scheduledFor?.toISOString()}`);
        console.log(`   → NON ACCESSIBLE pour la lecture (date future)\n`);
      });
    }

    // Test 3: Volumes PUBLISHED avec scheduledFor passé (devraient être accessibles)
    console.log('\n📚 Test 3: Volumes PUBLISHED avec scheduledFor passé (accessibles)\n');

    const volumesC = await prisma.volume.findMany({
      where: {
        status: VolumeStatus.PUBLISHED,
        scheduledFor: { lte: new Date() }
      },
      select: {
        id: true,
        volumeNumber: true,
        title: true,
        status: true,
        scheduledFor: true,
        chapter: {
          select: { title: true }
        }
      },
      take: 5
    });

    if (volumesC.length === 0) {
      console.log('⚠️  Aucun volume trouvé avec scheduledFor passé');
      console.log('   Pour tester ce cas, créez un volume avec:');
      console.log('   UPDATE volumes SET "scheduledFor" = NOW() - INTERVAL \'1 hour\' WHERE id = \'[ID]\';\n');
    } else {
      console.log(`Trouvé ${volumesC.length} volume(s):\n`);
      volumesC.forEach(v => {
        console.log(`✅ Volume ${v.volumeNumber}: ${v.title}`);
        console.log(`   Chapitre: ${v.chapter.title}`);
        console.log(`   Status: ${v.status}`);
        console.log(`   ScheduledFor: ${v.scheduledFor?.toISOString()}`);
        console.log(`   → ACCESSIBLE pour la lecture (date passée)\n`);
      });
    }

    // Test 4: Logique complète de l'accès lecteur
    console.log('\n📚 Test 4: Simulation logique complète du reader.service.ts\n');

    const accessibleVolumes = await prisma.volume.findMany({
      where: {
        status: VolumeStatus.PUBLISHED,
        OR: [
          { scheduledFor: null },
          { scheduledFor: { lte: new Date() } }
        ]
      },
      select: {
        id: true,
        volumeNumber: true,
        title: true,
        status: true,
        scheduledFor: true,
        chapter: {
          select: { title: true }
        }
      },
      orderBy: [
        { chapter: { title: 'asc' } },
        { volumeNumber: 'asc' }
      ]
    });

    console.log(`📊 Total volumes accessibles au lecteur: ${accessibleVolumes.length}\n`);

    // Grouper par chapitre pour l'affichage
    const byChapter: Record<string, typeof accessibleVolumes> = {};
    accessibleVolumes.forEach(v => {
      if (!byChapter[v.chapter.title]) {
        byChapter[v.chapter.title] = [];
      }
      byChapter[v.chapter.title].push(v);
    });

    Object.entries(byChapter).forEach(([chapterTitle, volumes]) => {
      console.log(`\n📖 ${chapterTitle}: ${volumes.length} volume(s)`);
      volumes.forEach(v => {
        const accessReason = v.scheduledFor === null
          ? 'scheduledFor = null'
          : `scheduledFor <= now (${v.scheduledFor?.toISOString()})`;
        console.log(`   ✅ Volume ${v.volumeNumber}: ${v.title}`);
        console.log(`      Raison: ${accessReason}`);
      });
    });

    // Test 5: Volumes NON accessibles (pour comparaison)
    console.log('\n\n📚 Test 5: Volumes NON accessibles (pour vérification)\n');

    const notAccessible = await prisma.volume.findMany({
      where: {
        OR: [
          { status: { not: VolumeStatus.PUBLISHED } },
          {
            status: VolumeStatus.PUBLISHED,
            scheduledFor: { gt: new Date() }
          }
        ]
      },
      select: {
        id: true,
        volumeNumber: true,
        title: true,
        status: true,
        scheduledFor: true,
        chapter: {
          select: { title: true }
        }
      },
      take: 10
    });

    console.log(`📊 Volumes NON accessibles: ${notAccessible.length}\n`);
    notAccessible.forEach(v => {
      let reason = '';
      if (v.status !== VolumeStatus.PUBLISHED) {
        reason = `Status: ${v.status} (pas PUBLISHED)`;
      } else if (v.scheduledFor && v.scheduledFor > new Date()) {
        reason = `ScheduledFor futur: ${v.scheduledFor.toISOString()}`;
      }

      console.log(`❌ Volume ${v.volumeNumber}: ${v.title}`);
      console.log(`   Chapitre: ${v.chapter.title}`);
      console.log(`   Raison: ${reason}\n`);
    });

    // Résumé
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 RÉSUMÉ');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ Volumes accessibles: ${accessibleVolumes.length}`);
    console.log(`❌ Volumes non accessibles: ${notAccessible.length}`);
    console.log('\nLogique d\'accès:');
    console.log('  status = PUBLISHED');
    console.log('  ET (scheduledFor = null OU scheduledFor <= now)');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testReaderAccess();
