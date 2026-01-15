# Getting Started

## Prerequisites

### Required Software
- **Node.js**: 20.x or higher ([Download](https://nodejs.org/))
- **PostgreSQL**: 15.x or higher ([Download](https://www.postgresql.org/download/))
- **npm**: 10.x or higher (comes with Node.js)
- **Git**: Latest version ([Download](https://git-scm.com/))

### Optional Tools
- **VS Code**: Recommended IDE ([Download](https://code.visualstudio.com/))
- **Postman**: API testing ([Download](https://www.postman.com/))
- **TablePlus**: Database GUI ([Download](https://tableplus.com/))

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/cher-journal.git
cd cher-journal
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
npm install
```

This will install dependencies for all packages and apps in the monorepo.

### 3. Environment Configuration

#### Backend Environment

Create `apps/backend/.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/cherjournal_dev?schema=public"

# Security
MASTER_ENCRYPTION_KEY="your-32-character-minimum-key-here"
SESSION_SECRET="your-strong-random-secret-here"

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGINS="http://localhost:5173,http://localhost:5174"

# Stripe (optional for development)
STRIPE_SECRET_KEY="sk_test_your_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_secret_here"
```

**Important**: 
- Generate secure keys for production
- Never commit `.env` files to version control
- Use at least 32 characters for encryption keys

#### Frontend Environment (Optional)

Create `apps/admin/.env` and `apps/web/.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 4. Database Setup

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE cherjournal_dev;

# Exit
\q
```

#### Run Migrations

```bash
cd apps/backend
npx prisma migrate dev
```

This will:
- Create all database tables
- Generate Prisma Client

#### Seed Initial Data

```bash
npm run prisma:seed
```

This creates:
- 2 test users (admin + regular user)
- 2 chapters with volumes
- Encrypted sample text

**Test Credentials**:
- Admin: `admin@cherjournal.com` / `admin123`
- User: `user@example.com` / `user123`

### 5. Build Shared Packages

```bash
# Build TypeScript types package
npm run build:types
```

## Running the Application

### Development Mode

Open 3 terminal windows:

#### Terminal 1: Backend
```bash
npm run dev:backend
```
Backend will start on `http://localhost:3000`

#### Terminal 2: Admin UI
```bash
npm run dev:admin
```
Admin UI will start on `http://localhost:5174`

#### Terminal 3: Web Reader (Optional)
```bash
npm run dev:web
```
Web reader will start on `http://localhost:5173`

### Accessing the Apps

- **Admin Dashboard**: http://localhost:5174
  - Login with: `admin@cherjournal.com` / `admin123`
  
- **API Documentation**: http://localhost:3000/docs (if configured)

- **Web Reader**: http://localhost:5173 (when available)
  - Login with: `user@example.com` / `user123`

## Development Workflow

### Making Changes

1. **Create a feature branch**:
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes** in the relevant app/package

3. **Test your changes**:
```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests (when available)
npm run test
```

4. **Commit your changes**:
```bash
git add .
git commit -m "feat: add your feature description"
```

5. **Push and create PR**:
```bash
git push origin feature/your-feature-name
```

### Database Changes

When modifying `schema.prisma`:

```bash
# Create a new migration
cd apps/backend
npx prisma migrate dev --name your_migration_name

# Generate updated Prisma Client
npx prisma generate

# Apply to production
npx prisma migrate deploy
```

### Adding Dependencies

```bash
# Add to specific workspace
npm install <package> -w apps/backend

# Add to root (devDependencies)
npm install -D <package>

# Examples:
npm install lodash -w apps/backend
npm install -D @types/node
```

## Common Commands

### Backend
```bash
npm run dev:backend          # Start dev server
npm run build:backend        # Build for production
npm run start:backend        # Run production build
npm run prisma:studio        # Open Prisma Studio (DB GUI)
npm run prisma:migrate:dev   # Run migrations
npm run prisma:seed          # Seed database
npm run prisma:reset         # Reset database
```

### Admin
```bash
npm run dev:admin            # Start dev server
npm run build:admin          # Build for production
npm run preview:admin        # Preview production build
```

### Web
```bash
npm run dev:web              # Start dev server
npm run build:web            # Build for production
npm run preview:web          # Preview production build
```

### Monorepo
```bash
npm run build                # Build all packages
npm run clean                # Clean all build artifacts
npm run lint                 # Lint all workspaces
npm run format               # Format code with Prettier
```

## Troubleshooting

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Database Connection Issues

1. Check PostgreSQL is running:
```bash
# Windows
pg_isready

# Mac
brew services list | grep postgresql
```

2. Verify `DATABASE_URL` in `.env`

3. Test connection:
```bash
psql -U postgres -d cherjournal_dev
```

### Prisma Client Not Generated

```bash
cd apps/backend
npx prisma generate
```

### Module Not Found Errors

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild types
npm run build:types
```

### Hot Reload Not Working

1. Restart the dev server
2. Clear browser cache
3. Check for ESLint/TypeScript errors

## IDE Setup

### VS Code

Recommended extensions (`.vscode/extensions.json`):

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "GitHub.copilot"
  ]
}
```

### Settings (`.vscode/settings.json`)

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```

## Next Steps

- Read the [Architecture](./ARCHITECTURE.md) document
- Check the [Kanban Board](./features/KANBAN-BOARD.md) for current tasks
- Review [Project Management](./features/PROJECT-MANAGEMENT.md) guidelines
- Explore the [Design System](./features/DESIGN-SYSTEM.md)
- Read the [Pricing Logic](../PRICING_LOGIC.md) documentation

## Getting Help

- Check existing [GitHub Issues](https://github.com/your-org/cher-journal/issues)
- Read the [Copilot Instructions](../.github/copilot-instructions.md)
- Contact the team on Slack/Discord
- Review the [FAQ](#faq) below

## FAQ

**Q: How do I reset the database?**
```bash
cd apps/backend
npm run prisma:reset
```

**Q: Where are the API routes defined?**
A: In `apps/backend/src/modules/*/` directories

**Q: How do I add a new admin page?**
A: Create a component in `apps/admin/src/pages/` and add a route in `App.tsx`

**Q: Why can't I see encrypted text?**
A: Text is encrypted and rendered as images. Check `apps/backend/src/modules/reader/reader.service.ts`

**Q: How do I test Stripe webhooks locally?**
A: Use [Stripe CLI](https://stripe.com/docs/stripe-cli):
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
