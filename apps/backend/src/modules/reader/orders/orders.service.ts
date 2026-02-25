import prisma from '../../../lib/prisma';

export class OrdersService {
  async getUserOrders(userId: string) {
    // Get all completed orders for the user
    const orders = await prisma.order.findMany({
      where: {
        userId,
        status: 'PAID',
      },
      include: {
        appliedPromotion: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            value: true,
            scope: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Fetch chapter info for each order using refId
    const ordersWithChapters = await Promise.all(
      orders.map(async (order) => {
        let chapterTitle = 'Achat';

        if (order.refId) {
          const chapter = await prisma.chapter.findUnique({
            where: { id: order.refId },
            select: { title: true },
          });
          if (chapter) {
            chapterTitle = chapter.title;
          }
        }

        return {
          ...order,
          chapterTitle,
        };
      })
    );

    // Transform orders to match the frontend Purchase interface
    return ordersWithChapters.map((order) => ({
      id: order.id,
      date: order.createdAt.toISOString().split('T')[0], // Format as YYYY-MM-DD
      itemTitle: this.formatOrderDescription(order),
      amount: order.amountTotal || 0,
      status: 'completed' as const,
    }));
  }

  private formatOrderDescription(order: any): string {
    const chapter = order.chapterTitle || 'Achat';

    switch (order.type) {
      case 'CHAPTER':
        return `Chapitre - ${chapter}`;
      case 'VOLUME':
        return `Volume ${order.volumeNumber} - ${chapter}`;
      case 'BUNDLE':
        return `Bundle - ${chapter}`;
      case 'VERSION_PACK':
        return `Pack Perspectives - ${chapter}`;
      case 'COLORING':
        return `Cahier de Coloriage - ${chapter}`;
      case 'PREORDER':
        return `Précommande - ${chapter}`;
      default:
        return `Achat - ${chapter}`;
    }
  }
}
