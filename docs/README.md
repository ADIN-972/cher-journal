# Cher Journal - Documentation

Welcome to the Cher Journal documentation! This directory contains comprehensive guides and references for developers working on the project.

## 📚 Quick Links

- **[Getting Started](./GETTING-STARTED.md)** - Setup instructions and first steps
- **[Architecture](./ARCHITECTURE.md)** - System design and technical overview
- **[Pricing Logic](../PRICING_LOGIC.md)** - Business logic for monetization

## 📖 Documentation Structure

### Core Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](./GETTING-STARTED.md) | Installation, setup, and development workflow |
| [Architecture](./ARCHITECTURE.md) | Technical architecture, stack, and patterns |

### Feature Documentation

Located in [`features/`](./features/):

| Document | Description |
|----------|-------------|
| [Design System](./features/DESIGN-SYSTEM.md) | UI components, colors, and styles |
| [Kanban Board](./features/KANBAN-BOARD.md) | Task tracking and sprint planning |
| [Keyboard Shortcuts](./features/KEYBOARD-SHORTCUTS.md) | Productivity shortcuts |
| [Project Management](./features/PROJECT-MANAGEMENT.md) | Workflow, git flow, and processes |
| [State Management](./features/STATE-MANAGEMENT.md) | Zustand stores and patterns |

### Business Logic

| Document | Description |
|----------|-------------|
| [Pricing Logic](../PRICING_LOGIC.md) | Monetization rules and algorithms |

## 🚀 For New Developers

If you're new to the project, follow this path:

1. **[Getting Started](./GETTING-STARTED.md)** - Set up your environment
2. **[Architecture](./ARCHITECTURE.md)** - Understand the system
3. **[Pricing Logic](../PRICING_LOGIC.md)** - Learn the business model
4. **[Kanban Board](./features/KANBAN-BOARD.md)** - Find tasks to work on
5. **[Project Management](./features/PROJECT-MANAGEMENT.md)** - Follow the workflow

## 🎯 Quick References

### Project Overview
Cher Journal is a story reading platform with a unique **wait-until-free** monetization model. Users can read chapters with timers or purchase immediate access.

### Key Features
- 📖 **Dual Perspectives**: Stories from narrator and protagonist viewpoints
- ⏱️ **Wait-Until-Free**: Timer-based free access or instant paid unlock
- 🔒 **Text Encryption**: All content encrypted at rest (AES-256-GCM)
- 💳 **Stripe Payments**: Secure payment processing
- 📱 **Multi-Platform**: Web, admin, and mobile (React Native)

### Tech Stack
- **Backend**: Node.js, Fastify, Prisma, PostgreSQL
- **Frontend**: React, TypeScript, TailwindCSS, Vite
- **Mobile**: React Native, Expo
- **Payments**: Stripe

## 📂 Repository Structure

```
cher-journal/
├── apps/
│   ├── backend/       # Fastify API server
│   ├── admin/         # Admin dashboard (React)
│   ├── web/           # Reader web app (React)
│   └── mobile/        # Mobile app (React Native)
├── packages/
│   ├── types/         # Shared TypeScript types
│   ├── config/        # Configuration management
│   └── utils/         # Shared utilities
├── docs/              # 👈 You are here
├── .claude/           # AI agent configurations
└── .github/           # GitHub workflows & copilot
```

## 🛠️ Development Resources

### Local Development URLs
- **Backend API**: http://localhost:3000
- **Admin UI**: http://localhost:5174
- **Web Reader**: http://localhost:5173

### Test Credentials
After running `npm run prisma:seed`:
- **Admin**: admin@cherjournal.com / admin123
- **User**: user@example.com / user123

### Common Commands
```bash
npm run dev:backend      # Start backend server
npm run dev:admin        # Start admin UI
npm run dev:web          # Start web reader
npm run prisma:studio    # Open database GUI
npm run prisma:seed      # Seed test data
```

## 📝 Contributing

1. Read [Project Management](./features/PROJECT-MANAGEMENT.md) for workflow
2. Check [Kanban Board](./features/KANBAN-BOARD.md) for available tasks
3. Follow the [Design System](./features/DESIGN-SYSTEM.md) for UI work
4. Use [Keyboard Shortcuts](./features/KEYBOARD-SHORTCUTS.md) for productivity

## 🔍 Finding Information

### By Topic

- **Setup & Installation**: [Getting Started](./GETTING-STARTED.md)
- **System Design**: [Architecture](./ARCHITECTURE.md)
- **Business Rules**: [Pricing Logic](../PRICING_LOGIC.md)
- **UI Guidelines**: [Design System](./features/DESIGN-SYSTEM.md)
- **Workflow**: [Project Management](./features/PROJECT-MANAGEMENT.md)
- **State Management**: [State Management](./features/STATE-MANAGEMENT.md)
- **Task Tracking**: [Kanban Board](./features/KANBAN-BOARD.md)
- **Shortcuts**: [Keyboard Shortcuts](./features/KEYBOARD-SHORTCUTS.md)

### By Role

#### Backend Developer
1. [Architecture](./ARCHITECTURE.md) - Backend module structure
2. [Getting Started](./GETTING-STARTED.md) - Database setup
3. [Pricing Logic](../PRICING_LOGIC.md) - Business rules implementation

#### Frontend Developer
1. [Design System](./features/DESIGN-SYSTEM.md) - UI components
2. [State Management](./features/STATE-MANAGEMENT.md) - Zustand patterns
3. [Architecture](./ARCHITECTURE.md) - Frontend structure

#### Product Manager
1. [Kanban Board](./features/KANBAN-BOARD.md) - Sprint planning
2. [Pricing Logic](../PRICING_LOGIC.md) - Business model
3. [Project Management](./features/PROJECT-MANAGEMENT.md) - Workflow

#### DevOps
1. [Architecture](./ARCHITECTURE.md) - Deployment architecture
2. [Getting Started](./GETTING-STARTED.md) - Environment setup

## 🆘 Getting Help

### Documentation Issues
If you find errors or missing information in the docs:
1. Open an issue on GitHub
2. Submit a PR with corrections
3. Contact the team on Slack/Discord

### Technical Issues
1. Check [Getting Started - Troubleshooting](./GETTING-STARTED.md#troubleshooting)
2. Search [GitHub Issues](https://github.com/your-org/cher-journal/issues)
3. Ask in the team chat

### Business Questions
1. Review [Pricing Logic](../PRICING_LOGIC.md)
2. Check [Copilot Instructions](../.github/copilot-instructions.md)
3. Contact the product team

## 📅 Keeping Docs Updated

Documentation should be updated when:
- Adding new features
- Changing architecture
- Updating dependencies
- Modifying business logic
- Changing workflows

**Remember**: Good documentation is as important as good code!

## 📜 License

This documentation is part of the Cher Journal project and follows the same license.

---

**Last Updated**: January 2026  
**Maintained By**: Cher Journal Development Team
