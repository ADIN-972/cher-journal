# API Verification System

## Purpose
This system automatically verifies that all API calls reach the backend and result in proper database changes. After each feature development, we run a comprehensive test to ensure the full chain works correctly.

## How It Works

### Manual Verification
Run the verification script after completing a feature:

```bash
npm run verify:api
```

This will:
1. ✅ Check database connection
2. ✅ Test health endpoint
3. ✅ Verify CORS headers
4. ✅ Test authentication login
5. ✅ Verify chapter list
6. ✅ Verify volume list
7. ✅ Confirm all data exists in database

### What Gets Tested

| Test | Description | Verifies |
|------|-------------|----------|
| **Database Connection** | PostgreSQL connectivity | DB is accessible |
| **Health Check** | API health endpoint | Backend is running |
| **CORS Configuration** | Cross-origin headers | Frontend can call API |
| **Auth Login** | Login endpoint + DB lookup | Auth works & user exists in DB |
| **Get Chapters** | Fetch chapters list | API returns data & DB has records |
| **Get Volumes** | Fetch volumes list | API returns data & DB has records |

### Sample Output

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

## Integration with Development Workflow

### After Each Feature Implementation
1. Complete the feature in code
2. Ensure all services are running:
   ```bash
   # Backend
   npm run dev:backend

   # Web app
   npm run dev:web

   # Admin
   npm run dev:admin

   # Cloudflare tunnel
   ./start-cloudflared.bat
   ```

3. Run verification:
   ```bash
   npm run verify:api
   ```

4. If all tests pass: ✅ Feature is complete
5. If any test fails: 🔍 Debug and fix issues

## Extending Verification

To add more API endpoint tests, edit `verify-api-calls.ts`:

```typescript
async function testNewEndpoint(): Promise<TestResult> {
  try {
    const res = await fetch(`${API_BASE}/new-endpoint`, {
      headers: { 'Content-Type': 'application/json' }
    });

    const status = res.status;
    const data: any = await res.json();

    // Verify in DB
    const record = await prisma.yourTable.count();

    return {
      name: 'New Endpoint Test',
      status: status === 200 ? 'PASS' : 'FAIL',
      apiStatus: status,
      dbVerified: record > 0,
      details: `API status: ${status}, DB records: ${record}`
    };
  } catch (error: any) {
    return {
      name: 'New Endpoint Test',
      status: 'FAIL',
      error: error.message
    };
  }
}

// Add to runVerification():
await logResult(await testNewEndpoint());
```

## Environment Requirements

The script expects:
- Backend running on `http://localhost:3000`
- PostgreSQL database `cherjournal_claude`
- Seed users: `admin@cherjournal.com` / `admin123`
- All services accessible and healthy

## Troubleshooting

### "Cannot find module 'node-fetch'"
```bash
npm install node-fetch chalk
```

### "Database connection failed"
- Check PostgreSQL is running
- Verify DATABASE_URL in backend/.env

### "API not responding"
- Check backend is running: `npm run dev:backend`
- Verify no port conflicts (should be 3000)
- Check cloudflared tunnel status

### CORS tests failing
- Verify CORS_ORIGINS in backend/.env includes:
  - `https://app.moncherjournal.com`
  - `https://admin.moncherjournal.com`
- Restart backend after CORS changes
