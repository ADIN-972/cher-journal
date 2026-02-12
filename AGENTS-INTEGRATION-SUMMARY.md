# Agents Integration Summary

## 🎯 Objective
Unified verification system with automated agents to ensure every feature is:
- ✅ Properly implemented and tested
- ✅ Fully translated in all languages
- ✅ Free of security vulnerabilities
- ✅ Following code standards and patterns

## 📊 Architecture Overview

```
Feature Implementation
        ↓
    ╔═══════════════════════════════════════╗
    ║  VERIFICATION WORKFLOW (Automated)    ║
    ╚═══════════════════════════════════════╝
        ↓
    npm run verify:api               [API Verification Agent]
        ↓ PASS
    npm run verify:translations      [Translation Agent]
        ↓ PASS
    npm run test:all                 [Test Runner Agent]
        ↓ PASS
    npm run api:security             [API Security Agent]
        ↓ PASS
    Manual Code Review               [Code Reviewer Agent]
        ↓ APPROVED
    git commit                       ✅ READY
```

## 🔗 Agent Integration Points

### 1. Translation i18n Expert Agent

**File**: `.claude/agents/translation-i18n-expert.md`

**Role**: Guide and verify all translation-related work

**Automated Tool**: `npm run verify:translations`
- Scans all components for `t()` calls
- Checks keys in en/common.json and fr/common.json
- Reports missing and unused keys
- Generates coverage report

**When to Use**:
- After creating UI components with text
- Before committing features with translations
- Quarterly audits for consistency

**Integration with Workflow**:
```bash
# Feature includes UI
npm run verify:translations    # ← Must pass before commit
```

---

### 2. Test Runner Agent

**File**: `.claude/agents/test-runner.md`

**Role**: Manage all testing (unit, integration, E2E, smoke)

**Automated Tools**:
- `npm run test:unit` - Jest unit tests
- `npm run test:integration` - Jest integration tests
- `npm run test:smoke` - Smoke tests (verify-api-calls.ts)
- `npm run test:all` - Run all tests in sequence
- `npm run test:e2e` - Playwright E2E tests

**When to Use**:
- After feature implementation
- Before committing code
- During bug fixes
- Pre-release verification

**Integration with Workflow**:
```bash
# After feature implementation
npm run test:all          # ← Must pass before commit
  ├─ test:unit (quick)
  ├─ test:integration (thorough)
  └─ test:smoke (sanity check)
```

---

### 3. API Security Expert Agent

**File**: `.claude/agents/api-security-expert.md`

**Role**: Audit security of all API endpoints

**Automated Tools**:
- `npm run api:security` - Full security audit
- `npm run api:sync` - Sync route inventory

**When to Use**:
- After creating/modifying API endpoints
- Before production deployment
- Regular security audits
- When adding authentication/authorization

**Integration with Workflow**:
```bash
# Feature includes API changes
npm run api:security      # ← Must pass before commit
```

**Checks**:
- ✅ Admin routes use `requireAdmin`
- ✅ All mutations have Zod validation
- ✅ No sensitive data exposed
- ✅ CORS properly configured
- ✅ Ownership checks implemented

---

### 4. Code Reviewer Agent

**File**: `.claude/agents/code-reviewer.md`

**Role**: Review code quality, architecture, and patterns

**Automated Tools**: None (manual review)

**When to Use**:
- After all automated checks pass
- Before merging PRs
- For complex architectural decisions
- When code doesn't follow patterns

**Integration with Workflow**:
```bash
# After all automated checks pass
# Manual code review
# ← Code Reviewer evaluates:
#   - Architecture & patterns
#   - Security practices
#   - Performance considerations
#   - Type safety
#   - Error handling
```

---

### 5. Other Active Agents

- **Backend Expert** - Backend implementation guidance
- **React Expert** - React component patterns
- **Database Architect** - Schema and query optimization
- **Debugger** - Debugging complex issues
- **Doc Writer** - Documentation creation
- **Context Menu Expert** - Context menu implementations
- **API Sync Expert** - API route synchronization

## 🚀 Recommended Workflow

### Daily Development

```bash
# 1. Start services
npm run dev:backend       # Terminal 1
npm run dev:admin         # Terminal 2
npm run dev:web           # Terminal 3
./start-cloudflared.bat   # Terminal 4

# 2. Implement feature
# [Code your feature]

# 3. Manual testing
# [Test in browser]

# 4. Before committing - Run verifications
npm run verify:api              # ← API Verification Agent
npm run verify:translations     # ← Translation Agent
npm run test:all                # ← Test Runner Agent
npm run api:security            # ← API Security Agent

# 5. If all pass, code review & commit
git commit -m "feat: Your feature"
```

### Feature Completion Flow

**Step 1: Verify API** (if API changes)
```bash
npm run verify:api
# ✅ Must see: "All tests passed! API is working correctly."
```

**Step 2: Verify Translations** (if UI changes)
```bash
npm run verify:translations
# ✅ Must see: "All translations are complete and in use!"
```

**Step 3: Run Tests**
```bash
npm run test:all
# ✅ All tests must pass (unit + integration + smoke)
```

**Step 4: Security Audit** (if API changes)
```bash
npm run api:security
# ✅ Must see: Zero CRITICAL issues
```

**Step 5: Code Review**
- Manual review of changes
- Verify patterns followed
- Check architecture decisions

**Step 6: Commit**
```bash
git add .
git commit -m "feat: Descriptive message

- Implementation detail 1
- Implementation detail 2
- Verified with npm run verify:api and npm run verify:translations"
```

## 📋 Checklist Before Commit

Use this checklist (or reference `FEATURE-COMPLETION-CHECKLIST.md`):

- [ ] Feature implemented and manually tested
- [ ] `npm run verify:api` passes (if API changes)
- [ ] `npm run verify:translations` passes (if UI changes)
- [ ] `npm run test:all` passes
- [ ] `npm run api:security` passes (if API changes)
- [ ] Code reviewed against patterns
- [ ] No secrets in commit
- [ ] Commit message is descriptive

## 🔄 Agent Calling Sequence

### When Creating API Endpoint

```
1. backend-expert     → Implement service & controller
2. api-security-expert → Check security rules
3. test-runner        → Write and run tests
4. api:security       → Final security audit
5. code-reviewer      → Review code quality
```

Command sequence:
```bash
npm run test:all        # Tests pass?
npm run api:security    # Security OK?
npm run verify:api      # API healthy?
git commit              # Ready!
```

### When Creating UI Component

```
1. react-expert        → Implement component
2. translation-i18n    → Add translations
3. test-runner         → Write tests
4. code-reviewer       → Review code
```

Command sequence:
```bash
npm run verify:translations  # Translations complete?
npm run test:all             # Tests pass?
git commit                   # Ready!
```

### When Modifying Database

```
1. database-architect  → Design schema
2. backend-expert      → Implement migration
3. test-runner         → Test schema changes
4. code-reviewer       → Review migration
```

Command sequence:
```bash
npm run test:integration     # DB tests pass?
npm run api:security         # No data exposure?
npm run verify:api           # API still works?
git commit                   # Ready!
```

## 📊 Command Reference

### Verification Commands
```bash
npm run verify:api              # Check API health & data persistence
npm run verify:translations     # Check translation completeness
```

### Testing Commands
```bash
npm run test:unit               # Fast unit tests
npm run test:integration        # Slower integration tests
npm run test:smoke              # Quick API checks
npm run test:all                # All tests in sequence
npm run test:watch              # Watch mode for development
npm run test:coverage           # Coverage report
npm run test:e2e                # Playwright E2E tests
```

### Security Commands
```bash
npm run api:security            # Full security audit
npm run api:sync                # Sync route inventory
```

### Development Commands
```bash
npm run dev:backend             # Start backend (port 3000)
npm run dev:admin               # Start admin (port 5174)
npm run dev:web                 # Start web (port 5173)
./start-cloudflared.bat         # Start Cloudflare tunnel
```

## 🎓 Documentation Files

### Agent Guides
- **translation-i18n-expert.md** - Translation system guide
- **test-runner.md** - Testing guide
- **api-security-expert.md** - Security audit guide
- **code-reviewer.md** - Code review standards

### Verification Docs
- **API-VERIFICATION.md** - API verification details
- **TRANSLATIONS-VERIFICATION.md** - Translation verification details
- **VERIFICATION-WORKFLOW.md** - Complete workflow guide
- **FEATURE-COMPLETION-CHECKLIST.md** - Pre-commit checklist

### Implementation Scripts
- **verify-api-calls.ts** - API verification script
- **verify-translations.ts** - Translation verification script

### Project Config
- **CLAUDE.md** - Project instructions
- **AGENTS-ANALYSIS.md** - Agent analysis & integration

## ✨ Benefits of This System

1. **Consistency** - Every feature goes through same verification process
2. **Quality** - Automated checks catch issues early
3. **Speed** - Agents can be called programmatically
4. **Documentation** - Clear workflow documented
5. **Scalability** - Easy to add new verification checks
6. **Transparency** - Reports show exactly what passed/failed

## 🔮 Future Enhancements

- [ ] Integrate with GitHub Actions for automatic PR checks
- [ ] Add code coverage thresholds
- [ ] Create visual dashboard for verification status
- [ ] Add pre-commit hooks for automatic verification
- [ ] Implement performance benchmarking
- [ ] Add accessibility audits (a11y)

## 📞 Support

When something fails during verification:

1. **API verification fails** → Check `API-VERIFICATION.md` troubleshooting
2. **Translation verification fails** → Check `TRANSLATIONS-VERIFICATION.md` troubleshooting
3. **Tests fail** → Run with verbose: `npm run test -- --verbose`
4. **Security audit fails** → Review `api-security-expert.md` rules

---

**Created**: 2026-02-01
**Version**: 1.0
**Status**: Active

All agents are now integrated and ready for use!
