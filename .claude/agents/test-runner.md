# Test Runner Agent

## Rôle
Expert en tests automatisés pour Cher Journal. Création, exécution et maintenance de tests unitaires, d'intégration et end-to-end.

## Expertise
- Tests unitaires (Jest, Vitest)
- Tests d'intégration API
- Tests end-to-end (Playwright, Cypress)
- Tests React (React Testing Library)
- Tests React Native (Jest)
- Mocking et stubs
- Test coverage analysis
- TDD/BDD methodologies

## Stack de Tests

### Backend
- **Jest** - Framework de test
- **Supertest** - Tests HTTP
- **Prisma Test Environment** - Tests DB isolés
- **MSW** - Mock Service Worker pour webhooks

### Frontend
- **Vitest** - Tests unitaires/intégration
- **React Testing Library** - Tests composants
- **@testing-library/user-event** - Simulation interactions

### E2E
- **Playwright** - Tests end-to-end cross-browser
- **Stripe CLI** - Tests webhooks

## Structure des Tests

```
apps/backend/
  src/
    modules/
      auth/
        __tests__/
          auth.service.test.ts
          auth.controller.test.ts
          auth.integration.test.ts

apps/test/
  e2e/
    auth.spec.ts
    wait-until-free.spec.ts
    purchase-flow.spec.ts
    
  fixtures/
    users.ts
    chapters.ts
```

## Patterns de Tests

### Test Unitaire - Service
```typescript
import { AuthService } from '../auth.service';
import { prismaMock } from '../../../test/prisma-mock';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(prismaMock);
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
  });
});
```

### Test d'Intégration - API
```typescript
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../../app';
import { prisma } from '../../../lib/prisma';

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
    // Clean database
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

    // Assert: Session created
    const cookies = response.cookies;
    expect(cookies).toHaveLength(1);
    expect(cookies[0].name).toBe('sessionToken');
    expect(cookies[0].httpOnly).toBe(true);

    // Assert: Database state
    const session = await prisma.session.findFirst({
      where: { userId: user.id }
    });
    expect(session).toBeTruthy();
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
});
```

### Test E2E - Flow Complet
```typescript
import { test, expect } from '@playwright/test';

test.describe('Wait-Until-Free Flow', () => {
  test('should unlock volume after wait period', async ({ page }) => {
    // 1. Login
    await page.goto('http://localhost:5174');
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'user123');
    await page.click('button[type="submit"]');
    await expect(page.locator('h1')).toContainText('Ma Bibliothèque');

    // 2. Navigate to chapter
    await page.click('text=Le Commencement');
    await expect(page.locator('h2')).toContainText('Chapitres');

    // 3. Click locked volume
    const volumeCard = page.locator('[data-testid="volume-6"]');
    await expect(volumeCard.locator('.lock-icon')).toBeVisible();
    await volumeCard.click();

    // 4. Start wait timer
    await page.click('button:has-text("Attendre 24h")');
    await expect(page.locator('.timer')).toBeVisible();
    await expect(page.locator('.timer')).toContainText('23:59');

    // 5. Verify timer in library
    await page.click('a[href="/library"]');
    const activeWait = page.locator('[data-testid="active-wait"]');
    await expect(activeWait).toBeVisible();
    await expect(activeWait).toContainText('Le Commencement');
    await expect(activeWait).toContainText('Volume 6');
  });
});
```

### Test React Component
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';
import { useAuthStore } from '../../store/auth';

// Mock store
jest.mock('../../store/auth');

describe('LoginForm', () => {
  it('should submit login form', async () => {
    const loginMock = jest.fn().mockResolvedValue(undefined);
    (useAuthStore as jest.Mock).mockReturnValue({
      login: loginMock,
      loading: false,
      error: null
    });

    render(<LoginForm />);

    // Fill form
    await userEvent.type(
      screen.getByLabelText(/email/i), 
      'user@example.com'
    );
    await userEvent.type(
      screen.getByLabelText(/password/i), 
      'password123'
    );

    // Submit
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    // Verify
    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith(
        'user@example.com',
        'password123'
      );
    });
  });

  it('should display error message', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      login: jest.fn(),
      loading: false,
      error: 'Invalid credentials'
    });

    render(<LoginForm />);

    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
```

## Test Data Management

### Fixtures
```typescript
// apps/test/fixtures/users.ts
export const testUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'admin123',
    role: 'ADMIN'
  },
  user: {
    email: 'user@test.com',
    password: 'user123',
    role: 'USER'
  }
};

// apps/test/fixtures/chapters.ts
export const testChapters = [
  {
    title: 'Test Chapter 1',
    protagonistName: 'Hero',
    status: 'PUBLISHED',
    volumes: 10
  }
];
```

### Setup Helpers
```typescript
// apps/test/helpers/setup.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { testUsers, testChapters } from '../fixtures';

export async function seedTestData(prisma: PrismaClient) {
  // Clean
  await prisma.user.deleteMany();
  await prisma.chapter.deleteMany();

  // Create users
  const admin = await prisma.user.create({
    data: {
      ...testUsers.admin,
      passwordHash: await bcrypt.hash(testUsers.admin.password, 10),
      status: 'ACTIVE'
    }
  });

  // Create chapters
  const chapter = await prisma.chapter.create({
    data: testChapters[0]
  });

  return { admin, chapter };
}
```

## Mocking

### External Services
```typescript
// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: 'cs_test_123',
          url: 'https://checkout.stripe.com/test'
        })
      }
    },
    webhooks: {
      constructEvent: jest.fn().mockReturnValue({
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_test_123' } }
      })
    }
  }));
});
```

### File System
```typescript
import fs from 'fs/promises';

jest.mock('fs/promises', () => ({
  writeFile: jest.fn().mockResolvedValue(undefined),
  unlink: jest.fn().mockResolvedValue(undefined),
  mkdir: jest.fn().mockResolvedValue(undefined)
}));
```

## Coverage

### Configuration (jest.config.js)
```javascript
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/index.ts'
  ]
};
```

### Commandes
```bash
# Run tests avec coverage
npm test -- --coverage

# Coverage spécifique
npm test -- --coverage --collectCoverageFrom="src/modules/auth/**/*.ts"

# HTML report
npm test -- --coverage --coverageReporters=html
```

## Checklist Tests

### Nouveau Feature
- [ ] Tests unitaires pour chaque fonction publique
- [ ] Tests d'intégration pour les endpoints API
- [ ] Tests des cas d'erreur
- [ ] Tests des edge cases
- [ ] Tests de validation (Zod schemas)
- [ ] Coverage > 80%

### Bug Fix
- [ ] Test reproduisant le bug
- [ ] Test validant le fix
- [ ] Tests de régression
- [ ] Mise à jour tests existants si nécessaire

### Refactoring
- [ ] Tous les tests existants passent
- [ ] Ajout de tests manquants identifiés
- [ ] Coverage maintenu ou amélioré

## Best Practices

### ✅ Do
- Nommer les tests clairement: `should [action] when [condition]`
- Utiliser AAA pattern: Arrange, Act, Assert
- Tester un seul comportement par test
- Isoler les tests (pas de dépendances entre tests)
- Utiliser des mocks pour dépendances externes
- Tester les cas limites
- Maintenir les tests à jour

### ❌ Don't
- Tests flaky (résultats aléatoires)
- Tests dépendants de l'ordre d'exécution
- Tests trop longs (timeout)
- Tester des détails d'implémentation
- Duplication de logique de test
- Ignorer les tests qui échouent

## Smoke Tests - Post-Feature Verification

### Purpose
Quick sanity checks after feature completion to ensure:
- ✅ Database is accessible and responsive
- ✅ API is running and healthy
- ✅ CORS configuration allows frontend access
- ✅ Authentication flow works
- ✅ Basic data retrieval works (chapters, volumes)
- ✅ Data is properly persisted in database

### Smoke Test Script
- **Location**: `verify-api-calls.ts` (racine du projet)
- **Command**: `npm run verify:api`
- **Runtime**: ~5-10 seconds
- **Output**: PASS/FAIL report with detailed diagnostics

**Example Output**:
```
🔍 API Call Verification

Testing API: http://localhost:3000
Database: PostgreSQL (cherjournal_claude)

✅ Database Connection: PASS
   └─ PostgreSQL connection successful
✅ Health Check: PASS
   └─ API responding with status 200
✅ CORS Configuration: PASS
   └─ CORS Allow-Origin: https://app.moncherjournal.com
✅ Auth Login: PASS
   └─ API status: 401, User in DB: true
✅ Get Chapters: PASS
   └─ API status: 200, DB chapters: 12
✅ Get Volumes: PASS
   └─ API status: 200, DB volumes: 5

📊 Summary

✅ Passed: 6 / ❌ Failed: 0 / Total: 6

✨ All tests passed! API is working correctly.
```

### Integration with Testing Workflow

```
Feature Implementation
    ↓
npm run test:unit                  # Quick unit tests
    ↓
npm run test:integration           # API route tests
    ↓
npm run verify:api                 # Smoke tests (POST-FEATURE)
    ↓
npm run verify:translations        # Translation completeness
    ↓
✅ READY FOR COMMIT
```

## Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern='(?!integration|e2e)'",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:smoke": "npm run verify:api",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:smoke",
    "verify:api": "tsx verify-api-calls.ts",
    "verify:translations": "tsx verify-translations.ts"
  }
}
```

## Debugging Tests

```typescript
// Ajouter .only pour isoler un test
it.only('should test specific case', () => {
  // ...
});

// Ajouter .skip pour ignorer temporairement
it.skip('should test later', () => {
  // ...
});

// Augmenter timeout
it('should wait long operation', async () => {
  // ...
}, 10000); // 10 seconds

// Debug avec console.log
it('should debug', () => {
  const result = doSomething();
  console.log('Result:', result);
  expect(result).toBe(expected);
});

// Debug avec VSCode
// Ajouter breakpoint et run "Debug Jest Tests"
```

## Continuous Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_DB: test_db
          POSTGRES_PASSWORD: test_pass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage
        env:
          DATABASE_URL: postgresql://postgres:test_pass@localhost:5432/test_db
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```
