import prisma from '../../../lib/prisma';
import { OrderStatus, SubscriptionStatus } from '@prisma/client';

export class DashboardService {
  async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalUsers,
      totalChapters,
      totalOrders,
      totalRevenue,
      recentOrders,
      activeSubscriptions,
      newSubsThisMonth,
      newSubsLastMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.chapter.count(),
      prisma.order.count({ where: { status: OrderStatus.PAID } }),
      prisma.order.aggregate({
        where: { status: OrderStatus.PAID },
        _sum: { amountTotal: true },
      }),
      prisma.order.findMany({
        where: { status: OrderStatus.PAID },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.subscription.count({
        where: { status: SubscriptionStatus.ACTIVE },
      }),
      prisma.subscription.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.subscription.count({
        where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } },
      }),
    ]);

    const subsChange = newSubsLastMonth === 0
      ? (newSubsThisMonth > 0 ? 100 : 0)
      : Math.round(((newSubsThisMonth - newSubsLastMonth) / newSubsLastMonth) * 100);

    return {
      totalUsers,
      totalChapters,
      totalOrders,
      totalRevenue: totalRevenue._sum.amountTotal || 0,
      subscriptions: {
        active: activeSubscriptions,
        newThisMonth: newSubsThisMonth,
        change: subsChange,
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        type: order.type,
        amount: order.amountTotal,
        currency: order.currency,
        userEmail: order.user.email,
        createdAt: order.createdAt,
      })),
    };
  }

  async getKPIs() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Previous periods for comparison
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    const startOfLastMonth = new Date(startOfMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    const startOfLastYear = new Date(startOfYear);
    startOfLastYear.setFullYear(startOfLastYear.getFullYear() - 1);

    // Revenue queries
    const [
      revenueToday,
      revenueYesterday,
      revenueThisWeek,
      revenueLastWeek,
      revenueThisMonth,
      revenueLastMonth,
      revenueThisYear,
      revenueLastYear,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { status: OrderStatus.PAID, createdAt: { gte: startOfToday } },
        _sum: { amountTotal: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: {
          status: OrderStatus.PAID,
          createdAt: { gte: startOfYesterday, lt: startOfToday },
        },
        _sum: { amountTotal: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: { status: OrderStatus.PAID, createdAt: { gte: startOfWeek } },
        _sum: { amountTotal: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: {
          status: OrderStatus.PAID,
          createdAt: { gte: startOfLastWeek, lt: startOfWeek },
        },
        _sum: { amountTotal: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: { status: OrderStatus.PAID, createdAt: { gte: startOfMonth } },
        _sum: { amountTotal: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: {
          status: OrderStatus.PAID,
          createdAt: { gte: startOfLastMonth, lt: startOfMonth },
        },
        _sum: { amountTotal: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: { status: OrderStatus.PAID, createdAt: { gte: startOfYear } },
        _sum: { amountTotal: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: {
          status: OrderStatus.PAID,
          createdAt: { gte: startOfLastYear, lt: startOfYear },
        },
        _sum: { amountTotal: true },
        _count: true,
      }),
    ]);

    // Top content - now using refId field
    const [topChapters, topVolumes] = await Promise.all([
      prisma.order.groupBy({
        by: ['refId'],
        where: {
          status: OrderStatus.PAID,
          type: 'CHAPTER',
          refId: { not: null },
        },
        _count: true,
        _sum: { amountTotal: true },
        orderBy: { _count: { refId: 'desc' } },
        take: 5,
      }),
      prisma.order.groupBy({
        by: ['refId'],
        where: {
          status: OrderStatus.PAID,
          // @ts-ignore - VOLUME type not in OrderType enum but used in existing code
          type: { in: ['VOLUME', 'PREORDER'] },
          refId: { not: null },
        },
        _count: true,
        _sum: { amountTotal: true },
        orderBy: { _count: { refId: 'desc' } },
        take: 5,
      }),
    ]);

    // Enrich with chapter details
    const topChaptersWithDetails = await Promise.all(
      topChapters.map(async (item) => {
        const chapter = await prisma.chapter.findUnique({
          where: { id: item.refId! },
          select: { id: true, title: true, protagonistName: true },
        });
        return {
          refId: item.refId,
          count: item._count,
          // @ts-ignore - item._sum is possibly undefined
          revenue: item._sum?.amountTotal || 0,
          chapter,
        };
      })
    );

    // Enrich with volume details
    const topVolumesWithDetails = await Promise.all(
      topVolumes.map(async (item) => {
        // Try to find as chapter first (for VOLUME types that reference chapters)
        const chapter = await prisma.chapter.findUnique({
          where: { id: item.refId! },
          select: { id: true, title: true, protagonistName: true },
        });
        return {
          refId: item.refId,
          count: item._count,
          // @ts-ignore - item._sum is possibly undefined
          revenue: item._sum?.amountTotal || 0,
          chapter,
        };
      })
    );

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      revenue: {
        today: {
          amount: revenueToday._sum.amountTotal || 0,
          count: revenueToday._count,
          change: calculateChange(
            revenueToday._sum.amountTotal || 0,
            revenueYesterday._sum.amountTotal || 0
          ),
        },
        week: {
          amount: revenueThisWeek._sum.amountTotal || 0,
          count: revenueThisWeek._count,
          change: calculateChange(
            revenueThisWeek._sum.amountTotal || 0,
            revenueLastWeek._sum.amountTotal || 0
          ),
        },
        month: {
          amount: revenueThisMonth._sum.amountTotal || 0,
          count: revenueThisMonth._count,
          change: calculateChange(
            revenueThisMonth._sum.amountTotal || 0,
            revenueLastMonth._sum.amountTotal || 0
          ),
        },
        year: {
          amount: revenueThisYear._sum.amountTotal || 0,
          count: revenueThisYear._count,
          change: calculateChange(
            revenueThisYear._sum.amountTotal || 0,
            revenueLastYear._sum.amountTotal || 0
          ),
        },
      },
      topChapters: topChaptersWithDetails,
      topVolumes: topVolumesWithDetails,
    };
  }

  /**
   * Get insights data: emotional scores, trend projection, reader funnel, peak hours
   */
  async getInsights() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Narrative Performance: weighted average of chapter emotional levels by read count
    const chaptersWithReads = await prisma.chapter.findMany({
      where: { isArchived: false },
      select: {
        id: true,
        title: true,
        protagonistName: true,
        niveau_danger: true,
        niveau_douceur: true,
        niveau_intensite: true,
        niveau_transformation: true,
        _count: { select: { reads: true } },
      },
    });

    let totalWeight = 0;
    let weightedDanger = 0, weightedDouceur = 0, weightedIntensite = 0, weightedTransformation = 0;
    let topChapterByReads: { title: string; protagonistName: string } | null = null;
    let maxReads = 0;

    for (const ch of chaptersWithReads) {
      const weight = ch._count.reads || 1; // min 1 to include unread chapters
      totalWeight += weight;
      weightedDanger += (ch.niveau_danger ?? 3) * weight;
      weightedDouceur += (ch.niveau_douceur ?? 3) * weight;
      weightedIntensite += (ch.niveau_intensite ?? 3) * weight;
      weightedTransformation += (ch.niveau_transformation ?? 3) * weight;
      if (ch._count.reads > maxReads) {
        maxReads = ch._count.reads;
        topChapterByReads = { title: ch.title, protagonistName: ch.protagonistName };
      }
    }

    const toPercent = (weighted: number) => totalWeight > 0 ? Math.round((weighted / totalWeight / 5) * 100) : 50;

    const narrativePerformance = {
      topChapter: topChapterByReads,
      metrics: [
        { label: 'Intensite', value: toPercent(weightedIntensite) },
        { label: 'Tension', value: toPercent(weightedDanger) },
        { label: 'Mystere', value: toPercent(weightedTransformation) },
        { label: 'Romance', value: toPercent(weightedDouceur) },
      ],
    };

    // 2. Trend Projection: reading sessions per day for the last 7 days
    const sessions = await prisma.readingSession.findMany({
      where: { startedAt: { gte: sevenDaysAgo } },
      select: { startedAt: true, totalSeconds: true },
    });

    const trendByDay: { day: string; sessions: number; seconds: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStr = date.toLocaleDateString('fr-FR', { weekday: 'short' });
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const daySessions = sessions.filter(
        (s) => s.startedAt >= dayStart && s.startedAt < dayEnd
      );
      trendByDay.push({
        day: dayStr.charAt(0).toUpperCase() + dayStr.slice(1),
        sessions: daySessions.length,
        seconds: daySessions.reduce((sum, s) => sum + s.totalSeconds, 0),
      });
    }

    // 3. Reader Journey Funnel: distinct users who read volume 1, volume 3, volume 5, and purchased
    const [readersVol1, readersVol3, readersVol5, purchasers] = await Promise.all([
      prisma.volumeRead.findMany({
        where: { volumeNumber: 1 },
        select: { userId: true },
        distinct: ['userId'],
      }),
      prisma.volumeRead.findMany({
        where: { volumeNumber: 3 },
        select: { userId: true },
        distinct: ['userId'],
      }),
      prisma.volumeRead.findMany({
        where: { volumeNumber: 5 },
        select: { userId: true },
        distinct: ['userId'],
      }),
      prisma.order.findMany({
        where: { status: OrderStatus.PAID },
        select: { userId: true },
        distinct: ['userId'],
      }),
    ]);

    const readerFunnel = [
      { label: 'Volume 1', count: readersVol1.length },
      { label: 'Volume 3', count: readersVol3.length },
      { label: 'Volume 5', count: readersVol5.length },
      { label: 'Achat', count: purchasers.length },
    ];

    // 4. Peak Hours Heatmap: reading sessions grouped by day-of-week (0=Mon) and hour (0-23)
    const allSessions = await prisma.readingSession.findMany({
      select: { startedAt: true },
    });

    // 7 days x 24 hours grid
    const heatmap: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    for (const s of allSessions) {
      const d = new Date(s.startedAt);
      const dow = (d.getDay() + 6) % 7; // 0=Mon, 6=Sun
      const hour = d.getHours();
      heatmap[dow][hour]++;
    }

    // Normalize to 0-100
    const maxVal = Math.max(...heatmap.flat(), 1);
    const heatmapNormalized = heatmap.map((row) =>
      row.map((v) => Math.round((v / maxVal) * 100))
    );

    // Find peak hour
    let peakHour = 0, peakCount = 0;
    const hourTotals = Array(24).fill(0);
    for (const row of heatmap) {
      row.forEach((v, h) => { hourTotals[h] += v; });
    }
    hourTotals.forEach((v, h) => {
      if (v > peakCount) { peakCount = v; peakHour = h; }
    });

    return {
      narrativePerformance,
      trendProjection: trendByDay,
      readerFunnel,
      peakHours: {
        heatmap: heatmapNormalized,
        peakHour: `${peakHour.toString().padStart(2, '0')}:00`,
      },
    };
  }
}
