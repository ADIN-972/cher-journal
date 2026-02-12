import prisma from '../../../lib/prisma';
import { Prisma } from '@prisma/client';

export interface LogAuditParams {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

export interface AuditFilters {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export class AuditService {
  /**
   * Log an audit entry
   */
  async log(params: LogAuditParams) {
    try {
      return await prisma.auditLog.create({
        data: {
          userId: params.userId,
          action: params.action,
          resource: params.resource,
          resourceId: params.resourceId,
          metadata: params.metadata || {},
          ip: params.ip,
          userAgent: params.userAgent,
        },
      });
    } catch (error) {
      // Don't throw errors for audit logging - just log to console
      console.error('Failed to create audit log:', error);
      return null;
    }
  }

  /**
   * Get audit logs with filters and pagination
   */
  async list(filters: AuditFilters = {}) {
    const where: Prisma.AuditLogWhereInput = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.action) {
      where.action = { contains: filters.action, mode: 'insensitive' };
    }

    if (filters.resource) {
      where.resource = { contains: filters.resource, mode: 'insensitive' };
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

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              publicId: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }

  /**
   * Export audit logs to CSV
   */
  async exportToCSV(filters: AuditFilters = {}) {
    const { logs } = await this.list({ ...filters, limit: 10000 });

    const headers = [
      'Date',
      'Utilisateur',
      'Email',
      'Rôle',
      'Action',
      'Ressource',
      'ID Ressource',
      'Adresse IP',
      'User Agent',
      'Métadonnées',
    ];

    const rows = logs.map((log) => [
      log.createdAt.toISOString(),
      `${log.user.firstName} ${log.user.lastName}`,
      log.user.email,
      log.user.role,
      log.action,
      log.resource,
      log.resourceId || '',
      log.ip || '',
      log.userAgent || '',
      log.metadata ? JSON.stringify(log.metadata) : '',
    ]);

    const separator = ';';
    const csvContent = [
      headers.map((h) => this.escapeCSVField(h, separator)).join(separator),
      ...rows.map((row) => row.map((field) => this.escapeCSVField(String(field), separator)).join(separator)),
    ].join('\n');

    return csvContent;
  }

  private escapeCSVField(field: string, separator: string = ';'): string {
    if (field.includes(separator) || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  /**
   * Delete old audit logs (retention policy)
   */
  async deleteOlderThan(days: number) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}
