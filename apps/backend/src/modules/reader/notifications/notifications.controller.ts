import { FastifyRequest, FastifyReply } from 'fastify';
import { NotificationPreferencesService } from './notifications.service';

const service = new NotificationPreferencesService();

export class NotificationPreferencesController {
  async getPreferences(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const prefs = await service.getPreferences(userId);
    return reply.send({ success: true, data: prefs });
  }

  async updatePreferences(
    request: FastifyRequest<{
      Body: { preferences: { category: string; email: boolean; push: boolean }[] };
    }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.id;
    const { preferences } = request.body;

    if (!Array.isArray(preferences)) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'preferences must be an array' },
      });
    }

    const updated = await service.updatePreferences(userId, preferences);
    return reply.send({ success: true, data: updated });
  }

  async savePushToken(
    request: FastifyRequest<{ Body: { token: string; platform?: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.id;
    const { token, platform } = request.body;
    if (!token) {
      return reply.status(400).send({ success: false, error: { code: 'MISSING_TOKEN', message: 'token is required' } });
    }
    await service.savePushToken(userId, token, platform);
    return reply.send({ success: true });
  }

  async removePushToken(
    request: FastifyRequest<{ Body: { token: string } }>,
    reply: FastifyReply
  ) {
    const userId = request.user!.id;
    const { token } = request.body;
    if (!token) {
      return reply.status(400).send({ success: false, error: { code: 'MISSING_TOKEN', message: 'token is required' } });
    }
    await service.removePushToken(userId, token);
    return reply.send({ success: true });
  }

  async sendTestNotification(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.id;
    const result = await service.sendTestNotification(userId);
    return reply.send({ success: true, data: result });
  }
}
