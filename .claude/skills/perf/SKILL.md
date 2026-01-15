# Skill: Perf

## Description
Analyse et optimisation des performances pour Cher Journal (backend, frontend, database).

## Usage
```
@perf [target] [metric]
```

## Targets
- `backend` - Performance API Node.js
- `frontend` - Performance React
- `database` - Optimisation queries
- `network` - Optimisation réseau

## Backend Performance

### 1. Profiling Node.js
```bash
# With Node.js profiler
node --prof apps/backend/dist/index.js

# Analyze profile
node --prof-process isolate-*.log > processed.txt

# With clinic.js
npm install -g clinic
clinic doctor -- node apps/backend/dist/index.js
clinic flame -- node apps/backend/dist/index.js
```

### 2. Mesurer Temps de Réponse
```typescript
// Middleware timing
fastify.addHook('onRequest', async (request) => {
  request.startTime = Date.now();
});

fastify.addHook('onResponse', async (request, reply) => {
  const duration = Date.now() - request.startTime;
  request.log.info({ 
    url: request.url,
    method: request.method,
    statusCode: reply.statusCode,
    duration 
  }, 'Request completed');
});
```

### 3. Optimize Prisma Queries
```typescript
// ❌ N+1 Problem
const chapters = await prisma.chapter.findMany();
for (const chapter of chapters) {
  chapter.volumes = await prisma.volume.findMany({
    where: { chapterId: chapter.id }
  });
}

// ✅ Eager Loading
const chapters = await prisma.chapter.findMany({
  include: {
    volumes: true,
    coverAsset: true,
    _count: { select: { volumes: true } }
  }
});
```

### 4. Caching
```typescript
// In-memory cache simple
const cache = new Map<string, { data: any; expires: number }>();

async function getCachedData(key: string, ttl: number, fetchFn: () => Promise<any>) {
  const cached = cache.get(key);
  
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const data = await fetchFn();
  cache.set(key, { data, expires: Date.now() + ttl });
  
  return data;
}

// Usage
const chapters = await getCachedData(
  'published-chapters',
  5 * 60 * 1000, // 5 minutes
  () => prisma.chapter.findMany({ where: { status: 'PUBLISHED' } })
);
```

### 5. Connection Pooling
```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// DATABASE_URL with pool settings
// postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20
```

### 6. Compression
```typescript
// Gzip compression
import compress from '@fastify/compress';

await fastify.register(compress, {
  threshold: 1024, // Only compress responses > 1KB
  encodings: ['gzip', 'deflate']
});
```

## Frontend Performance

### 1. React Profiler
```typescript
import { Profiler } from 'react';

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number
) {
  console.log(`${id} (${phase}): ${actualDuration}ms`);
}

<Profiler id="ChapterList" onRender={onRenderCallback}>
  <ChapterList />
</Profiler>
```

### 2. Memoization
```typescript
import { memo, useMemo, useCallback } from 'react';

// Memo component
export const ChapterCard = memo<ChapterCardProps>(({ chapter, onSelect }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.chapter.id === nextProps.chapter.id;
});

// useMemo for expensive calculations
const sortedChapters = useMemo(() => {
  return chapters
    .sort((a, b) => a.title.localeCompare(b.title))
    .filter(c => c.status === 'PUBLISHED');
}, [chapters]);

// useCallback for stable function refs
const handleSelect = useCallback((id: string) => {
  navigate(`/chapters/${id}`);
}, [navigate]);
```

### 3. Lazy Loading
```typescript
import { lazy, Suspense } from 'react';

// Code splitting
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ChapterEditor = lazy(() => import('./pages/ChapterEditor'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/chapters/:id/edit" element={<ChapterEditor />} />
      </Routes>
    </Suspense>
  );
}
```

### 4. Virtual Lists
```typescript
import { FixedSizeList } from 'react-window';

const VolumeList: FC<{ volumes: Volume[] }> = ({ volumes }) => {
  const Row = ({ index, style }: any) => (
    <div style={style}>
      <VolumeCard volume={volumes[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={volumes.length}
      itemSize={100}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

### 5. Image Optimization
```typescript
// Lazy load images
<img 
  src={imageUrl} 
  loading="lazy"
  decoding="async"
/>

// Responsive images
<img
  srcSet={`
    ${imageUrl}_400w.jpg 400w,
    ${imageUrl}_800w.jpg 800w,
    ${imageUrl}_1200w.jpg 1200w
  `}
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  src={imageUrl}
  alt={title}
/>

// WebP with fallback
<picture>
  <source srcSet={`${imageUrl}.webp`} type="image/webp" />
  <img src={`${imageUrl}.jpg`} alt={title} />
</picture>
```

### 6. Vite Build Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['zustand']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    }
  }
});
```

## Database Performance

### 1. Enable Query Logging
```bash
DEBUG=prisma:query npm run dev:backend
```

### 2. Analyze Slow Queries
```sql
-- Enable slow query log
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1s
SELECT pg_reload_conf();

-- Check slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### 3. Add Indexes
```prisma
model Chapter {
  id     String @id
  status String
  title  String

  @@index([status])           // Single column
  @@index([status, title])    // Composite
  @@index([title(ops: TextSearchOps)]) // Full-text search
}
```

### 4. EXPLAIN ANALYZE
```sql
-- Analyze query performance
EXPLAIN ANALYZE
SELECT * FROM "Chapter" 
WHERE status = 'PUBLISHED' 
ORDER BY "createdAt" DESC
LIMIT 10;

-- Check if indexes are used
-- Look for "Index Scan" vs "Seq Scan"
```

### 5. Pagination
```typescript
// ✅ Cursor-based pagination (efficient)
const chapters = await prisma.chapter.findMany({
  take: 20,
  skip: 1,
  cursor: { id: lastChapterId },
  orderBy: { createdAt: 'desc' }
});

// ❌ Offset pagination (slow for large offsets)
const chapters = await prisma.chapter.findMany({
  skip: page * 20,
  take: 20
});
```

### 6. Select Specific Fields
```typescript
// ❌ Fetch all fields
const users = await prisma.user.findMany();

// ✅ Select only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    role: true
  }
});
```

## Network Optimization

### 1. HTTP/2
```typescript
// Enable HTTP/2 in Fastify
import { fastify } from 'fastify';
import { readFileSync } from 'fs';

const app = fastify({
  http2: true,
  https: {
    key: readFileSync('./key.pem'),
    cert: readFileSync('./cert.pem')
  }
});
```

### 2. CDN for Static Assets
```typescript
// Serve static files
import fastifyStatic from '@fastify/static';

await fastify.register(fastifyStatic, {
  root: path.join(__dirname, '../uploads'),
  prefix: '/uploads/',
  maxAge: 86400000, // 1 day cache
  immutable: true
});
```

### 3. API Response Compression
```typescript
// Already covered in backend section
import compress from '@fastify/compress';

await fastify.register(compress);
```

### 4. Optimize Payload Size
```typescript
// ❌ Send entire object
return reply.send({
  success: true,
  data: {
    ...chapter,
    volumes: chapter.volumes.map(v => ({
      ...v,
      versions: v.versions // Too much data
    }))
  }
});

// ✅ Send only necessary data
return reply.send({
  success: true,
  data: {
    id: chapter.id,
    title: chapter.title,
    volumeCount: chapter._count.volumes,
    coverUrl: chapter.coverAsset?.objectKey
  }
});
```

## Monitoring

### 1. Application Monitoring
```typescript
// Simple metrics
const metrics = {
  requests: 0,
  errors: 0,
  avgResponseTime: 0
};

fastify.addHook('onResponse', async (request, reply) => {
  metrics.requests++;
  
  if (reply.statusCode >= 400) {
    metrics.errors++;
  }
  
  const duration = Date.now() - request.startTime;
  metrics.avgResponseTime = 
    (metrics.avgResponseTime * (metrics.requests - 1) + duration) / metrics.requests;
});

// Metrics endpoint
fastify.get('/metrics', async () => {
  return metrics;
});
```

### 2. Database Monitoring
```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Long running queries
SELECT 
  pid,
  now() - query_start as duration,
  query
FROM pg_stat_activity
WHERE state = 'active' 
  AND now() - query_start > interval '5 seconds';

-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Performance Testing

### 1. Load Testing (k6)
```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10, // Virtual users
  duration: '30s'
};

export default function () {
  const res = http.get('http://localhost:3000/api/chapters');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200
  });
  
  sleep(1);
}
```

```bash
k6 run load-test.js
```

### 2. Benchmark Endpoints
```typescript
// benchmark.ts
import autocannon from 'autocannon';

async function benchmark() {
  const result = await autocannon({
    url: 'http://localhost:3000/api/chapters',
    connections: 10,
    duration: 10
  });

  console.log(`Requests/sec: ${result.requests.mean}`);
  console.log(`Latency: ${result.latency.mean}ms`);
}

benchmark();
```

## Optimization Checklist

### Backend
- [ ] Enable compression
- [ ] Optimize Prisma queries (eager loading)
- [ ] Add database indexes
- [ ] Implement caching
- [ ] Connection pooling configured
- [ ] Monitor slow queries
- [ ] Profile hot paths

### Frontend
- [ ] Code splitting (lazy loading)
- [ ] Memoize expensive calculations
- [ ] Virtual lists for long lists
- [ ] Image optimization (lazy, WebP)
- [ ] Bundle size optimized
- [ ] Remove unused code
- [ ] Minimize re-renders

### Database
- [ ] Indexes on foreign keys
- [ ] Indexes on frequently queried columns
- [ ] Pagination implemented
- [ ] Select only needed fields
- [ ] No N+1 queries
- [ ] VACUUM regularly

### Network
- [ ] HTTP/2 enabled
- [ ] Static assets cached
- [ ] CDN for uploads
- [ ] Payload size minimized
- [ ] Compression enabled

## Performance Goals

- API response time: < 200ms (p95)
- Database queries: < 100ms (p95)
- Page load time: < 2s (FCP)
- Time to interactive: < 3.5s
- Bundle size: < 500KB (gzipped)
