import { FastifyRequest, FastifyReply } from 'fastify';
import { PromotionsService } from './promotions.service';

const promotionsService = new PromotionsService();

export class PromotionsController {
  async getApplicablePromotions(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user?.id;

      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
      }

      const promotions = await promotionsService.getUserApplicablePromotions(userId);

      return reply.send({
        success: true,
        data: {
          promotions,
        },
      });
    } catch (error) {
      console.error('Error fetching applicable promotions:', error);
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch promotions',
        },
      });
    }
  }
}
