import prisma from '../../../lib/prisma';
import { Prisma, OrderStatus, OrderType } from '@prisma/client';

interface ExportFilters {
  status?: OrderStatus;
  type?: OrderType;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

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

  async exportToCSV(filters: ExportFilters = {}) {
    // Build where clause based on filters
    const where: Prisma.OrderWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    // Fetch orders with filters
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            publicId: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate CSV
    const headers = [
      'ID Commande',
      'ID Utilisateur',
      'Email',
      'Prénom',
      'Nom',
      'Type',
      'Statut',
      'Montant Total (centimes)',
      'Montant Total (euros)',
      'Devise',
      'Fournisseur',
      'ID Session Fournisseur',
      'ID Paiement Fournisseur',
      'Prix Free-to-Read Appliqué',
      'Prix Paywall Appliqué',
      'Prix Épilogue Appliqué',
      'ID Schéma Prix',
      'ID Promotion',
      'Date Création',
    ];

    const rows = orders.map((order) => [
      order.id,
      order.user.publicId,
      order.user.email,
      order.user.firstName || '',
      order.user.lastName || '',
      order.type,
      order.status,
      order.amountTotal || '',
      order.amountTotal ? (order.amountTotal / 100).toFixed(2) : '',
      order.currency || '',
      order.provider || '',
      order.providerSessionId || '',
      order.providerPaymentIntentId || '',
      order.appliedPriceFreeToRead || '',
      order.appliedPricePaywall || '',
      order.appliedPriceEpilogue || '',
      order.appliedPriceSchemaId || '',
      order.appliedPromotionId || '',
      order.createdAt.toISOString(),
    ]);

    // Convert to CSV format (using semicolon for French Excel compatibility)
    const separator = ';';
    const csvContent = [
      headers.map((h) => this.escapeCSVField(h, separator)).join(separator),
      ...rows.map((row) => row.map((field) => this.escapeCSVField(String(field), separator)).join(separator)),
    ].join('\n');

    return csvContent;
  }

  private escapeCSVField(field: string, separator: string = ';'): string {
    // Escape double quotes and wrap in quotes if contains separator, quote, or newline
    if (field.includes(separator) || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }
}
