# Verification Workflow Guide

This guide explains how to use the automated verification agents after completing a feature.

## Two Verification Agents

### 1. API Verification Agent
**Purpose**: Verify all API calls reach the backend and result in database changes
**Command**: `npm run verify:api`
**Checks**:
- Database connectivity
- API health
- CORS headers
- Authentication
- Data retrieval from database
- Data integrity

### 2. Translation Verification Agent
**Purpose**: Verify all UI text is properly translated in all locales
**Command**: `npm run verify:translations`
**Checks**:
- All translatable text uses `t()` function
- All keys exist in English (`en/common.json`)
- All keys exist in French (`fr/common.json`)
- No orphaned/unused translation keys

## Feature Development Workflow

### Step 1: Develop Feature
- Implement the feature as requested
- Ensure all API endpoints are complete
- Wrap all UI text with `t()` function
- Add translation keys to both `en/common.json` and `fr/common.json`

### Step 2: Local Testing
Test manually in browser:
- ✅ Feature works as expected
- ✅ API calls complete
- ✅ Data persists in database
- ✅ UI is properly translated

### Step 3: Run Verification Agents

#### Verify API Implementation
```bash
npm run verify:api
```

**Expected output**:
```
✅ Database Connection: PASS
✅ Health Check: PASS
✅ CORS Configuration: PASS
✅ Auth Login: PASS
✅ Get Chapters: PASS
✅ Get Volumes: PASS

✨ All tests passed! API is working correctly.
```

**If it fails**:
1. Check backend logs
2. Verify database is running
3. Ensure all routes are implemented
4. Check CORS configuration
5. Fix issues and retry

#### Verify Translations
```bash
npm run verify:translations
```

**Expected output**:
```
✅ All used keys are translated!

✨ All translations are complete and in use!
```

**If it fails**:
1. Check which keys are missing
2. Add them to translation files
3. Ensure JSON syntax is valid
4. Verify key names match exactly
5. Retry verification

### Step 4: Commit Code
Once both agents pass:
1. Run `git status` to see all changes
2. Stage files: `git add [files]`
3. Commit with descriptive message:
   ```bash
   git commit -m "feat: Add new feature with complete API and translation support

   - Implemented API endpoints for feature
   - Added proper CORS headers
   - Verified all database changes
   - Added English and French translations
   - Verified with npm run verify:api and npm run verify:translations"
   ```

## Quick Reference

### Before Starting
```bash
# Ensure all services are running
npm run dev:backend        # Terminal 1
npm run dev:admin          # Terminal 2
npm run dev:web            # Terminal 3
./start-cloudflared.bat    # Terminal 4
```

### After Feature Completion
```bash
# Run both verifications
npm run verify:api
npm run verify:translations

# If both pass
git add .
git commit -m "Your message"
```

## Common Scenarios

### Scenario 1: New API Endpoint
1. ✅ Implement endpoint in backend
2. ✅ Test with curl/Postman
3. ✅ Add to `verify-api-calls.ts` if needed
4. ✅ Run: `npm run verify:api`
5. ✅ Commit

### Scenario 2: New UI Component
1. ✅ Create component with `t()` for all text
2. ✅ Add keys to `en/common.json`
3. ✅ Add keys to `fr/common.json`
4. ✅ Run: `npm run verify:translations`
5. ✅ Commit

### Scenario 3: API + UI Feature
1. ✅ Implement backend endpoints
2. ✅ Create UI components with `t()`
3. ✅ Connect frontend to API
4. ✅ Add all translations
5. ✅ Run: `npm run verify:api`
6. ✅ Run: `npm run verify:translations`
7. ✅ Commit

### Scenario 4: Translation Only Update
1. ✅ Update `en/common.json`
2. ✅ Update `fr/common.json`
3. ✅ Run: `npm run verify:translations`
4. ✅ Commit

## Understanding Test Results

### API Verification Results

| Test | Status | Meaning |
|------|--------|---------|
| Database Connection | PASS | PostgreSQL is accessible |
| Health Check | PASS | Backend is running on port 5000 |
| CORS Configuration | PASS | Frontend can call API from https://app.moncherjournal.com |
| Auth Login | PASS | User exists in DB and authentication works |
| Get Chapters | PASS | Chapters API returns data from database |
| Get Volumes | PASS | Volumes API returns data from database |

### Translation Verification Results

| Result | Meaning |
|--------|---------|
| Complete | Key exists in both en/common.json and fr/common.json |
| Partial | Key exists in only one language file |
| Missing | Key used in component but not in translation files |
| Unused | Key in translation file but not used in any component |

## Troubleshooting

### API Verification Fails

**Problem**: "Database connection failed"
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `apps/backend/.env`
- Verify database name is `cherjournal_claude`

**Problem**: "Health Check failed"
- Ensure backend is running: `npm run dev:backend`
- Check port 5000 is not in use: `netstat -ano | findstr :3000`
- Check backend logs for errors

**Problem**: "CORS Configuration failed"
- Verify `CORS_ORIGINS` in `apps/backend/.env` includes your domain
- Add: `https://app.moncherjournal.com,https://admin.moncherjournal.com`
- Restart backend after changes

### Translation Verification Fails

**Problem**: "Missing Translations"
- Add key to `apps/admin/public/locales/en/common.json`
- Add key to `apps/admin/public/locales/fr/common.json`
- Verify JSON syntax is valid
- Check key name matches exactly (case-sensitive)

**Problem**: "Unused Keys"
- Either delete unused keys from translation files
- Or add them to components with `t('key')`
- Remove if they're truly obsolete

**Problem**: "Found 0 component files"
- Ensure component files exist in:
  - `apps/admin/src/pages/`
  - `apps/admin/src/components/`
  - `apps/web/src/pages/`
  - `apps/web/src/components/`

## Setting Up for Success

### For Developers
1. Always use `t()` function for UI text
2. Add translations before committing
3. Run both verifications before commit
4. Check output carefully for issues

### For Reviewers
- [x] All UI text uses `t()` function?
- [x] Both `en/common.json` and `fr/common.json` updated?
- [x] `npm run verify:api` passes?
- [x] `npm run verify:translations` passes?
- [x] No orphaned translation keys?
- [x] Database changes are persisted?

## Performance Tips

- Run verifications in parallel in separate terminals
- Verifications typically take 5-10 seconds
- Cache translations locally to speed up subsequent runs
- Verify early and often during development

## Documentation

- [API Verification Details](./API-VERIFICATION.md)
- [Translations Verification Details](./TRANSLATIONS-VERIFICATION.md)
- [Project Configuration](./CLAUDE.md)
