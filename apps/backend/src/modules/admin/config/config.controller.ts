import { FastifyRequest, FastifyReply } from 'fastify';
import { ConfigService } from './config.service';

const service = new ConfigService();

interface ConfigQueryParams {
  category?: string;
  key?: string;
}

interface UpdateConfigBody {
  key: string;
  value: string;
}

export class ConfigController {
  /**
   * List all configurations, optionally filtered
   */
  async list(
    request: FastifyRequest<{ Querystring: ConfigQueryParams }>,
    reply: FastifyReply
  ) {
    try {
      const filters = request.query;
      const configs = await service.list(filters);

      // Hide SECRET values in list view (show only masked)
      const masked = configs.map((c) => ({
        ...c,
        value: c.type === 'SECRET' && c.value
          ? '••••••••'
          : c.value,
      }));

      return reply.send({ success: true, data: masked });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'LIST_FAILED', message: error.message },
      });
    }
  }

  /**
   * Get a single configuration by key (admin only, shows real value)
   */
  async getByKey(
    request: FastifyRequest<{ Params: { key: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { key } = request.params;
      const config = await service.getByKey(key);

      if (!config) {
        return reply.status(404).send({
          success: false,
          error: { code: 'CONFIG_NOT_FOUND', message: 'Configuration not found' },
        });
      }

      return reply.send({ success: true, data: config });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'GET_FAILED', message: error.message },
      });
    }
  }

  /**
   * Update a configuration value
   */
  async update(
    request: FastifyRequest<{ Body: UpdateConfigBody }>,
    reply: FastifyReply
  ) {
    try {
      const { key, value } = request.body;
      const userId = (request.user as any)?.id;

      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'User not authenticated' },
        });
      }

      const updated = await service.upsert({
        key,
        value,
        updatedBy: userId,
      });

      return reply.send({ success: true, data: updated });
    } catch (error: any) {
      if (error.message === 'CONFIG_NOT_FOUND') {
        return reply.status(404).send({
          success: false,
          error: { code: 'CONFIG_NOT_FOUND', message: 'Configuration not found' },
        });
      }

      return reply.status(500).send({
        success: false,
        error: { code: 'UPDATE_FAILED', message: error.message },
      });
    }
  }

  /**
   * Initialize default configurations (run once)
   */
  async initialize(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await service.initializeDefaults();
      return reply.send({ success: true, data: result });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'INIT_FAILED', message: error.message },
      });
    }
  }

  /**
   * Get payment configuration (public for frontend)
   */
  async getPaymentConfig(request: FastifyRequest, reply: FastifyReply) {
    try {
      const paymentConfig = await service.getPaymentConfig();
      return reply.send({ success: true, data: paymentConfig });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'GET_PAYMENT_CONFIG_FAILED', message: error.message },
      });
    }
  }

  /**
   * Get wait-to-read configuration (public for frontend)
   */
  async getWaitConfig(request: FastifyRequest, reply: FastifyReply) {
    try {
      const waitConfig = await service.getWaitConfig();
      return reply.send({ success: true, data: waitConfig });
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'GET_WAIT_CONFIG_FAILED', message: error.message },
      });
    }
  }
}
