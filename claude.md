# Cher Journal - Claude Configuration

## Project Overview
Cher Journal is a sensual and intimate digital library platform featuring erotic novels and content. The platform includes an admin dashboard, web application, and backend API built with React, TypeScript, Prisma, and Node.js.

## Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js/Express, Prisma ORM, PostgreSQL
- **Admin Panel**: React with specialized components
- **Mobile App**: React Native with Expo, TypeScript, Zustand, SQLite
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
├── web/            # Public web application
└── mobile/         # React Native mobile app
    ├── src/
    │   ├── app/                # Expo Router screens
    │   ├── screens/            # Screen components
    │   ├── components/         # Reusable components
    │   ├── stores/             # Zustand state management
    │   ├── services/           # API, database, cache services
    │   ├── hooks/              # Custom React hooks
    │   ├── db/                 # SQLite database setup
    │   ├── types/              # TypeScript type definitions
    │   └── utils/              # Utility functions
    └── __tests__/              # Database tests
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

---

## Mobile App Architecture (apps/mobile)

### Overview
React Native mobile app built with Expo, designed for offline-first reading of erotic novels with local caching and sync capabilities.

### Design Principles
- **Offline-First**: Cache data locally, sync when online
- **Layered Architecture**: Presentation → State → Data → Services
- **Type-Safe**: Full TypeScript strict mode
- **Performance**: Image caching with LRU eviction, efficient database queries

### State Management (Zustand)
- **authStore**: Authentication, token persistence, login/logout
- **chapterStore**: Chapter listing, caching, selection
- **volumeStore**: Volume management, perspective selection
- **volumeVersionsStore**: NARRATOR/PROTAGONIST content versions
- **userStore**: User progress, bookmarks
- **progressStore**: Reading progress tracking per volume
- **syncStore**: Offline action queue, sync status tracking

### Data Layer
- **SQLite Database** (expo-sqlite):
  - chapters, volumes, volume_versions (content)
  - user_progress (reading position and completion)
  - bookmarks, sync_queue (offline actions)
- **AsyncStorage**: Tokens, user preferences
- **Image Cache Service**: LRU cache with 100MB limit

### Services
- **API Client** (axios): Base URL, auth interceptors, error handling
- **Chapters API**: Fetch chapters and volumes from backend
- **Cache Service**: Download and cache images, manage cache size
- **Database Services**: CRUD operations for all tables
- **Sync Service**: Queue and process offline actions

### Navigation (Expo Router)
- **(auth)**: Login, signup, password reset screens
- **(main)**: Tab navigation (Chapters, Library, Account, Settings)
- **chapters**: List and detail screens with pull-to-refresh
- **reader**: Full-featured reader with perspective toggle and font controls

### Key Components
- **ChaptersListScreen**: Chapter browsing with cached images
- **ChapterDetailScreen**: Volume listing for selected chapter
- **ReaderScreen**: Reading experience with:
  - Perspective toggle (NARRATOR/PROTAGONIST)
  - Font size controls
  - Scroll position tracking
  - Reading progress saving
- **CachedImage**: Intelligent image loading with cache fallback

### Offline Capability
- All content cached to SQLite after first fetch
- Images cached locally with size management
- Reading progress synced via offline queue
- Auto-sync triggered when network reconnects
- Server-wins conflict resolution

### Development
- Run: `npm run dev:mobile` (from root)
- Type-check: `npm run type-check` (in apps/mobile)
- Environment: `.env.example` template provided
- Tests: Database schema and CRUD tests in `__tests__/`

### Implementation Status
- ✅ Phase 1: Foundation (Weeks 1-3) - Complete
- ✅ Phase 2: Offline Reading (Weeks 4-11) - Complete
- ✅ Phase 3: User Actions & Sync (Weeks 12-15) - Complete
- ⏳ Phase 4: Testing & Polish (Weeks 16-17) - Planned
