# Skill: Test

## Description
Création et exécution de tests pour Cher Journal (unitaires, intégration, e2e).

## Usage
```
@test [type] [target]
```

## Types de Tests

### 1. Unit Tests (Jest)
```
@test unit auth.service
```

Génère:
```typescript
// apps/backend/src/modules/auth/__tests__/auth.service.test.ts
import { AuthService } from '../auth.service';
import { prismaMock } from '../../../test/prisma-mock';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(prismaMock);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create user with hashed password', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'user-id',
        publicId: 'public-id',
        email,
        passwordHash: await bcrypt.hash(password, 10),
        status: 'ACTIVE',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await service.register({ email, password });

      expect(result.email).toBe(email);
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email,
          passwordHash: expect.any(String),
          status: 'ACTIVE',
          role: 'USER'
        })
      });
    });

    it('should throw error if email already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'existing-id',
        email: 'existing@example.com'
      } as any);

      await expect(
        service.register({ 
          email: 'existing@example.com', 
          password: 'pass' 
        })
      ).rejects.toThrow('EMAIL_ALREADY_EXISTS');
    });

    it('should hash password with bcrypt', async () => {
      const password = 'testpass123';
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockImplementation(async (args) => {
        const isHashed = await bcrypt.compare(password, args.data.passwordHash);
        expect(isHashed).toBe(true);
        return { id: 'user-id' } as any;
      });

      await service.register({ email: 'test@example.com', password });
    });
  });

  describe('login', () => {
    it('should return user and token with valid credentials', async () => {
      const user = {
        id: 'user-id',
        email: 'user@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        status: 'ACTIVE',
        role: 'USER'
      };

      prismaMock.user.findUnique.mockResolvedValue(user as any);
      prismaMock.session.create.mockResolvedValue({
        id: 'session-id',
        token: 'token123',
        userId: user.id,
        expiresAt: new Date(),
        createdAt: new Date()
      });

      const result = await service.login({
        email: 'user@example.com',
        password: 'password123'
      });

      expect(result.user).toEqual(user);
      expect(result.token).toBeDefined();
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('should throw error with invalid credentials', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'wrong@example.com',
          password: 'wrongpass'
        })
      ).rejects.toThrow('INVALID_CREDENTIALS');
    });

    it('should throw error if account is suspended', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'user@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        status: 'SUSPENDED'
      } as any);

      await expect(
        service.login({
          email: 'user@example.com',
          password: 'password123'
        })
      ).rejects.toThrow('ACCOUNT_SUSPENDED');
    });
  });
});
```

### 2. Integration Tests (API)
```
@test integration auth.routes
```

Génère:
```typescript
// apps/backend/src/modules/auth/__tests__/auth.integration.test.ts
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../../app';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcrypt';

describe('POST /api/auth/login', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should login with valid credentials', async () => {
    // Setup: Create user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        status: 'ACTIVE',
        role: 'USER'
      }
    });

    // Execute: Login request
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'test@example.com',
        password: 'password123'
      }
    });

    // Assert: Response
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      success: true,
      data: {
        user: {
          email: 'test@example.com'
        }
      }
    });

    // Assert: Session cookie set
    const cookies = response.cookies;
    expect(cookies).toHaveLength(1);
    expect(cookies[0].name).toBe('sessionToken');
    expect(cookies[0].httpOnly).toBe(true);

    // Assert: Session created in DB
    const session = await prisma.session.findFirst({
      where: { userId: user.id }
    });
    expect(session).toBeTruthy();
    expect(session!.token).toBe(cookies[0].value);
  });

  it('should reject invalid credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'wrong@example.com',
        password: 'wrongpass'
      }
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS'
      }
    });
  });

  it('should reject suspended accounts', async () => {
    await prisma.user.create({
      data: {
        email: 'suspended@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        status: 'SUSPENDED',
        role: 'USER'
      }
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'suspended@example.com',
        password: 'password123'
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe('ACCOUNT_SUSPENDED');
  });

  it('should validate request body', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'invalid-email',
        password: ''
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('VALIDATION_ERROR');
  });
});
```

### 3. E2E Tests (Playwright)
```
@test e2e wait-until-free
```

Génère:
```typescript
// apps/test/e2e/wait-until-free.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Wait-Until-Free Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:5174/login');
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'user123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:5174/library');
  });

  test('should display locked volumes', async ({ page }) => {
    // Navigate to chapter
    await page.click('text=Le Commencement');
    
    // Check for locked volume
    const lockedVolume = page.locator('[data-testid="volume-6"]');
    await expect(lockedVolume.locator('.lock-icon')).toBeVisible();
  });

  test('should start wait timer', async ({ page }) => {
    // Navigate to chapter
    await page.click('text=Le Commencement');
    
    // Click locked volume
    const volumeCard = page.locator('[data-testid="volume-6"]');
    await volumeCard.click();

    // Start wait
    await page.click('button:has-text("Attendre 24h")');
    
    // Verify timer displayed
    await expect(page.locator('.timer')).toBeVisible();
    await expect(page.locator('.timer')).toContainText('23:59');
  });

  test('should show active wait in library', async ({ page }) => {
    // Start wait (assuming already done)
    await page.click('text=Le Commencement');
    await page.locator('[data-testid="volume-6"]').click();
    await page.click('button:has-text("Attendre 24h")');

    // Return to library
    await page.click('a[href="/library"]');
    
    // Check active wait display
    const activeWait = page.locator('[data-testid="active-wait"]');
    await expect(activeWait).toBeVisible();
    await expect(activeWait).toContainText('Le Commencement');
    await expect(activeWait).toContainText('Volume 6');
  });

  test('should prevent multiple waits on same chapter', async ({ page }) => {
    // Start first wait
    await page.click('text=Le Commencement');
    await page.locator('[data-testid="volume-6"]').click();
    await page.click('button:has-text("Attendre 24h")');

    // Try to start another wait
    await page.goto('http://localhost:5174/chapters/chapter-id');
    await page.locator('[data-testid="volume-7"]').click();
    
    // Should show error
    await expect(page.locator('.error-message')).toContainText(
      'Un timer est déjà actif'
    );
  });
});
```

### 4. React Component Tests
```
@test component ChapterCard
```

Génère:
```typescript
// apps/admin/src/components/features/chapters/__tests__/ChapterCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ChapterCard } from '../ChapterCard';
import type { Chapter } from '@cher-journal/types';

const mockChapter: Chapter = {
  id: 'chapter-1',
  title: 'Test Chapter',
  protagonistName: 'Hero',
  status: 'PUBLISHED',
  coverAsset: {
    id: 'asset-1',
    objectKey: 'covers/test.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 1024,
    kind: 'COVER'
  },
  _count: {
    volumes: 10
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('ChapterCard', () => {
  it('should render chapter information', () => {
    render(
      <ChapterCard 
        chapter={mockChapter} 
        onSelect={jest.fn()} 
      />
    );

    expect(screen.getByText('Test Chapter')).toBeInTheDocument();
    expect(screen.getByText('Hero')).toBeInTheDocument();
    expect(screen.getByText('PUBLISHED')).toBeInTheDocument();
    expect(screen.getByText('10 volumes')).toBeInTheDocument();
  });

  it('should render cover image', () => {
    render(
      <ChapterCard 
        chapter={mockChapter} 
        onSelect={jest.fn()} 
      />
    );

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/uploads/covers/test.jpg');
    expect(image).toHaveAttribute('alt', 'Test Chapter');
  });

  it('should call onSelect when clicked', () => {
    const handleSelect = jest.fn();
    
    render(
      <ChapterCard 
        chapter={mockChapter} 
        onSelect={handleSelect} 
      />
    );

    fireEvent.click(screen.getByText('Test Chapter'));
    expect(handleSelect).toHaveBeenCalledWith('chapter-1');
  });

  it('should apply correct status color', () => {
    const { rerender } = render(
      <ChapterCard 
        chapter={{ ...mockChapter, status: 'PUBLISHED' }} 
        onSelect={jest.fn()} 
      />
    );

    let badge = screen.getByText('PUBLISHED');
    expect(badge).toHaveClass('bg-green-500');

    rerender(
      <ChapterCard 
        chapter={{ ...mockChapter, status: 'DRAFT' }} 
        onSelect={jest.fn()} 
      />
    );

    badge = screen.getByText('DRAFT');
    expect(badge).toHaveClass('bg-gray-500');
  });

  it('should render without cover image', () => {
    const chapterNoCover = { ...mockChapter, coverAsset: null };
    
    render(
      <ChapterCard 
        chapter={chapterNoCover} 
        onSelect={jest.fn()} 
      />
    );

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
```

## Test Configuration

### Jest Config
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts']
};
```

### Prisma Mock
```typescript
// test/prisma-mock.ts
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

export const prismaMock = mockDeep<PrismaClient>() as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});
```

### Test Setup
```typescript
// test/setup.ts
import { config } from '@cher-journal/config';

// Override config for tests
process.env.DATABASE_URL = 'postgresql://localhost/test_db';
process.env.MASTER_ENCRYPTION_KEY = 'test-key-minimum-32-characters-long';
process.env.SESSION_SECRET = 'test-session-secret';
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode
```bash
npm test -- --watch
```

### Coverage
```bash
npm test -- --coverage
```

### Specific Test
```bash
npm test -- auth.service.test.ts
```

### Integration Tests Only
```bash
npm test -- --testPathPattern=integration
```

### E2E Tests
```bash
cd apps/test
npx playwright test

# UI mode
npx playwright test --ui

# Specific test
npx playwright test wait-until-free.spec.ts
```

## Test Patterns

### AAA Pattern (Arrange, Act, Assert)
```typescript
it('should do something', async () => {
  // Arrange: Setup
  const user = { id: 'user-id', email: 'test@example.com' };
  prismaMock.user.findUnique.mockResolvedValue(user);

  // Act: Execute
  const result = await service.getUser('user-id');

  // Assert: Verify
  expect(result).toEqual(user);
  expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
    where: { id: 'user-id' }
  });
});
```

### Test Data Factories
```typescript
// test/factories/user.factory.ts
export const createMockUser = (overrides = {}) => ({
  id: 'user-id',
  publicId: 'public-id',
  email: 'test@example.com',
  passwordHash: 'hashed',
  status: 'ACTIVE',
  role: 'USER',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

// Usage
const user = createMockUser({ email: 'custom@example.com' });
```

### Async Test Helpers
```typescript
// test/helpers.ts
export const waitFor = (ms: number) => 
  new Promise(resolve => setTimeout(resolve, ms));

export const waitForCondition = async (
  condition: () => boolean,
  timeout = 5000
) => {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await waitFor(100);
  }
};
```

## Best Practices

### ✅ Do
- Test comportement, pas implémentation
- Un test = un comportement
- Noms descriptifs: `should [action] when [condition]`
- AAA pattern (Arrange, Act, Assert)
- Isoler les tests (pas de dépendances)
- Mocker dépendances externes
- Tester cas edge
- Maintenir tests à jour

### ❌ Don't
- Tests flaky (résultats aléatoires)
- Tests dépendants de l'ordre
- Tests trop longs (timeout)
- Tester détails d'implémentation
- Duplication de logique
- Ignorer tests qui échouent
- Tests sans assertions

## Scripts Package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "cd apps/test && playwright test",
    "test:e2e:ui": "cd apps/test && playwright test --ui"
  }
}
```

## Checklist Tests

- [ ] Tests unitaires pour services
- [ ] Tests d'intégration pour API
- [ ] Tests composants React
- [ ] Tests E2E pour flows critiques
- [ ] Coverage > 80%
- [ ] Tous les cas d'erreur testés
- [ ] Edge cases couverts
- [ ] Tests passent en CI/CD
