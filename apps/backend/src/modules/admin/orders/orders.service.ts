import prisma from '../../../lib/prisma';

export class OrdersService {
  async list() {
    return prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            publicId: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }

    return order;
  }
}
