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
}
