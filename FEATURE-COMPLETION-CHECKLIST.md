# Feature Completion Checklist

Complete this checklist before committing any feature to ensure full quality and verification.

## Pre-Flight Checks

- [ ] Feature is implemented according to requirements
- [ ] All services are running (backend, web, admin, cloudflared)
- [ ] Manual testing completed in browser
- [ ] No console errors in browser DevTools
- [ ] No backend errors in terminal logs

## Code Quality & Verification

### 1. API Verification (if feature includes API changes)
```bash
npm run verify:api
```
- [ ] Database Connection: PASS
- [ ] Health Check: PASS
- [ ] CORS Configuration: PASS
- [ ] All custom tests: PASS

**If failed**: Debug using backend logs and ensure services are running

### 2. Translation Verification (if feature includes UI)
```bash
npm run verify:translations
```
- [ ] All UI text uses `t()` function
- [ ] All keys exist in `en/common.json`
- [ ] All keys exist in `fr/common.json`
- [ ] No orphaned translation keys
- [ ] Report shows: ✨ All translations are complete

**If failed**: Add missing keys to translation files

### 3. Run All Tests
```bash
npm run test:all
```

#### Unit Tests
```bash
npm run test:unit
```
- [ ] All tests pass
- [ ] Coverage > 80% for new code
- [ ] No skipped tests (`.skip`, `.only`)

#### Integration Tests
```bash
npm run test:integration
```
- [ ] All API integration tests pass
- [ ] Database state verified
- [ ] Error cases handled

#### Smoke Tests
```bash
npm run test:smoke
```
- [ ] API is healthy
- [ ] Database is responsive
- [ ] CORS configuration correct

### 4. Security Audit
```bash
npm run api:security
```
- [ ] No CRITICAL issues
- [ ] No CRITICAL auth/validation issues
- [ ] All admin routes require `requireAdmin`
- [ ] All mutations have Zod validation
- [ ] No sensitive data exposed in responses

**If issues found**: Review `docs/api-security.md` and fix before committing

## Code Review Checklist

### Backend Changes
- [ ] Business logic in service layer, not controller
- [ ] Proper error handling and logging
- [ ] Database queries optimized (no N+1)
- [ ] Validation present for all inputs
- [ ] Types properly exported from `packages/types`
- [ ] Follows module structure (routes/controller/service/schemas)

### Frontend Changes
- [ ] All text properly translated with `t()`
- [ ] Components are properly typed (TypeScript)
- [ ] No hardcoded strings or values
- [ ] API calls handle errors gracefully
- [ ] Loading and error states implemented
- [ ] Responsive design verified (mobile, tablet, desktop)

### Database Changes
- [ ] Migration files are clean and reversible
- [ ] Seed data is consistent with schema
- [ ] Indexes added for frequently searched columns
- [ ] Constraints properly defined
- [ ] Relationships are correct (cascade rules)

### Translation Changes
- [ ] Keys follow naming convention: `category.key_name`
- [ ] English and French use consistent terminology
- [ ] No inconsistent casing or formatting
- [ ] Special characters properly encoded

## Pre-Commit Verification

### Git Status
```bash
git status
git diff
git log -5 --oneline
```
- [ ] Only intended files are modified
- [ ] No secrets committed (.env, credentials)
- [ ] No large binaries or test artifacts

### Code Review
- [ ] Code is clean and well-organized
- [ ] Comments explain WHY, not WHAT
- [ ] Variable names are clear and descriptive
- [ ] No dead code or commented-out code
- [ ] Imports are organized (React → libs → local)

## Commit & Documentation

### Commit Message
Format: `<type>: <subject>`

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

Example:
```
feat: Add user authentication with password reset

- Implement login/register endpoints
- Add password reset email flow
- Create LoginForm and RegisterForm components
- Add authentication tests (unit + integration)
- Verify with npm run verify:api and npm run verify:translations
```

- [ ] Commit message is descriptive and follows convention
- [ ] Message references any related issues

### Documentation
- [ ] README updated if needed
- [ ] API documentation updated (if applicable)
- [ ] Database schema documented (if changed)
- [ ] Translation keys documented
- [ ] Complex logic has inline comments

## Post-Commit (Before Push)

- [ ] All changes committed successfully
- [ ] Local branch is up to date with remote
- [ ] No merge conflicts
- [ ] Ready for PR/review

## Feature-Specific Checklists

### New API Endpoint
- [ ] Endpoint has proper HTTP method (GET/POST/PATCH/DELETE)
- [ ] Request/response schemas defined with Zod
- [ ] Authentication middleware correct (public/auth/admin)
- [ ] Error cases tested (400, 401, 404, 500)
- [ ] Database queries optimized
- [ ] CORS headers set correctly
- [ ] Rate limiting configured if needed
- [ ] Tests verify happy path + error cases

### New UI Component
- [ ] Component is properly typed
- [ ] All text uses `t()` function
- [ ] Responsive design verified
- [ ] Accessibility considered (labels, alt text)
- [ ] Error states handled
- [ ] Loading states handled
- [ ] Tests cover component behavior
- [ ] Translations complete in en + fr

### Database Migration
- [ ] Migration file is reversible
- [ ] Seed data consistent with migration
- [ ] Indexes added for performance
- [ ] Constraints properly defined
- [ ] Cascade rules appropriate
- [ ] Rollback tested locally

### New Translation Keys
- [ ] Keys follow naming convention
- [ ] Both en AND fr entries created
- [ ] Terminology consistent with existing translations
- [ ] Professional tone maintained
- [ ] Special characters properly encoded
- [ ] Verification passes: `npm run verify:translations`

## Multi-Feature Commits

If your feature includes API + UI + Database:

```bash
# 1. Verify each component independently
npm run verify:api           # Backend OK?
npm run verify:translations  # UI text OK?
npm run test:all            # Everything works?

# 2. Verify together
npm run api:security        # No security issues?

# 3. Review code
# Manual review of all changes

# 4. Commit
git commit -m "feat: Complete feature with API, UI, and database changes"
```

## Quick Reference - Complete Flow

```bash
# Development
npm run dev:backend          # Terminal 1
npm run dev:admin            # Terminal 2
npm run dev:web              # Terminal 3
./start-cloudflared.bat      # Terminal 4

# Feature implementation...
# [Manual testing in browser]

# Pre-commit verification
npm run verify:api              # ✅ API works
npm run verify:translations     # ✅ Translations complete
npm run test:unit               # ✅ Unit tests pass
npm run test:integration        # ✅ Integration tests pass
npm run test:smoke              # ✅ Smoke tests pass
npm run api:security            # ✅ No security issues

# If all pass ✅
git add .
git commit -m "feat: Your feature description

- Implementation detail 1
- Implementation detail 2
- Verified with npm run verify:api and npm run verify:translations"

# Ready for PR/push!
```

## Troubleshooting

### "verify:api fails"
- Ensure backend is running: `npm run dev:backend`
- Check PORT 3000 is not blocked: `netstat -ano | findstr :3000`
- Verify DATABASE_URL in `apps/backend/.env`

### "verify:translations fails"
- Ensure all text in components uses `t('key')` format
- Check JSON syntax in translation files
- Verify key exists in BOTH en/common.json AND fr/common.json

### "test:all fails"
- Run each test individually: `test:unit`, `test:integration`, `test:smoke`
- Check error output for specific failures
- Review test files for mocking issues

### "api:security fails"
- Review `docs/api-security.md` for guidelines
- Check all `/admin/*` routes use `requireAdmin`
- Verify all mutations have Zod schemas
- Ensure no sensitive data in API responses

## Success Criteria

Feature is complete when:

✅ `npm run verify:api` passes (if API changes)
✅ `npm run verify:translations` passes (if UI changes)
✅ `npm run test:all` passes
✅ `npm run api:security` passes (if API changes)
✅ Code review checklist passed
✅ Commit message is descriptive
✅ Ready for peer review/merge

---

**Last Updated**: 2026-02-01
**Related Documents**: VERIFICATION-WORKFLOW.md, API-VERIFICATION.md, TRANSLATIONS-VERIFICATION.md
