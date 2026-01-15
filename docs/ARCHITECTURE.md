# Architecture

## System Overview

Cher Journal is a monorepo-based platform for reading serialized stories with a unique monetization model: **wait-until-free**. Users can pay to unlock content immediately or wait for a timer to expire.

## Technology Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Fastify 4.x
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5.x
- **Language**: TypeScript 5.x
- **Security**: AES-256-GCM encryption, httpOnly cookies

### Frontend Admin
- **Framework**: React 18
- **Build Tool**: Vite 5.x
- **Styling**: TailwindCSS 3.x
- **State Management**: Zustand
- **Notifications**: react-hot-toast
- **Language**: TypeScript 5.x

### Frontend Web
- **Framework**: React 18
- **Build Tool**: Vite 5.x
- **Styling**: TailwindCSS 3.x
- **State Management**: Zustand
- **Language**: TypeScript 5.x

### Mobile
- **Framework**: React Native
- **Platform**: Expo
- **Language**: TypeScript 5.x

### Payments
- **Provider**: Stripe
- **Integration**: Checkout + Webhooks

## Monorepo Structure

```
cher-journal/
├── apps/
│   ├── backend/          # Fastify API
│   ├── admin/            # React admin dashboard
│   ├── web/              # React reader web app
│   ├── mobile/           # React Native mobile app
│   └── test/             # Integration tests
├── packages/
│   ├── types/            # Shared TypeScript types
│   ├── config/           # Shared configuration
│   └── utils/            # Shared utilities
├── docs/                 # Documentation
├── .claude/              # AI agent configurations
└── .github/              # GitHub workflows & copilot
```

## Data Flow

```
┌─────────────┐
│   Client    │
│ (Web/Mobile)│
└──────┬──────┘
       │ HTTPS
       │
┌──────▼──────┐      ┌──────────────┐
│   Fastify   │◄────►│  PostgreSQL  │
│   Backend   │      │   Database   │
└──────┬──────┘      └──────────────┘
       │
       │ Webhooks
       │
┌──────▼──────┐
│   Stripe    │
│   Payment   │
└─────────────┘
```

## Module Architecture

### Backend Modules

Each feature is organized as a module:

```
modules/
├── auth/
│   ├── auth.routes.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.schemas.ts
├── admin/
│   ├── chapters/
│   ├── volumes/
│   ├── users/
│   └── orders/
└── reader/
    ├── chapters/
    ├── volumes/
    └── wait/
```

#### Module Pattern

1. **Routes** (`*.routes.ts`): Register HTTP endpoints
2. **Controller** (`*.controller.ts`): Handle HTTP requests/responses
3. **Service** (`*.service.ts`): Business logic + database operations
4. **Schemas** (`*.schemas.ts`): Zod validation schemas

Example:
```typescript
// routes.ts
export function chapterRoutes(app: FastifyInstance) {
  app.get('/chapters', chapterController.list);
  app.post('/chapters', chapterController.create);
}

// controller.ts
export const chapterController = {
  async list(req, reply) {
    const chapters = await chapterService.list();
    return reply.send(chapters);
  },
  
  async create(req, reply) {
    const data = createChapterSchema.parse(req.body);
    const chapter = await chapterService.create(data);
    return reply.code(201).send(chapter);
  },
};

// service.ts
export const chapterService = {
  async list() {
    return prisma.chapter.findMany();
  },
  
  async create(data: CreateChapterInput) {
    return prisma.chapter.create({ data });
  },
};
```

## Security Architecture

### Authentication Flow

```
1. User logs in → POST /auth/login
2. Server validates credentials
3. Server creates session in DB
4. Server sets httpOnly cookie (sessionToken)
5. Client includes cookie in subsequent requests
6. Server validates session via middleware
```

### Middleware Chain

```typescript
app.register(async (instance) => {
  instance.addHook('preHandler', authenticate);
  instance.addHook('preHandler', requireAdmin);
  
  // Protected routes
  instance.get('/admin/chapters', chapterController.list);
});
```

### Text Encryption

All volume text is encrypted at rest using envelope encryption:

1. **KEK** (Key Encryption Key): Master key from `MASTER_ENCRYPTION_KEY` env var
2. **DEK** (Data Encryption Key): Unique per text blob, encrypted with KEK
3. **Algorithm**: AES-256-GCM with random IV and auth tag

```typescript
// Encryption flow
plainText 
  → AES-256-GCM(plainText, DEK, IV) 
  → cipherText + tag
  → Store: { cipherText, IV, tag, wrappedDEK }

// Decryption flow
{ cipherText, IV, tag, wrappedDEK }
  → unwrap(wrappedDEK, KEK) 
  → DEK
  → AES-256-GCM-decrypt(cipherText, DEK, IV, tag)
  → plainText
```

**Security Requirements**:
- Client NEVER receives plaintext
- Text rendered to image server-side
- Images sent to client (PNG/WEBP)

## Database Schema

### Core Models

```prisma
model User {
  id           String      @id @default(uuid())
  email        String      @unique
  passwordHash String
  status       UserStatus
  role         UserRole
  sessions     Session[]
  orders       Order[]
  entitlements Entitlement[]
  unlocks      Unlock[]
}

model Chapter {
  id              String        @id @default(uuid())
  title           String
  protagonistName String
  status          ChapterStatus
  publishedAt     DateTime?
  volumes         Volume[]
}

model Volume {
  id               String    @id @default(uuid())
  chapterId        String
  volumeNumber     Int
  title            String
  priceFreeToRead  Int       @default(0)
  pricePaywall     Int       @default(0)
  priceEpilogue    Int       @default(0)
  waitDuration     BigInt    @default(0)
  isFinalPaywall   Boolean   @default(false)
  publishedAt      DateTime?
  versions         VolumeVersion[]
}

model VolumeVersion {
  id          String      @id @default(uuid())
  volumeId    String
  perspective Perspective
  textBlobId  String?
  textBlob    EncryptedBlob?
}

model EncryptedBlob {
  id         String @id @default(uuid())
  ownerId    String
  purpose    String
  cipherText String
  iv         String
  tag        String
  wrappedDek String
  alg        String
  version    Int
}

model Unlock {
  userId       String
  chapterId    String
  volumeNumber Int
  unlocksAt    DateTime
  triggeredBy  UnlockTriggeredBy
}

model Entitlement {
  id         String              @id @default(uuid())
  userId     String
  chapterId  String
  volumeFrom Int
  volumeTo   Int
  scope      EntitlementVersionScope
  source     EntitlementSource
}
```

## Frontend Architecture

### Component Structure

```
src/
├── components/       # Reusable UI components
│   ├── Modal.tsx
│   ├── ConfirmDialog.tsx
│   └── ChapterForm.tsx
├── pages/            # Page components (routes)
│   ├── Dashboard.tsx
│   ├── Chapters.tsx
│   ├── ChapterDetail.tsx
│   └── VolumeForm.tsx
├── store/            # Zustand stores
│   └── auth.ts
├── lib/              # Utilities
│   └── api.ts
└── App.tsx           # Root component
```

### Routing

```typescript
// Admin
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/chapters" element={<Chapters />} />
  <Route path="/chapters/:id" element={<ChapterDetail />} />
  <Route path="/chapters/:chapterId/volumes/new" element={<VolumeForm />} />
  <Route path="/volumes/:volumeId" element={<VolumeForm />} />
  <Route path="/users" element={<Users />} />
  <Route path="/orders" element={<Orders />} />
</Routes>

// Web Reader
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/library" element={<Library />} />
  <Route path="/chapters/:chapterId" element={<ChapterReader />} />
  <Route path="/chapters/:chapterId/volumes/:volumeNumber" element={<VolumeReader />} />
  <Route path="/profile" element={<Profile />} />
</Routes>
```

## API Design

### RESTful Conventions

```
GET    /admin/chapters           # List chapters
POST   /admin/chapters           # Create chapter
GET    /admin/chapters/:id       # Get chapter by ID
PATCH  /admin/chapters/:id       # Update chapter
DELETE /admin/chapters/:id       # Delete chapter

GET    /admin/chapters/:id/volumes        # List volumes for chapter
POST   /admin/chapters/:id/volumes        # Create volume
GET    /admin/volumes/:id                 # Get volume by ID
PATCH  /admin/volumes/:id                 # Update volume
DELETE /admin/volumes/:id                 # Delete volume
```

### Response Format

```json
{
  "data": { /* response data */ },
  "error": null
}
```

### Error Handling

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "validation": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Deployment Architecture

```
┌──────────────┐
│   Vercel     │  ← Admin UI (apps/admin)
└──────────────┘

┌──────────────┐
│   Vercel     │  ← Web Reader (apps/web)
└──────────────┘

┌──────────────┐
│   Render     │  ← Backend API (apps/backend)
│   (Node.js)  │
└──────┬───────┘
       │
┌──────▼───────┐
│  PostgreSQL  │  ← Render Managed Database
└──────────────┘

┌──────────────┐
│  Expo/OTA    │  ← Mobile App (apps/mobile)
└──────────────┘
```

## Performance Considerations

### Caching Strategy
- PostgreSQL query result caching
- Static assets cached via CDN
- Session data cached in memory

### Database Optimization
- Indexes on foreign keys
- Composite indexes for common queries
- Connection pooling (Prisma)

### Asset Delivery
- Images optimized (WebP, responsive)
- Lazy loading for volumes
- Progressive image loading

## Monitoring & Logging

### Logging
- Structured JSON logs (Pino)
- Log levels: ERROR, WARN, INFO, DEBUG
- Request/response logging

### Metrics
- Response times
- Error rates
- Database query performance
- Active users

### Alerts
- High error rate
- Slow response times
- Database connection issues
- Payment failures

## Scalability

### Horizontal Scaling
- Stateless backend (sessions in DB)
- Load balancer distributes requests
- Multiple backend instances

### Database Scaling
- Read replicas for read-heavy operations
- Connection pooling
- Query optimization

### CDN
- Static assets served from CDN
- Reduced server load
- Faster global delivery
