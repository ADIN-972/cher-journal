# Validation Zod dans Cher Journal

## Approche de Validation

Le projet utilise **validation Zod manuelle dans les controllers** plutôt que validation automatique via Fastify schemas.

### Pourquoi cette approche ?

1. **Simplicité** - Pas besoin de convertir Zod → JSON Schema
2. **Flexibilité** - Messages d'erreur personnalisés
3. **Type-safety** - TypeScript inférence complète
4. **Compatibilité** - Évite les conflits de types avec Fastify plugins

## Pattern Standard

### 1. Définir les Schemas (*.schemas.ts)

```typescript
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
```

### 2. Valider dans le Controller (*.controller.ts)

```typescript
import { registerSchema, RegisterInput } from './auth.schemas';

async register(
  request: FastifyRequest<{ Body: RegisterInput }>,
  reply: FastifyReply
) {
  // Validation
  const validationResult = registerSchema.safeParse(request.body);
  if (!validationResult.success) {
    return reply.status(400).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: validationResult.error.errors,
      },
    });
  }
  
  // Utiliser les données validées
  const user = await service.create(validationResult.data);
  return reply.send({ success: true, data: user });
}
```

### 3. Routes Sans Schema (*.routes.ts)

```typescript
export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/register', {
    // PAS de schema ici - validation dans controller
    handler: controller.register.bind(controller),
  });
}
```

## Erreurs de Validation

Format de réponse standardisé :

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "path": ["email"],
        "message": "Email invalide"
      },
      {
        "path": ["password"],
        "message": "Mot de passe trop court"
      }
    ]
  }
}
```

## Schemas Zod Courants

### Email + Password

```typescript
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
```

### Création avec Enums

```typescript
export const createChapterSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'PUBLISHED']),
  coverImageId: z.string().uuid().optional(),
});
```

### Update Partiel

```typescript
export const updateChapterSchema = createChapterSchema.partial();
// Tous les champs deviennent optionnels
```

### Validation de Params

```typescript
export const chapterParamsSchema = z.object({
  id: z.string().uuid('ID invalide'),
});

// Dans controller
const params = chapterParamsSchema.safeParse(request.params);
```

### Arrays et Relations

```typescript
export const bulkUpdateSchema = z.object({
  ids: z.array(z.string().uuid()),
  updates: z.object({
    status: z.enum(['PUBLISHED', 'DRAFT']).optional(),
    isArchived: z.boolean().optional(),
  }),
});
```

## Avantages

### ✅ Type Safety

```typescript
const result = registerSchema.safeParse(data);
if (result.success) {
  // result.data est typé comme RegisterInput
  const email = result.data.email; // ✅ Type-safe
}
```

### ✅ Messages Personnalisés

```typescript
z.string().email('Format email invalide')
z.string().min(6, 'Minimum 6 caractères')
z.number().positive('Doit être positif')
```

### ✅ Transformations

```typescript
export const userSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  age: z.string().transform(val => parseInt(val, 10)),
  tags: z.string().transform(val => val.split(',')),
});
```

### ✅ Validation Conditionnelle

```typescript
export const volumeSchema = z.object({
  isFree: z.boolean(),
  price: z.number().optional(),
}).refine(
  data => data.isFree || data.price !== undefined,
  { message: 'Prix requis si non gratuit', path: ['price'] }
);
```

## Audit de Sécurité

Le scanner `api:security` détecte si :
- ❌ Une mutation POST/PATCH/PUT sans validation
- ❌ Un endpoint accepte n'importe quel body
- ✅ La validation Zod est présente dans le controller

**Note :** Le scanner regarde les routes, pas les controllers. Il marquera "MISSING_VALIDATION" même si la validation existe dans le controller. C'est un faux positif acceptable.

## Migration des Routes Existantes

Pour migrer une route existante :

1. **Créer le schema** dans `*.schemas.ts`
2. **Ajouter validation** dans le controller
3. **Supprimer le `schema`** de la route si présent
4. **Tester** avec données invalides

### Exemple : Users Update

**Avant :**
```typescript
// users.controller.ts
async update(request, reply) {
  const user = await service.update(request.params.id, request.body);
  return reply.send({ success: true, data: user });
}
```

**Après :**
```typescript
// users.schemas.ts
export const updateUserSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
});

// users.controller.ts
async update(request, reply) {
  const validation = updateUserSchema.safeParse(request.body);
  if (!validation.success) {
    return reply.status(400).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: validation.error.errors,
      },
    });
  }
  
  const user = await service.update(request.params.id, validation.data);
  return reply.send({ success: true, data: user });
}
```

## Testing

### Test Unitaire de Schema

```typescript
import { registerSchema } from './auth.schemas';

describe('registerSchema', () => {
  it('valide email et password corrects', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: '123456',
    });
    expect(result.success).toBe(true);
  });
  
  it('rejette email invalide', () => {
    const result = registerSchema.safeParse({
      email: 'invalid',
      password: '123456',
    });
    expect(result.success).toBe(false);
  });
});
```

### Test d'Intégration

```typescript
const response = await app.inject({
  method: 'POST',
  url: '/auth/register',
  payload: { email: 'invalid', password: '123' },
});

expect(response.statusCode).toBe(400);
expect(response.json()).toMatchObject({
  success: false,
  error: { code: 'VALIDATION_ERROR' },
});
```

## Ressources

- **Zod Documentation** : https://zod.dev
- **Fastify Type Provider** : (non utilisé, complexité inutile)
- **Schemas existants** : `apps/backend/src/modules/*/`

## Conventions

1. ✅ Toujours utiliser `.safeParse()` pour éviter les exceptions
2. ✅ Retourner 400 avec structure d'erreur standardisée
3. ✅ Utiliser `z.infer` pour types TypeScript
4. ✅ Grouper schemas related dans même fichier
5. ✅ Exporter types avec suffix `Input` ou `Output`
6. ❌ Ne pas utiliser `.parse()` directement (throw exceptions)
7. ❌ Ne pas valider dans les services (faire dans controllers)

## Modules avec Validation

### ✅ Implémentés
- auth (register, login)

### ⏳ À Implémenter
- chapters (create, update, bulk operations)
- volumes (create, update, bulk operations)
- users (update)
- settings (update)
- pages (create, reorder)
- stripe (checkout session)

Utiliser `npm run api:security` pour identifier les endpoints sans validation.
