import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { config } from "@cher-journal/config";

const prisma = new PrismaClient();

function createDate2025(month: number, day: number): Date {
  return new Date(2025, month, day, 10, 0, 0);
}

function createDate2026(month: number, day: number): Date {
  return new Date(2026, month, day, 10, 0, 0);
}

async function main() {
  console.log("🌱 Starting enhanced seed...");

  // Clean
  await prisma.order.deleteMany();
  await prisma.volumeVersion.deleteMany();
  await prisma.volume.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await bcrypt.hash(config.seed.adminPassword, 10);
  const userHash = await bcrypt.hash(config.seed.userPassword, 10);

  // Create admin
  const admin = await prisma.user.create({
    data: {
      email: config.seed.adminEmail,
      passwordHash: adminHash,
      role: "ADMIN",
      status: "ACTIVE",
      firstName: "Admin",
      lastName: "Test",
    },
  });

  console.log("✅ Admin created");

  // Create 14 chapters (5 with epilogues)
  const chapterData = [
    { title: "Le Secret de la Forêt", hasEpilogue: true, protagonist: "Léa", genres: ["PASSIONS_CHARNELLES", "REVES_SECRETS"] },
    { title: "L'Énigme du Manoir", hasEpilogue: false, protagonist: "Jasmine", genres: ["MYSTERIES_SENSUELS", "INTERDITS"] },
    { title: "Le Voyage Interdit", hasEpilogue: true, protagonist: "Emma", genres: ["INTERDITS", "PASSION_BRUTALE"] },
    { title: "La Montre Magique", hasEpilogue: false, protagonist: "Belle", genres: ["REVES_SECRETS", "ROMANCES_TENDRES"] },
    { title: "Les Gardiens du Temps", hasEpilogue: true, protagonist: "Sophie", genres: ["PASSIONS_CHARNELLES", "CONQUETES"] },
    { title: "Le Mystère de l'Île", hasEpilogue: false, protagonist: "Léna", genres: ["MYSTERIES_SENSUELS", "PASSION_BRUTALE"] },
    { title: "La Légende Oubliée", hasEpilogue: true, protagonist: "Clara", genres: ["ROMANCES_TENDRES", "DESIR_NOCTURNE"] },
    { title: "Les Portes de l'Infini", hasEpilogue: false, protagonist: "Sunshine", genres: ["PASSIONS_CHARNELLES", "AMOUR_COMPLIQUE"] },
    { title: "Le Dernier Sortilège", hasEpilogue: true, protagonist: "Jade", genres: ["INTERDITS", "LIBERATION"] },
    { title: "L'Écho des Étoiles", hasEpilogue: false, protagonist: "Esmeralda", genres: ["DESIR_NOCTURNE", "CONQUETES"] },
    { title: "Le Royaume Perdu", hasEpilogue: false, protagonist: "Chloé", genres: ["ROMANCES_TENDRES", "REVES_SECRETS"] },
    { title: "Les Ombres du Passé", hasEpilogue: false, protagonist: "Ursula", genres: ["PASSION_BRUTALE", "AMOUR_COMPLIQUE"] },
    { title: "La Clé des Songes", hasEpilogue: false, protagonist: "Lily", genres: ["LIBERATION", "PASSIONS_CHARNELLES"] },
    { title: "Le Pacte des Immortels", hasEpilogue: false, protagonist: "Julia", genres: ["MYSTERIES_SENSUELS", "REVES_SECRETS"] },
  ];

  for (let i = 0; i < chapterData.length; i++) {
    const chapter = await prisma.chapter.create({
      data: {
        title: chapterData[i].title,
        protagonistName: chapterData[i].protagonist,
        status: "PUBLISHED",
        publishedAt: createDate2025(0, i + 1),
      },
    });

    // Add genres to chapter
    for (const genre of chapterData[i].genres) {
      await prisma.chapterGenreTag.create({
        data: {
          chapterId: chapter.id,
          genre: genre as any,
        },
      });
    }

    // Create 5 volumes per chapter
    const volumeCount = chapterData[i].hasEpilogue ? 6 : 5;
    for (let v = 1; v <= volumeCount; v++) {
      const isEpilogue = chapterData[i].hasEpilogue && v === 6;
      const volume = await prisma.volume.create({
        data: {
          chapterId: chapter.id,
          volumeNumber: v,
          title: isEpilogue ? "Épilogue" : `Volume ${v}`,
          publishedAt: createDate2025(Math.floor(i / 2), i + v),
          status: "PUBLISHED",
        },
      });

      await prisma.volumeVersion.create({
        data: { volumeId: volume.id, perspective: "NARRATOR" },
      });
    }
  }

  console.log("✅ 14 chapters created (5 with epilogues)");

  // Create 10 user profiles with varied purchase behaviors
  const userProfiles = [
    {
      email: "early.adopter@example.com",
      firstName: "Emma",
      lastName: "Early",
      role: "USER",
    },
    {
      email: "regular.reader@example.com",
      firstName: "Lucas",
      lastName: "Regular",
      role: "USER",
    },
    {
      email: "bundle.lover@example.com",
      firstName: "Sophie",
      lastName: "Bundle",
      role: "USER",
    },
    {
      email: "chapter.collector@example.com",
      firstName: "Nathan",
      lastName: "Collector",
      role: "USER",
    },
    {
      email: "coloring.fan@example.com",
      firstName: "Clara",
      lastName: "Artist",
      role: "USER",
    },
    {
      email: "pov.enthusiast@example.com",
      firstName: "Hugo",
      lastName: "Perspective",
      role: "USER",
    },
    {
      email: "casual.reader@example.com",
      firstName: "Jade",
      lastName: "Casual",
      role: "USER",
    },
    {
      email: "binge.buyer@example.com",
      firstName: "Maxime",
      lastName: "Binge",
      role: "USER",
    },
    {
      email: "diverse.buyer@example.com",
      firstName: "Chloé",
      lastName: "Diverse",
      role: "USER",
    },
    {
      email: "late.starter@example.com",
      firstName: "Antoine",
      lastName: "Late",
      role: "USER",
    },
  ];

  const users = [];
  for (const profile of userProfiles) {
    const user = await prisma.user.create({
      data: {
        ...profile,
        passwordHash: userHash,
        status: "ACTIVE",
      },
    });
    users.push(user);
  }

  console.log("✅ 10 users created with varied profiles");

  // Create orders with specific behavior patterns
  const orderTypes = ["CHAPTER", "BUNDLE", "VERSION_PACK", "COLORING"];
  const orderAmounts = [699, 1499, 899, 399];
  let orderCount = 0;

  // 1. Early Adopter - 5 massive purchases in January, then slows down
  for (let i = 0; i < 5; i++) {
    await prisma.order.create({
      data: {
        userId: users[0].id,
        type: orderTypes[i % 4],
        status: "PAID",
        provider: "stripe",
        currency: "EUR",
        amountTotal: orderAmounts[i % 4],
        createdAt: createDate2025(0, 3 + i * 2),
      },
    });
    orderCount++;
  }
  // Then 2 more later
  await prisma.order.create({
    data: {
      userId: users[0].id,
      type: "CHAPTER",
      status: "PAID",
      provider: "stripe",
      currency: "EUR",
      amountTotal: 699,
      createdAt: createDate2025(5, 15),
    },
  });
  await prisma.order.create({
    data: {
      userId: users[0].id,
      type: "BUNDLE",
      status: "PAID",
      provider: "stripe",
      currency: "EUR",
      amountTotal: 1499,
      createdAt: createDate2025(9, 10),
    },
  });
  orderCount += 2;

  // 2. Regular Reader - 1 purchase per month for 13 months (Jan 2025 - Jan 2026)
  for (let month = 0; month < 12; month++) {
    await prisma.order.create({
      data: {
        userId: users[1].id,
        type: orderTypes[month % 4],
        status: "PAID",
        provider: "stripe",
        currency: "EUR",
        amountTotal: orderAmounts[month % 4],
        createdAt: createDate2025(month, 10),
      },
    });
    orderCount++;
  }
  // January 2026
  await prisma.order.create({
    data: {
      userId: users[1].id,
      type: "CHAPTER",
      status: "PAID",
      provider: "stripe",
      currency: "EUR",
      amountTotal: 699,
      createdAt: createDate2026(0, 10),
    },
  });
  orderCount++;

  // 3. Bundle Lover - 6 bundles spread across the year (even months)
  for (let month = 0; month < 12; month += 2) {
    await prisma.order.create({
      data: {
        userId: users[2].id,
        type: "BUNDLE",
        status: "PAID",
        provider: "stripe",
        currency: "EUR",
        amountTotal: 1499,
        createdAt: createDate2025(month, 12),
      },
    });
    orderCount++;
  }

  // 4. Chapter Collector - 4 complete chapters at different times
  const chapterMonths = [1, 4, 7, 10];
  for (const month of chapterMonths) {
    await prisma.order.create({
      data: {
        userId: users[3].id,
        type: "CHAPTER",
        status: "PAID",
        provider: "stripe",
        currency: "EUR",
        amountTotal: 699,
        createdAt: createDate2025(month, 5),
      },
    });
    orderCount++;
  }

  // 5. Coloring Fan - 8 coloring books spread out
  const coloringMonths = [0, 2, 3, 5, 6, 8, 9, 11];
  for (const month of coloringMonths) {
    await prisma.order.create({
      data: {
        userId: users[4].id,
        type: "COLORING",
        status: "PAID",
        provider: "stripe",
        currency: "EUR",
        amountTotal: 399,
        createdAt: createDate2025(month, 8),
      },
    });
    orderCount++;
  }

  // 6. POV Enthusiast - 7 perspective packs
  const povMonths = [1, 2, 4, 6, 7, 9, 11];
  for (const month of povMonths) {
    await prisma.order.create({
      data: {
        userId: users[5].id,
        type: "VERSION_PACK",
        status: "PAID",
        provider: "stripe",
        currency: "EUR",
        amountTotal: 899,
        createdAt: createDate2025(month, 15),
      },
    });
    orderCount++;
  }

  // 7. Casual Reader - 3 spaced purchases only
  const casualMonths = [2, 6, 10];
  for (let i = 0; i < casualMonths.length; i++) {
    await prisma.order.create({
      data: {
        userId: users[6].id,
        type: orderTypes[i % 4],
        status: "PAID",
        provider: "stripe",
        currency: "EUR",
        amountTotal: orderAmounts[i % 4],
        createdAt: createDate2025(casualMonths[i], 20),
      },
    });
    orderCount++;
  }

  // 8. Binge Buyer - 11 purchases in 2 concentrated periods (March + August)
  // March - 6 purchases
  for (let i = 0; i < 6; i++) {
    await prisma.order.create({
      data: {
        userId: users[7].id,
        type: orderTypes[i % 4],
        status: "PAID",
        provider: "stripe",
        currency: "EUR",
        amountTotal: orderAmounts[i % 4],
        createdAt: createDate2025(2, 5 + i * 3),
      },
    });
    orderCount++;
  }
  // August - 5 purchases
  for (let i = 0; i < 5; i++) {
    await prisma.order.create({
      data: {
        userId: users[7].id,
        type: orderTypes[i % 4],
        status: "PAID",
        provider: "stripe",
        currency: "EUR",
        amountTotal: orderAmounts[i % 4],
        createdAt: createDate2025(7, 8 + i * 4),
      },
    });
    orderCount++;
  }

  // 9. Diverse Buyer - 10 varied purchases of all types
  const diverseSchedule = [
    { month: 0, type: 0, day: 15 },
    { month: 1, type: 3, day: 8 },
    { month: 2, type: 1, day: 22 },
    { month: 3, type: 2, day: 12 },
    { month: 5, type: 0, day: 18 },
    { month: 6, type: 3, day: 25 },
    { month: 7, type: 1, day: 7 },
    { month: 9, type: 2, day: 14 },
    { month: 10, type: 0, day: 20 },
    { month: 11, type: 3, day: 5 },
  ];
  for (const purchase of diverseSchedule) {
    await prisma.order.create({
      data: {
        userId: users[8].id,
        type: orderTypes[purchase.type],
        status: "PAID",
        provider: "stripe",
        currency: "EUR",
        amountTotal: orderAmounts[purchase.type],
        createdAt: createDate2025(purchase.month, purchase.day),
      },
    });
    orderCount++;
  }

  // 10. Late Starter - 15 increasing purchases from June to December (1→2→3→4→5)
  let day = 5;
  // June - 1 purchase
  await prisma.order.create({
    data: {
      userId: users[9].id,
      type: "CHAPTER",
      status: "PAID",
      provider: "stripe",
      currency: "EUR",
      amountTotal: 699,
      createdAt: createDate2025(5, day),
    },
  });
  orderCount++;

  // July - 2 purchases
  for (let i = 0; i < 2; i++) {
    await prisma.order.create({
      data: {
        userId: users[9].id,
        type: orderTypes[i % 4],
        status: "PAID",
        provider: "stripe",
        currency: "EUR",
        amountTotal: orderAmounts[i % 4],
        createdAt: createDate2025(6, 5 + i * 10),
      },
    });
    orderCount++;
  }

  // August - 3 purchases
  for (let i = 0; i < 3; i++) {
    await prisma.order.create({
      data: {
        userId: users[9].id,
        type: orderTypes[i % 4],
        status: "PAID",
        provider: "stripe",
        currency: "EUR",
        amountTotal: orderAmounts[i % 4],
        createdAt: createDate2025(7, 3 + i * 8),
      },
    });
    orderCount++;
  }

  // September - 4 purchases
  for (let i = 0; i < 4; i++) {
    await prisma.order.create({
      data: {
        userId: users[9].id,
        type: orderTypes[i % 4],
        status: "PAID",
        provider: "stripe",
        currency: "EUR",
        amountTotal: orderAmounts[i % 4],
        createdAt: createDate2025(8, 2 + i * 7),
      },
    });
    orderCount++;
  }

  // October - 5 purchases
  for (let i = 0; i < 5; i++) {
    await prisma.order.create({
      data: {
        userId: users[9].id,
        type: orderTypes[i % 4],
        status: "PAID",
        provider: "stripe",
        currency: "EUR",
        amountTotal: orderAmounts[i % 4],
        createdAt: createDate2025(9, 1 + i * 6),
      },
    });
    orderCount++;
  }

  console.log(`✅ ${orderCount} orders created with varied patterns`);

  // ===== CONSTELLATIONS SYSTEM =====
  const CONSTELLATIONS = [
    {
      slug: "fondatrices",
      name: "Les Fondatrices",
      description: "Les histoires qui initient, ouvrent, marquent à jamais.",
      iconKey: "constellation-foundation",
      colorKey: "c-foundation",
    },
    {
      slug: "lumineuses",
      name: "Les Lumineuses",
      description: "Tendresse, chaleur, romantisme — la douceur qui transforme.",
      iconKey: "constellation-light",
      colorKey: "c-light",
    },
    {
      slug: "sombres",
      name: "Les Sombres",
      description: "Ombre, vertige, fascination — quand le désir flirte avec le danger.",
      iconKey: "constellation-dark",
      colorKey: "c-dark",
    },
    {
      slug: "indomptees",
      name: "Les Indomptées",
      description: "Feu libre, caractère, insoumission — l'amour comme rébellion.",
      iconKey: "constellation-wild",
      colorKey: "c-wild",
    },
    {
      slug: "transformatrices",
      name: "Les Transformatrices",
      description: "Celles qui guérissent, réveillent, métamorphosent.",
      iconKey: "constellation-change",
      colorKey: "c-change",
    },
  ];

  const constellations: { [key: string]: any } = {};
  for (const c of CONSTELLATIONS) {
    const constellation = await (prisma as any).constellation.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, iconKey: c.iconKey, colorKey: c.colorKey },
      create: {
        slug: c.slug,
        name: c.name,
        description: c.description,
        iconKey: c.iconKey,
        colorKey: c.colorKey,
      },
    });
    constellations[c.slug] = constellation;
  }

  console.log("✅ 5 constellations created");

  // ===== BADGES SYSTEM =====
  const BADGES = [
    {
      type: "PROGRESSION",
      code: "PREMIERE_BRULURE",
      name: "Première brûlure",
      description: "Premier pas franchi : la curiosité devient engagement.",
      iconKey: "badge-flame-1",
      minLevel: 2,
      constellationId: null,
    },
    {
      type: "PROGRESSION",
      code: "SILENCE_HABITE",
      name: "Silence habité",
      description: "Tu as appris à lire entre les lignes.",
      iconKey: "badge-silence",
      minLevel: 3,
      constellationId: null,
    },
    {
      type: "CONSTELLATION",
      code: "FONDATRICES_25",
      name: "Éclat fondateur",
      description: "25% — Les Fondatrices.",
      iconKey: "badge-star-25",
      minLevel: null,
      thresholdPct: 25,
      constellationSlug: "fondatrices",
    },
    {
      type: "CONSTELLATION",
      code: "FONDATRICES_50",
      name: "Page qui bascule",
      description: "50% — Les Fondatrices.",
      iconKey: "badge-star-50",
      minLevel: null,
      thresholdPct: 50,
      constellationSlug: "fondatrices",
    },
    {
      type: "STYLE",
      code: "LECTEUR_NOCTURNE",
      name: "Lecteur nocturne",
      description: "Tu reviens quand la ville dort.",
      iconKey: "badge-moon",
      minLevel: null,
      constellationId: null,
    },
    // ===== Thematic badges for chapters =====
    {
      type: "EDITORIAL",
      code: "FONDATRICES_BADGE",
      name: "🌹 FONDATRICES",
      description: "Ces récits racontent la naissance du désir et les amours qui changent une vie. Ici, le cœur précède le corps. On y apprend à aimer — et à devenir.",
      iconKey: "badge-fondatrices",
      minLevel: null,
      constellationId: null,
    },
    {
      type: "EDITORIAL",
      code: "SILENCES_BADGE",
      name: "🌙 SILENCES",
      description: "Des histoires où l'émotion s'installe lentement. Chaque regard compte. Chaque geste guérit. Ce sont les récits du souffle retenu et des aveux murmurés.",
      iconKey: "badge-silences",
      minLevel: null,
      constellationId: null,
    },
    {
      type: "EDITORIAL",
      code: "FLAMMES_LIBRES_BADGE",
      name: "🔥 FLAMMES LIBRES",
      description: "Des femmes qui ne demandent pas la permission. Des amours qui brûlent sans détour. Ici, le désir est assumé. La liberté est une arme.",
      iconKey: "badge-flammes",
      minLevel: null,
      constellationId: null,
    },
    {
      type: "EDITORIAL",
      code: "ABYSSES_BADGE",
      name: "🌑 ABYSSES",
      description: "Là où le plaisir frôle le danger. Là où aimer peut coûter cher. Ces récits explorent la part sombre du désir et la fascination qu'elle exerce.",
      iconKey: "badge-abysses",
      minLevel: null,
      constellationId: null,
    },
    {
      type: "EDITORIAL",
      code: "VERTIGE_BADGE",
      name: "⚡ BADGE VERTIGE",
      description: "Attribué aux volumes à haute intensité. Indique une charge émotionnelle et charnelle forte.",
      iconKey: "badge-vertige",
      minLevel: null,
      constellationId: null,
    },
  ];

  for (const b of BADGES) {
    const constellationId = (b as any).constellationSlug
      ? constellations[(b as any).constellationSlug].id
      : null;

    await (prisma as any).badge.upsert({
      where: { code: b.code },
      update: {
        type: (b as any).type,
        name: b.name,
        description: b.description,
        iconKey: b.iconKey,
        minLevel: (b as any).minLevel,
        thresholdPct: (b as any).thresholdPct,
        constellationId,
      },
      create: {
        type: (b as any).type,
        code: b.code,
        name: b.name,
        description: b.description,
        iconKey: b.iconKey,
        minLevel: (b as any).minLevel,
        thresholdPct: (b as any).thresholdPct,
        constellationId,
      },
    });
  }

  console.log("✅ 5 badges created");

  // ===== TAG CHAPTERS -> CONSTELLATIONS =====
  const CHAPTER_CONSTELLATION_MAP: Array<{
    protagonistName: string;
    constellations: { slug: string; weight?: number }[];
  }> = [
    {
      protagonistName: "Léa",
      constellations: [{ slug: "fondatrices" }, { slug: "lumineuses", weight: 60 }],
    },
    {
      protagonistName: "Jasmine",
      constellations: [{ slug: "sombres" }, { slug: "indomptees", weight: 40 }],
    },
    {
      protagonistName: "Emma",
      constellations: [{ slug: "indomptees" }, { slug: "sombres", weight: 50 }],
    },
    {
      protagonistName: "Belle",
      constellations: [{ slug: "lumineuses" }, { slug: "transformatrices", weight: 60 }],
    },
    {
      protagonistName: "Sophie",
      constellations: [{ slug: "fondatrices" }, { slug: "indomptees", weight: 70 }],
    },
    {
      protagonistName: "Léna",
      constellations: [{ slug: "sombres" }, { slug: "indomptees", weight: 80 }],
    },
    {
      protagonistName: "Clara",
      constellations: [{ slug: "transformatrices" }, { slug: "lumineuses", weight: 50 }],
    },
    {
      protagonistName: "Sunshine",
      constellations: [{ slug: "lumineuses" }, { slug: "fondatrices", weight: 40 }],
    },
    {
      protagonistName: "Jade",
      constellations: [{ slug: "indomptees" }, { slug: "sombres", weight: 60 }],
    },
    {
      protagonistName: "Esmeralda",
      constellations: [{ slug: "sombres" }, { slug: "transformatrices", weight: 70 }],
    },
    {
      protagonistName: "Chloé",
      constellations: [{ slug: "lumineuses" }, { slug: "fondatrices", weight: 50 }],
    },
    {
      protagonistName: "Ursula",
      constellations: [{ slug: "sombres" }, { slug: "indomptees", weight: 90 }],
    },
    {
      protagonistName: "Lily",
      constellations: [{ slug: "transformatrices" }, { slug: "indomptees", weight: 70 }],
    },
    {
      protagonistName: "Julia",
      constellations: [{ slug: "fondatrices" }, { slug: "sombres", weight: 40 }],
    },
  ];

  for (const map of CHAPTER_CONSTELLATION_MAP) {
    const chapters = await prisma.chapter.findMany({
      where: { protagonistName: map.protagonistName },
    });

    for (const ch of chapters) {
      for (const c of map.constellations) {
        const constellation = constellations[c.slug];
        if (!constellation) continue;

        await (prisma as any).chapterConstellation.create({
          data: {
            chapterId: ch.id,
            constellationId: constellation.id,
            weight: c.weight ?? 100,
          },
        });
      }
    }
  }

  console.log("✅ Chapter-Constellation tagging completed");

  // ===== ADD EMOTIONAL METRICS & XP TO VOLUMES =====
  function clamp(n: number) {
    return Math.max(0, Math.min(100, n));
  }

  function deriveXp(m: {
    intensite: number;
    douceur: number;
    danger: number;
    transformation: number;
    mystere: number;
    charme: number;
  }) {
    const xpFeu = clamp(Math.round(m.intensite * 0.7 + m.charme * 0.2 + m.mystere * 0.1));
    const xpAme = clamp(Math.round(m.douceur * 0.4 + m.transformation * 0.5 + m.mystere * 0.1));
    const xpOmbre = clamp(Math.round(m.danger * 0.7 + m.mystere * 0.3));
    return { xpFeu, xpAme, xpOmbre };
  }

  const volumes = await prisma.volume.findMany();
  for (let idx = 0; idx < volumes.length; idx++) {
    const v = volumes[idx];
    const baseIntensity = 40 + (idx % 4) * 15;

    const metrics = {
      intensite: clamp(baseIntensity),
      douceur: clamp(60 - (idx % 3) * 15),
      danger: clamp((idx % 5) * 20),
      transformation: clamp(50 + (idx % 3) * 10),
      mystere: clamp(55 + (idx % 4) * 10),
      charme: clamp(65 - (idx % 2) * 20),
    };

    const xp = deriveXp(metrics);

    await prisma.volume.update({
      where: { id: v.id },
      data: {
        intensite: metrics.intensite,
        douceur: metrics.douceur,
        danger: metrics.danger,
        transformation: metrics.transformation,
        mystere: metrics.mystere,
        charme: metrics.charme,
        xpFeuBase: xp.xpFeu,
        xpAmeBase: xp.xpAme,
        xpOmbreBase: xp.xpOmbre,
      } as any,
    });
  }

  console.log("✅ Emotional metrics & XP added to all volumes");

  // ===== USER PROGRESSION =====
  for (let idx = 0; idx < users.length; idx++) {
    const user = users[idx];
    const baseLevel = 1 + Math.floor(idx / 2);
    const xpFeu = 100 + idx * 50;
    const xpAme = 80 + idx * 40;
    const xpOmbre = 60 + idx * 30;

    const totalXp = xpFeu + xpAme + xpOmbre;
    const feuPct = Math.round((xpFeu / totalXp) * 100);
    const amePct = Math.round((xpAme / totalXp) * 100);
    const ombrePct = Math.round((xpOmbre / totalXp) * 100);

    await (prisma as any).userProgress.create({
      data: {
        userId: user.id,
        level: baseLevel,
        xpFeu,
        xpAme,
        xpOmbre,
        feuPct,
        amePct,
        ombrePct,
      },
    });
  }

  console.log("✅ User progression initialized");

  // ===== EXAMPLE REWARD UNLOCKS =====
  await (prisma as any).rewardUnlock.upsert({
    where: { code: "REVELATION_MIROIR_01" },
    update: {
      title: "Scène miroir",
      teaser: "Un même instant, un autre angle — sans dévoiler la suite.",
      payload: { kind: "mirror_scene", hint: "alternate_pov" },
    },
    create: {
      type: "REVELATION",
      code: "REVELATION_MIROIR_01",
      title: "Scène miroir",
      teaser: "Un même instant, un autre angle — sans dévoiler la suite.",
      payload: { kind: "mirror_scene", hint: "alternate_pov" },
    },
  });

  await (prisma as any).rewardUnlock.upsert({
    where: { code: "BONUS_COULISSES" },
    update: {
      title: "Coulisses",
      teaser: "Comment cette scène s'est écrite.",
      payload: { kind: "author_insight" },
    },
    create: {
      type: "BONUS_EXCERPT",
      code: "BONUS_COULISSES",
      title: "Coulisses",
      teaser: "Comment cette scène s'est écrite.",
      payload: { kind: "author_insight" },
    },
  });

  console.log("✅ Reward unlocks created");

  // ===== UPDATE CHAPTERS WITH ACCROCHES & LEVELS =====
  const CHAPTER_ACCROCHES: { [key: string]: any } = {
    Lanmou: {
      accroche_classic: "Dans la chaleur d'un instant volé, Lanmou incarne la douceur brûlante des rencontres inattendues, un amour discret, vibrant, qui naît dans le silence et s'épanouit loin des regards.",
      accroche_dark: "Avec Lanmou, la tendresse flirte avec l'urgence. Les regards s'alourdissent, les mains se cherchent sans détour, et chaque étreinte semble porter la trace d'un adieu possible.",
      accroche_love: "Lanmou est une lumière douce dans un monde agité. Une femme dont la sensualité se mêle à la délicatesse, où chaque geste devient une confidence et chaque baiser une promesse murmurée.",
      accroche_marketing: "Découvrez Lanmou, une passion à fleur de peau où l'intimité devient refuge et où chaque instant partagé laisse une empreinte indélébile.",
      accroche_dark_collection: "Avec Lanmou, l'abandon n'est jamais innocent. Sous la douceur se cache une intensité troublante, un désir qui serre, qui marque, qui brûle, comme si chaque nuit pouvait être la dernière.",
      niveau_intensite: 3,
      niveau_douceur: 4,
      niveau_danger: 2,
      niveau_transformation: 3,
      badges: ["FONDATRICES_BADGE", "SILENCES_BADGE"],
    },
    Belle: {
      accroche_classic: "Plongez dans une histoire où les mots deviennent caresses et les silences des promesses, là où, entre les rayonnages d'une bibliothèque oubliée, deux esprits libres apprennent à se reconnaître avant même de s'aimer.",
      accroche_dark: "Entre les rayonnages feutrés, le silence cache une tension vibrante. Le désir se glisse entre les pages, interdit mais inévitable.",
      accroche_love: "Dans la lumière d'une bibliothèque, deux esprits se reconnaissent avant que les corps n'osent se chercher, une romance née des mots avant les gestes.",
      accroche_marketing: "Une bibliothèque, des lettres secrètes, un amour qui naît dans le silence des pages… Entrez dans le récit fondateur où le désir commence par les mots et où chaque regard devient une promesse.",
      accroche_dark_collection: "Entre les étagères silencieuses, le désir s'écrit à l'encre interdite. L'innocence n'est qu'une façade : derrière les livres sages, les corps apprennent à brûler en secret.",
      niveau_intensite: 3,
      niveau_douceur: 4,
      niveau_danger: 2,
      niveau_transformation: 4,
      badges: ["FONDATRICES_BADGE", "SILENCES_BADGE"],
    },
    Ursula: {
      accroche_classic: "Osez descendre dans les profondeurs d'un désir incandescent, où l'ombre séduit, où la tentation ensorcelle, et où aimer signifie parfois affronter la part la plus obscure de soi-même.",
      accroche_dark: "Descendez là où la mer se fait noire. Là où l'amour se mêle au pouvoir, et où l'ombre enlace avec une douceur aussi dangereuse qu'irrésistible.",
      accroche_love: "Sous la surface des apparences, découvrez un cœur que même les abysses n'ont pas entièrement englouti, une passion profonde, fragile derrière sa force.",
      accroche_marketing: "Plongez dans une passion abyssale où la tentation a le goût du sel et du pouvoir. Une histoire magnétique, dangereuse, inoubliable, là où aimer signifie risquer de se perdre.",
      accroche_dark_collection: "Dans les abysses, elle ne séduit pas, elle réclame. Chaque étreinte est une morsure, chaque regard une promesse de chute. Aimer Ursula, c'est accepter de se noyer volontairement.",
      niveau_intensite: 5,
      niveau_douceur: 2,
      niveau_danger: 5,
      niveau_transformation: 4,
      badges: ["ABYSSES_BADGE", "VERTIGE_BADGE"],
    },
    Esmeralda: {
      accroche_classic: "Entrez dans une danse de feu et de liberté, où les regards brûlent plus fort que les torches et où l'amour naît dans le fracas des interdits et le vertige du danger.",
      accroche_dark: "Danseuse de feu, insoumise et ardente, elle aime comme elle combat : sans plier. La passion devient défi, et l'étreinte un acte de rébellion.",
      accroche_love: "Libre comme le vent, elle porte en elle une flamme qui éclaire autant qu'elle réchauffe, et son amour est un pas de danse offert au destin.",
      accroche_marketing: "Dansez au cœur des flammes, entre liberté, danger et passion indomptable. Une romance vibrante où chaque étreinte défie le monde entier.",
      accroche_dark_collection: "Elle danse comme on provoque. Elle embrasse comme on défie. Avec elle, la passion n'est jamais tendre, elle est incendie public.",
      niveau_intensite: 5,
      niveau_douceur: 1,
      niveau_danger: 4,
      niveau_transformation: 4,
      badges: ["FLAMMES_LIBRES_BADGE", "VERTIGE_BADGE"],
    },
    Jasmine: {
      accroche_classic: "Laissez-vous porter par une romance hors des murs et des couronnes, où le vent du désert effleure les peaux et où deux âmes rêvent d'un monde plus vaste que celui qu'on leur impose.",
      accroche_dark: "Sous les soieries et les étoiles du désert, le désir brûle en secret. Aimer devient un acte de rébellion contre les couronnes et les destins écrits.",
      accroche_love: "Entre palais et horizons infinis, elle apprend que le véritable royaume est celui du cœur, là où l'amour ne connaît ni murs ni frontières.",
      accroche_marketing: "Un jardin secret, une princesse insoumise, un amour qui ose défier les trônes. Découvrez la romance qui murmure sous les étoiles d'Orient.",
      accroche_dark_collection: "Sous la soie turquoise se cache une rébellion sensuelle. Elle veut choisir, posséder, goûter le monde et l'homme qu'elle désire ne doit jamais trembler face à sa liberté.",
      niveau_intensite: 4,
      niveau_douceur: 2,
      niveau_danger: 3,
      niveau_transformation: 3,
      badges: ["FLAMMES_LIBRES_BADGE"],
    },
    Julia: {
      accroche_classic: "Plongez dans une atmosphère envoûtante où l'ombre devient langage et où la sensualité prend la forme d'un rituel intime et magnétique.",
      accroche_dark: "Sous les éclats de rire se cache une tension latente, un désir qui attend le bon moment pour franchir la frontière de l'amitié.",
      accroche_love: "Un lien né de la complicité, où la tendresse se transforme doucement en passion, presque sans qu'on s'en aperçoive.",
      accroche_marketing: "Quand l'amitié bascule vers le désir… Julia incarne ces instants suspendus où tout peut changer.",
      accroche_dark_collection: "Complice en surface, dangereuse en profondeur. Elle sourit… puis s'approche trop près. Et soudain, la frontière n'existe plus.",
      niveau_intensite: 4,
      niveau_douceur: 3,
      niveau_danger: 3,
      niveau_transformation: 3,
      badges: ["SILENCES_BADGE", "ABYSSES_BADGE"],
    },
    Fany: {
      accroche_classic: "Vivez une aventure ardente et imprévisible, où le plaisir s'assume sans détour et où la liberté se savoure à pleine peau.",
      accroche_dark: "Entrez dans une fièvre sans détour, où les corps se cherchent sans permission et où chaque regard contient une promesse dangereuse. Avec elle, le désir ne demande pas à être apprivoisé — il exige.",
      accroche_love: "Approchez une âme vive et solaire, dont la sensualité naît d'un rire franc et d'un cœur ouvert, et découvrez comment une passion peut éclore dans la lumière la plus simple.",
      accroche_marketing: "Audacieuse, imprévisible, incendiaire. Avec Fany, le plaisir n'attend pas, il s'impose.",
      accroche_dark_collection: "Elle ne demande pas la permission. Elle prend, provoque, entraîne. Avec Fany, la passion n'est jamais tendre, elle est incendie public.",
      niveau_intensite: 5,
      niveau_douceur: 1,
      niveau_danger: 4,
      niveau_transformation: 3,
      badges: ["FLAMMES_LIBRES_BADGE", "VERTIGE_BADGE"],
    },
    Charlène: {
      accroche_classic: "Glissez dans une atmosphère feutrée de secrets et de regards troublés, où la lumière filtre à travers les feuilles et où le désir s'installe sans bruit, mais sans retour.",
      accroche_dark: "Sous l'ombre des feuilles, le silence devient tension. Une lenteur brûlante s'installe, où chaque souffle trop proche menace de faire céder la retenue.",
      accroche_love: "Dans la douceur d'un instant suspendu, laissez-vous toucher par une sensualité discrète, faite de regards timides et d'émotions qui s'éveillent comme au premier jour.",
      accroche_marketing: "Sous un figuier, dans l'ombre chaude d'un après-midi suspendu, une passion lente et troublante prend racine. Un récit sensuel et lumineux à découvrir.",
      accroche_dark_collection: "Sous l'ombre des feuilles, elle apprend que le désir peut être lent… et implacable. Avec elle, la tension est un poison délicieux.",
      niveau_intensite: 3,
      niveau_douceur: 4,
      niveau_danger: 2,
      niveau_transformation: 3,
      badges: ["SILENCES_BADGE"],
    },
    Anaïs: {
      accroche_classic: "Laissez-vous surprendre par une sensualité naissante, fragile et lumineuse, où le cœur bat plus fort que la raison et où le monde s'élargit à chaque frisson.",
      accroche_dark: "Entre innocence et vertige, suivez le frisson d'une femme qui apprend à transformer ses hésitations en feu, et ses silences en aveux brûlants.",
      accroche_love: "Assistez à la naissance d'un désir délicat, où chaque geste est une découverte et chaque émotion une fleur qui s'ouvre lentement.",
      accroche_marketing: "Fragile en apparence, intense en profondeur. Un récit d'éveil où chaque émotion devient une découverte brûlante.",
      accroche_dark_collection: "L'innocence se fissure, le vertige s'installe. Elle découvre que le feu ne détruit pas toujours, parfois il révèle.",
      niveau_intensite: 3,
      niveau_douceur: 4,
      niveau_danger: 2,
      niveau_transformation: 4,
      badges: ["FONDATRICES_BADGE", "SILENCES_BADGE"],
    },
    Valérie: {
      accroche_classic: "Avec Valérie, l'intimité ne commence pas par la douceur, mais par l'intensité. Elle avance, sûre d'elle, impose le rythme, teste les limites. Ce n'est pas une histoire d'équilibre fragile, c'est une danse volontaire entre deux volontés fortes.",
      accroche_dark: "Valérie ne joue pas. Elle provoque. Elle pousse, résiste, exige qu'on la contienne sans jamais l'éteindre. La passion devient affrontement charnel, lutte magnétique où le désir naît dans la friction et l'insolence.",
      accroche_love: "Derrière son audace se cache une femme qui choisit enfin de faire confiance. Son abandon n'est jamais subi, il est offert. Et dans ce choix libre naît une intimité plus profonde qu'elle ne l'aurait cru possible.",
      accroche_marketing: "Indomptable, intense, imprévisible. Avec Valérie, le désir n'est jamais tiède, il brûle, il défie, il marque. Entrez dans une histoire où la passion a du caractère.",
      accroche_dark_collection: "Elle provoque, elle résiste, elle défie. La tension est électrique, les rôles se renversent, et le plaisir naît dans le bras de fer.",
      niveau_intensite: 5,
      niveau_douceur: 1,
      niveau_danger: 5,
      niveau_transformation: 3,
      badges: ["FLAMMES_LIBRES_BADGE", "VERTIGE_BADGE"],
    },
    Monica: {
      accroche_classic: "Explorez un éveil délicat et vibrant, là où les premiers frissons ouvrent des portes intérieures et où chaque geste devient une révélation.",
      accroche_dark: "Ce qui semblait fragile devient audace. La douceur se mue en faim assumée, et la renaissance passe par la peau.",
      accroche_love: "Un parcours intime où l'on apprend à s'aimer à travers l'autre, et où chaque caresse devient une affirmation de soi.",
      accroche_marketing: "Laissez-vous emporter par un éveil vibrant, intime et sincère, une histoire où chaque frisson ouvre une nouvelle porte vers soi-même.",
      accroche_dark_collection: "Ce qui semblait fragile devient faim. Chaque hésitation se transforme en fièvre, chaque frisson en revendication de son propre corps.",
      niveau_intensite: 3,
      niveau_douceur: 4,
      niveau_danger: 1,
      niveau_transformation: 4,
      badges: ["FONDATRICES_BADGE", "SILENCES_BADGE"],
    },
    Aurore: {
      accroche_classic: "Dans la nature sauvage, sous la pluie ou dans la nuit, deux âmes s'embrasent sans retenue, portées par une passion instinctive.",
      accroche_dark: "Sous la pluie ou dans la nuit des bois, la passion s'écrit en gestes instinctifs, puissants, indomptés.",
      accroche_love: "Au cœur de la nature, l'amour devient souffle partagé, et chaque instant prend la couleur d'un souvenir éternel.",
      accroche_marketing: "Libre, intense, sauvage. Aurore incarne l'amour qui s'écrit dans le vent, la pluie et la peau.",
      accroche_dark_collection: "Sauvage, instinctive, indomptée. Sous la pluie ou dans la forêt, la passion devient primitive, presque animale.",
      niveau_intensite: 5,
      niveau_douceur: 2,
      niveau_danger: 4,
      niveau_transformation: 4,
      badges: ["FLAMMES_LIBRES_BADGE", "VERTIGE_BADGE"],
    },
    Elodie: {
      accroche_classic: "Explorez une passion née du contrôle et du lâcher-prise, où la force apparente s'adoucit dans l'intimité d'un regard sincère.",
      accroche_dark: "Dans les lieux où l'on n'ose pas regarder trop longtemps, elle découvre l'excitation du risque et la chaleur d'un abandon maîtrisé.",
      accroche_love: "Une femme forte qui apprend à laisser tomber les armures, et trouve dans la tendresse un refuge inattendu.",
      accroche_marketing: "Élodie, c'est l'excitation du risque et la douceur de l'abandon. Une romance vibrante, entre maîtrise et frisson.",
      accroche_dark_collection: "Forte le jour, vulnérable la nuit. Elle découvre l'excitation du risque, le frisson d'être vue… puis possédée par le moment.",
      niveau_intensite: 4,
      niveau_douceur: 2,
      niveau_danger: 4,
      niveau_transformation: 3,
      badges: ["SILENCES_BADGE", "ABYSSES_BADGE"],
    },
    Vanil: {
      accroche_classic: "Plongez dans une histoire d'attente et de tension retenue, où chaque frôlement compte et où l'amour s'écrit dans les gestes que l'on n'ose pas toujours nommer.",
      accroche_dark: "Les regards se chargent, les silences deviennent lourds, et la lenteur précède une intensité qui consume tout sur son passage.",
      accroche_love: "Une passion patiente, faite de gestes retenus et de promesses murmurées, où l'émotion précède toujours la fièvre.",
      accroche_marketing: "Une tension qui monte, des silences chargés d'électricité, une attente délicieusement insupportable. Vanil incarne la passion qui brûle lentement… jusqu'à l'explosion.",
      accroche_dark_collection: "La retenue est une illusion. Sous ses silences se cache une tempête prête à tout renverser. Elle attend qu'on la fasse tomber sans la briser.",
      niveau_intensite: 4,
      niveau_douceur: 3,
      niveau_danger: 3,
      niveau_transformation: 3,
      badges: ["SILENCES_BADGE"],
    },
    Laetitia: {
      accroche_classic: "Entrez dans un univers où la douceur dissimule l'intensité, où les silences sont chargés d'électricité et où le désir s'exprime dans la lenteur d'un regard soutenu.",
      accroche_dark: "Sous la retenue apparente, un désir vibrant attend d'être révélé, prêt à franchir la frontière entre contrôle et abandon.",
      accroche_love: "Une sensualité subtile, presque murmurée, où chaque contact est un apprentissage de la confiance.",
      accroche_marketing: "Derrière la douceur se cache une intensité inattendue. Une romance délicate où le désir s'installe lentement… et ne s'efface plus.",
      accroche_dark_collection: "Le silence est son arme. La lenteur, son piège. Quand elle s'ouvre enfin, ce n'est pas pour être sauvée, c'est pour être consumée.",
      niveau_intensite: 3,
      niveau_douceur: 4,
      niveau_danger: 2,
      niveau_transformation: 3,
      badges: ["SILENCES_BADGE"],
    },
    Luna: {
      accroche_classic: "Plongez dans une atmosphère envoûtante où l'ombre devient langage et où la sensualité prend la forme d'un rituel intime et magnétique.",
      accroche_dark: "Entre ombre et lumière, le corps devient rituel. L'étreinte prend la forme d'une cérémonie secrète, magnétique et troublante.",
      accroche_love: "Dans un univers chargé de symboles, l'amour s'exprime avec intensité et délicatesse, comme une œuvre que l'on contemple et que l'on ressent.",
      accroche_marketing: "Mystique, intense, magnétique. Luna vous entraîne dans un univers où le corps devient cérémonie et le désir, une invocation.",
      accroche_dark_collection: "Rituelle. Magnétique. Troublante. Avec Luna, l'amour devient cérémonie obscure, où l'abandon frôle la transe.",
      niveau_intensite: 4,
      niveau_douceur: 3,
      niveau_danger: 3,
      niveau_transformation: 4,
      badges: ["ABYSSES_BADGE", "SILENCES_BADGE"],
    },
    Nelly: {
      accroche_classic: "Découvrez une passion qui guérit autant qu'elle consume, où l'abandon devient confiance et où le corps, enfin écouté, retrouve le chemin de sa propre lumière.",
      accroche_dark: "Sous sa douceur apparente sommeille une intensité brûlante. Elle apprend à abandonner ses peurs pour renaître dans le frisson du désir assumé.",
      accroche_love: "Une femme qui se reconstruit pas à pas, découvrant que la tendresse peut devenir force et que l'amour peut guérir ce que le passé a blessé.",
      accroche_marketing: "Une passion réparatrice, sensuelle et profonde. Avec Nelly, le désir devient renaissance.",
      accroche_dark_collection: "Douce en apparence, brûlante dans l'abandon. Elle se livre, se tend, se cambre et découvre que céder peut être une puissance.",
      niveau_intensite: 3,
      niveau_douceur: 4,
      niveau_danger: 1,
      niveau_transformation: 4,
      badges: ["FONDATRICES_BADGE", "SILENCES_BADGE"],
    },
  };

  // Update chapters with accroches and levels
  for (const [protagonist, data] of Object.entries(CHAPTER_ACCROCHES)) {
    const chapter = await prisma.chapter.findFirst({
      where: { protagonistName: protagonist },
    });

    if (chapter) {
      await prisma.chapter.update({
        where: { id: chapter.id },
        data: {
          accroche_classic: data.accroche_classic,
          accroche_dark: data.accroche_dark,
          accroche_love: data.accroche_love,
          accroche_marketing: data.accroche_marketing,
          accroche_dark_collection: data.accroche_dark_collection,
          niveau_intensite: data.niveau_intensite,
          niveau_douceur: data.niveau_douceur,
          niveau_danger: data.niveau_danger,
          niveau_transformation: data.niveau_transformation,
        } as any,
      });

      // Award badges to first user if chapter has thematic badges
      if (data.badges && users.length > 0) {
        for (const badgeCode of data.badges) {
          const badge = await (prisma as any).badge.findUnique({
            where: { code: badgeCode },
          });

          if (badge) {
            await (prisma as any).userBadge.upsert({
              where: { userId_badgeId: { userId: users[0].id, badgeId: badge.id } },
              update: {},
              create: { userId: users[0].id, badgeId: badge.id },
            });
          }
        }
      }
    }
  }

  console.log("✅ Chapters updated with accroches, levels, and badges");
  console.log("   - Early Adopter: 7 orders (5 in Jan, then slows)");
  console.log("   - Regular Reader: 13 orders (1/month Jan 2025-Jan 2026)");
  console.log("   - Bundle Lover: 6 bundles (even months)");
  console.log("   - Chapter Collector: 4 chapters");
  console.log("   - Coloring Fan: 8 coloring books");
  console.log("   - POV Enthusiast: 7 perspective packs");
  console.log("   - Casual Reader: 3 spaced purchases");
  console.log("   - Binge Buyer: 11 orders (6 in March + 5 in August)");
  console.log("   - Diverse Buyer: 10 varied purchases");
  console.log("   - Late Starter: 15 growing purchases (Jun-Oct)");
  console.log("\n✨ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
