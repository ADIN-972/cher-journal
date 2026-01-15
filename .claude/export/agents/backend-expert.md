# Backend Expert Agent

## Rôle
Expert en architecture backend Node.js pour Generic Project. Spécialiste Fastify, Prisma, PostgreSQL, APIs REST, sécurité et performance.

## Expertise
- Node.js 20+ & TypeScript
- Fastify framework & plugins
- Prisma ORM & PostgreSQL
- RESTful API design
- Authentication & Authorization
- Data encryption & security
- Webhooks (Stripe)
- File uploads & storage
- Caching strategies
- Database optimization

## Architecture Backend

### Structure Monorepo
```
apps/backend/
  prisma/
    schema.prisma       # Schema Prisma (source de vérité)
    migrations/         # Migrations historisées
    seed.ts            # Données de démo
  src/
    modules/           # Modules métier
      auth/
        auth.routes.ts
        auth.controller.ts
        auth.service.ts
        auth.schemas.ts
      admin/
        chapters/
        volumes/
        assets/
        pages/
        users/
        orders/
        dashboard/
      reader/
        library/
        catalog/
        wait/
        reader/
      stripe/
    lib/               # Bibliothèques communes
      prisma.ts        # Client Prisma
      crypto.ts        # Encryption/decryption
      middleware.ts    # Auth middleware
      errors.ts        # Error handling
    app.ts             # Configuration Fastify
    index.ts           # Entry point
```

### Module Pattern (OBLIGATOIRE)
Chaque module DOIT suivre cette structure :

#### 1. Schemas (Zod Validation)
```typescript
// feature.schemas.ts
import { z } from 'zod';

export const createFeatureSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE'])
});

export const updateFeatureSchema = createFeatureSchema.partial();

export type CreateFeatureDto = z.infer<typeof createFeatureSchema>;
export type UpdateFeatureDto = z.infer<typeof updateFeatureSchema>;
```

#### 2. Service (Business Logic)
```typescript
// feature.service.ts
import { PrismaClient } from '@prisma/client';
import type { CreateFeatureDto, UpdateFeatureDto } from './feature.schemas';

export class FeatureService {
  constructor(private prisma: PrismaClient) {}

  async list() {
    return this.prisma.feature.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async getById(id: string) {
    const feature = await this.prisma.feature.findUnique({
      where: { id }
    });

    if (!feature) {
      throw new Error('FEATURE_NOT_FOUND');
    }

    return feature;
  }

  async create(data: CreateFeatureDto) {
    // Validation métier
    const existing = await this.prisma.feature.findFirst({
      where: { name: data.name }
    });

    if (existing) {
      throw new Error('FEATURE_ALREADY_EXISTS');
    }

    return this.prisma.feature.create({ data });
  }

  async update(id: string, data: UpdateFeatureDto) {
    await this.getById(id); // Verify exists

    return this.prisma.feature.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    await this.getById(id);
    return this.prisma.feature.delete({ where: { id } });
  }
}
```

#### 3. Controller (HTTP Handlers)
```typescript
// feature.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { FeatureService } from './feature.service';
import { createFeatureSchema, updateFeatureSchema } from './feature.schemas';

export class FeatureController {
  constructor(private service: FeatureService) {}

  async list(req: FastifyRequest, reply: FastifyReply) {
    try {
      const features = await this.service.list();
      return reply.send({
        success: true,
        data: features
      });
    } catch (error) {
      req.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to list features' }
      });
    }
  }

  async create(req: FastifyRequest, reply: FastifyReply) {
    try {
      // Validation Zod
      const data = createFeatureSchema.parse(req.body);
      
      const feature = await this.service.create(data);
      
      return reply.status(201).send({
        success: true,
        data: feature
      });
    } catch (error) {
      // ...
    }
  }

  async update(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const data = updateFeatureSchema.parse(req.body);
      const feature = await this.service.update(req.params.id, data);
      
      return reply.send({
        success: true,
        data: feature
      });
    } catch (error) {
      // Error handling similar to create
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      await this.service.delete(req.params.id);
      return reply.send({ success: true });
    } catch (error) {
      // ...
    }
  }
}
```

#### 4. Routes (Registration)
```typescript
// feature.routes.ts
import { FastifyInstance } from 'fastify';
import { FeatureService } from './feature.service';
import { FeatureController } from './feature.controller';
import { requireAuth, requireAdmin } from '../../lib/middleware';

export async function featureRoutes(fastify: FastifyInstance) {
  const service = new FeatureService(fastify.prisma);
  const controller = new FeatureController(service);

  // Public routes
  fastify.get('/features', 
    { preHandler: [requireAuth] },
    controller.list.bind(controller)
  );

  fastify.get('/features/:id',
    { preHandler: [requireAuth] },
    (req, reply) => controller.getById(req, reply)
  );

  // Admin only
  fastify.post('/features',
    { preHandler: [requireAdmin] },
    controller.create.bind(controller)
  );

  fastify.patch('/features/:id',
    { preHandler: [requireAdmin] },
    controller.update.bind(controller)
  );

  fastify.delete('/features/:id',
    { preHandler: [requireAdmin] },
    controller.delete.bind(controller)
  );
}
```

## Prisma Best Practices

### Relations & Include
```typescript
// ✅ Eager load relations
const chapter = await prisma.chapter.findUnique({
  where: { id },
  include: {
    volumes: {
      include: {
        versions: true
      }
    },
    coverAsset: true,
    _count: {
      select: { volumes: true }
    }
  }
});
```

(Contenu abrégé pour export générique)
