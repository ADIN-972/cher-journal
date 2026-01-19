import prisma from '../../../lib/prisma';
import { OrderStatus } from '@prisma/client';

export class DashboardService {
  async getStats() {
    const [
      totalUsers,
      totalChapters,
      totalOrders,
      totalRevenue,
      recentOrders,
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
    ]);

    return {
      totalUsers,
      totalChapters,
      totalOrders,
      totalRevenue: totalRevenue._sum.amountTotal || 0,
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

    // Top content
    // TODO: Implement top chapters/volumes analytics
    // The Order model needs a refId field to track which chapter/volume was purchased
    // For now, return empty arrays to prevent errors
    const topChaptersWithDetails: any[] = [];
    const topVolumesWithDetails: any[] = [];

    // TODO: Add refId field to Order model:
    // refId String? // Chapter ID or Volume ID depending on type
    // Then implement queries like:
    // const [topChapters, topVolumes] = await Promise.all([
    //   prisma.order.groupBy({
    //     by: ['refId'],
    //     where: { status: OrderStatus.PAID, type: 'CHAPTER', refId: { not: null } },
    //     _count: true,
    //     _sum: { amountTotal: true },
    //     orderBy: { _count: { refId: 'desc' } },
    //     take: 5,
    //   }),
    //   prisma.order.groupBy({
    //     by: ['refId'],
    //     where: { status: OrderStatus.PAID, type: { in: ['VOLUME', 'PREORDER'] }, refId: { not: null } },
    //     _count: true,
    //     _sum: { amountTotal: true },
    //     orderBy: { _count: { refId: 'desc' } },
    //     take: 5,
    //   }),
    // ]);

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
}
