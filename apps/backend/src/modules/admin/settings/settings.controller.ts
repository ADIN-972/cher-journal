import { FastifyRequest, FastifyReply } from "fastify";
import { settingsService } from "./settings.service";
import { UpsertSettingInput, upsertSettingSchema } from "./settings.schemas";

export class SettingsController {
  /**
   * GET /admin/settings
   */
  async getAll(_request: FastifyRequest, reply: FastifyReply) {
    const settings = await settingsService.getAll();
    return reply.send(settings);
  }

  /**
   * GET /admin/settings/defaults/prices
   */
  async getDefaultPrices(_request: FastifyRequest, reply: FastifyReply) {
    const defaults = await settingsService.getDefaultPrices();
    return reply.send(defaults);
  }

  /**
   * GET /admin/settings/:key
   */
  async getByKey(
    request: FastifyRequest<{ Params: { key: string } }>,
    reply: FastifyReply
  ) {
    const { key } = request.params;
    const setting = await settingsService.getByKey(key);

    if (!setting) {
      // Return null value instead of 404 for non-existent settings
      // This allows frontend to handle missing settings gracefully
      return reply.send({ key, value: null });
    }

    return reply.send(setting);
  }

  /**
   * PATCH /admin/settings/:key
   */
  async upsert(
    request: FastifyRequest<{
      Params: { key: string };
      Body: UpsertSettingInput;
    }>,
    reply: FastifyReply
  ) {
    const { key } = request.params;
    const validated = upsertSettingSchema.parse(request.body);

    const setting = await settingsService.upsert(key, validated.value);

    return reply.send(setting);
  }
}

export const settingsController = new SettingsController();
