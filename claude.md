# Cher Journal - Claude Configuration

## Project Overview
Cher Journal is a sensual and intimate digital library platform featuring erotic novels and content. The platform includes an admin dashboard, web application, and backend API built with React, TypeScript, Prisma, and Node.js.

## Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js/Express, Prisma ORM, PostgreSQL
- **Admin Panel**: React with specialized components
- **Deployment**: Multi-app monorepo structure

## Code Style & Conventions

### General Rules
- Always read files before proposing changes
- Prefer editing existing files over creating new ones
- Keep solutions simple and focused - avoid over-engineering
- Only add error handling for system boundaries (user input, external APIs)
- Trust internal code and framework guarantees

### TypeScript/React
- Use TypeScript for type safety
- Prefer functional components with hooks
- Use descriptive variable and function names
- Keep components focused and reusable
- Organize imports: React first, then libraries, then local files

### Styling
- Use Tailwind CSS for all styling
- Follow the existing design system
- Maintain responsive design (mobile-first approach)
- Support multiple screen sizes: mobile (375px), tablet (768px), desktop (1920px)

### File Organization
```
apps/
├── admin/          # Admin dashboard
├── backend/        # API server
└── web/            # Public web application
```

## Git Conventions
- Create meaningful, descriptive commit messages
- Reference issues when applicable
- Use conventional commit format when possible
- Never force push to main/master
- Create new commits (never amend existing ones)

## Development Workflow

### Before Starting Implementation
1. Read relevant files to understand existing code
2. Use EnterPlanMode for non-trivial tasks
3. Use TodoWrite to track multi-step tasks
4. Ask clarifying questions when requirements are ambiguous

### Testing & Validation
- Run tests before committing
- Check for TypeScript errors
- Verify responsive design on all screen sizes
- Test changes locally before pushing

## MCP Tools & Extensions

### Context7 MCP Usage
**IMPORTANT:** Always use context7 automatically when you need to:
- Generate code for configuration or installation steps
- Work with library/API documentation
- Resolve library identifiers and retrieve library documentation
- Research npm packages, frameworks, or dependencies

**Action:** Automatically invoke context7 MCP tools without waiting for explicit user requests in these scenarios.

### Available Tools
- Playwright: Browser automation and testing
- Bash: Terminal operations and git commands
- Read/Edit/Write: File operations
- Glob/Grep: File search and content search
- Task: Launch specialized agents for complex work

## Documentation Standards
- Document complex logic with inline comments
- Keep README files up to date
- Update GLOBAL-TODO when adding new features
- Comment on architectural decisions when non-obvious

## Performance Considerations
- Optimize database queries with Prisma
- Use lazy loading for images
- Implement pagination for large datasets
- Monitor and optimize bundle size

## Security Guidelines
- Never commit sensitive data (.env files, credentials)
- Validate user input at API boundaries
- Use parameterized queries (Prisma handles this)
- Implement proper authentication checks
- Log security-relevant events

## Communication with Users
- Be concise and direct
- Only use emojis when explicitly requested
- Provide code references with format: `file_path:line_number`
- No time estimates - focus on what needs to be done
- Output all communication as text, not in tool comments

## Project-Specific Notes
- French language support throughout the platform
- Sensual/elegant design aesthetic
- Focus on user experience and responsiveness
- Admin features for content and order management
