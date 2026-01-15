# API Security Report

Generated: 2026-01-12T12:00:17.328Z

Total issues: 41

## 🟡 MEDIUM (15)

### 1. MISSING VALIDATION

- **Endpoint**: `POST /stripe/create-checkout-session`
- **File**: [apps/backend/src/modules/stripe/stripe.routes.ts/stripe.routes.ts.routes.ts](apps/backend/src/modules/stripe/stripe.routes.ts/stripe.routes.ts.routes.ts)
- **Description**: Mutation endpoint without body schema validation
- **Recommendation**: Add schema validation with Zod

### 2. MISSING VALIDATION

- **Endpoint**: `POST /stripe/webhook`
- **File**: [apps/backend/src/modules/stripe/stripe.routes.ts/stripe.routes.ts.routes.ts](apps/backend/src/modules/stripe/stripe.routes.ts/stripe.routes.ts.routes.ts)
- **Description**: Mutation endpoint without body schema validation
- **Recommendation**: Add schema validation with Zod

### 3. MISSING VALIDATION

- **Endpoint**: `POST /auth/register`
- **File**: [apps/backend/src/modules/auth/auth.routes.ts/auth.routes.ts.routes.ts](apps/backend/src/modules/auth/auth.routes.ts/auth.routes.ts.routes.ts)
- **Description**: Mutation endpoint without body schema validation
- **Recommendation**: Add schema validation with Zod

### 4. MISSING VALIDATION

- **Endpoint**: `POST /auth/login`
- **File**: [apps/backend/src/modules/auth/auth.routes.ts/auth.routes.ts.routes.ts](apps/backend/src/modules/auth/auth.routes.ts/auth.routes.ts.routes.ts)
- **Description**: Mutation endpoint without body schema validation
- **Recommendation**: Add schema validation with Zod

### 5. MISSING VALIDATION

- **Endpoint**: `POST /auth/logout`
- **File**: [apps/backend/src/modules/auth/auth.routes.ts/auth.routes.ts.routes.ts](apps/backend/src/modules/auth/auth.routes.ts/auth.routes.ts.routes.ts)
- **Description**: Mutation endpoint without body schema validation
- **Recommendation**: Add schema validation with Zod

### 6. MISSING BODY

- **Endpoint**: `POST /auth/logout`
- **File**: [apps\admin\src\store\auth.ts](apps\admin\src\store\auth.ts)
- **Description**: Mutation endpoint called without body
- **Recommendation**: Pass data as second argument

### 7. MISSING VALIDATION

- **Endpoint**: `POST /admin/chapters/:chapterId/volumes`
- **File**: [apps/backend/src/modules/admin/volumes/volumes.routes.ts](apps/backend/src/modules/admin/volumes/volumes.routes.ts)
- **Description**: Mutation endpoint without body schema validation
- **Recommendation**: Add schema validation with Zod

### 8. MISSING VALIDATION

- **Endpoint**: `PATCH /admin/volume-versions/:versionId/text`
- **File**: [apps/backend/src/modules/admin/volumes/volumes.routes.ts](apps/backend/src/modules/admin/volumes/volumes.routes.ts)
- **Description**: Mutation endpoint without body schema validation
- **Recommendation**: Add schema validation with Zod

### 9. MISSING VALIDATION

- **Endpoint**: `PATCH /admin/users/:id`
- **File**: [apps/backend/src/modules/admin/users/users.routes.ts](apps/backend/src/modules/admin/users/users.routes.ts)
- **Description**: Mutation endpoint without body schema validation
- **Recommendation**: Add schema validation with Zod

### 10. MISSING VALIDATION

- **Endpoint**: `PATCH /admin/settings/:key`
- **File**: [apps/backend/src/modules/admin/settings/settings.routes.ts](apps/backend/src/modules/admin/settings/settings.routes.ts)
- **Description**: Mutation endpoint without body schema validation
- **Recommendation**: Add schema validation with Zod

### 11. MISSING VALIDATION

- **Endpoint**: `POST /admin/chapters/:id/duplicate`
- **File**: [apps/backend/src/modules/admin/chapters/chapters.routes.ts](apps/backend/src/modules/admin/chapters/chapters.routes.ts)
- **Description**: Mutation endpoint without body schema validation
- **Recommendation**: Add schema validation with Zod

### 12. MISSING BODY

- **Endpoint**: `POST /admin/chapters/:id/duplicate`
- **File**: [apps\admin\src\pages\Chapters.tsx](apps\admin\src\pages\Chapters.tsx)
- **Description**: Mutation endpoint called without body
- **Recommendation**: Pass data as second argument

### 13. MISSING VALIDATION

- **Endpoint**: `POST /admin/assets/upload`
- **File**: [apps/backend/src/modules/admin/assets/assets.routes.ts](apps/backend/src/modules/admin/assets/assets.routes.ts)
- **Description**: Mutation endpoint without body schema validation
- **Recommendation**: Add schema validation with Zod

### 14. MISSING VALIDATION

- **Endpoint**: `PATCH /admin/chapters/:chapterId/assets/:id`
- **File**: [apps/backend/src/modules/admin/assets/assets.routes.ts](apps/backend/src/modules/admin/assets/assets.routes.ts)
- **Description**: Mutation endpoint without body schema validation
- **Recommendation**: Add schema validation with Zod

### 15. MISSING VALIDATION

- **Endpoint**: `POST /admin/chapters/:chapterId/assets/:assetId/versions/:versionId`
- **File**: [apps/backend/src/modules/admin/assets/assets.routes.ts](apps/backend/src/modules/admin/assets/assets.routes.ts)
- **Description**: Mutation endpoint without body schema validation
- **Recommendation**: Add schema validation with Zod

## 🟢 LOW (26)

### 1. UNUSED ENDPOINT

- **Endpoint**: `POST /stripe/create-checkout-session`
- **File**: [apps/backend/src/modules/stripe/stripe.routes.ts/stripe.routes.ts.routes.ts](apps/backend/src/modules/stripe/stripe.routes.ts/stripe.routes.ts.routes.ts)
- **Description**: Endpoint defined but never used in frontend
- **Recommendation**: Consider removing if not needed for external APIs

### 2. UNUSED ENDPOINT

- **Endpoint**: `POST /auth/register`
- **File**: [apps/backend/src/modules/auth/auth.routes.ts/auth.routes.ts.routes.ts](apps/backend/src/modules/auth/auth.routes.ts/auth.routes.ts.routes.ts)
- **Description**: Endpoint defined but never used in frontend
- **Recommendation**: Consider removing if not needed for external APIs

### 3. UNUSED ENDPOINT

- **Endpoint**: `GET /me`
- **File**: [apps/backend/src/modules/auth/auth.routes.ts/auth.routes.ts.routes.ts](apps/backend/src/modules/auth/auth.routes.ts/auth.routes.ts.routes.ts)
- **Description**: Endpoint defined but never used in frontend
- **Recommendation**: Consider removing if not needed for external APIs

### 4. UNUSED ENDPOINT

- **Endpoint**: `POST /wait/start`
- **File**: [apps/backend/src/modules/reader/wait/wait.routes.ts](apps/backend/src/modules/reader/wait/wait.routes.ts)
- **Description**: Endpoint defined but never used in frontend
- **Recommendation**: Consider removing if not needed for external APIs

### 5. UNUSED ENDPOINT

- **Endpoint**: `GET /wait/status`
- **File**: [apps/backend/src/modules/reader/wait/wait.routes.ts](apps/backend/src/modules/reader/wait/wait.routes.ts)
- **Description**: Endpoint defined but never used in frontend
- **Recommendation**: Consider removing if not needed for external APIs

### 6. UNUSED ENDPOINT

- **Endpoint**: `GET /wait/active`
- **File**: [apps/backend/src/modules/reader/wait/wait.routes.ts](apps/backend/src/modules/reader/wait/wait.routes.ts)
- **Description**: Endpoint defined but never used in frontend
- **Recommendation**: Consider removing if not needed for external APIs

### 7. UNUSED ENDPOINT

- **Endpoint**: `GET /reader/volume-version`
- **File**: [apps/backend/src/modules/reader/reader/reader.routes.ts](apps/backend/src/modules/reader/reader/reader.routes.ts)
- **Description**: Endpoint defined but never used in frontend
- **Recommendation**: Consider removing if not needed for external APIs

### 8. UNUSED ENDPOINT

- **Endpoint**: `GET /reader/volume-versions/:versionId/render`
- **File**: [apps/backend/src/modules/reader/reader/reader.routes.ts](apps/backend/src/modules/reader/reader/reader.routes.ts)
- **Description**: Endpoint defined but never used in frontend
- **Recommendation**: Consider removing if not needed for external APIs

### 9. UNUSED ENDPOINT

- **Endpoint**: `GET /library`
- **File**: [apps/backend/src/modules/reader/library/library.routes.ts](apps/backend/src/modules/reader/library/library.routes.ts)
- **Description**: Endpoint defined but never used in frontend
- **Recommendation**: Consider removing if not needed for external APIs

### 10. UNUSED ENDPOINT

- **Endpoint**: `GET /chapters`
- **File**: [apps/backend/src/modules/reader/catalog/catalog.routes.ts](apps/backend/src/modules/reader/catalog/catalog.routes.ts)
- **Description**: Endpoint defined but never used in frontend
- **Recommendation**: Consider removing if not needed for external APIs

### 11. UNUSED ENDPOINT

- **Endpoint**: `GET /chapters/:id`
- **File**: [apps/backend/src/modules/reader/catalog/catalog.routes.ts](apps/backend/src/modules/reader/catalog/catalog.routes.ts)
- **Description**: Endpoint defined but never used in frontend
- **Recommendation**: Consider removing if not needed for external APIs

### 12. UNUSED ENDPOINT

- **Endpoint**: `GET /admin/chapters/:chapterId/volumes`
- **File**: [apps/backend/src/modules/admin/volumes/volumes.routes.ts](apps/backend/src/modules/admin/volumes/volumes.routes.ts)
- **Description**: Endpoint defined but never used in frontend
- **Recommendation**: Consider removing if not needed for external APIs

### 13. UNUSED ENDPOINT

- **Endpoint**: `GET /admin/volume-versions/:versionId/text`
- **File**: [apps/backend/src/modules/admin/volumes/volumes.routes.ts](apps/backend/src/modules/admin/volumes/volumes.routes.ts)
- **Description**: Endpoint defined but never used in frontend
- **Recommendation**: Consider removing if not needed for external APIs

### 14. UNUSED ENDPOINT

- **Endpoint**: `GET /admin/users/:id`
- **File**: [apps/backend/src/modules/admin/users/users.routes.ts](apps/backend/src/modules/admin/users/users.routes.ts)
- **Description**: Endpoint defined but never used in frontend
- **Recommendation**: Consider removing if not needed for external APIs

### 15. UNUSED ENDPOINT

- **Endpoint**: `GET /admin/settings`
- **File**: [apps/backend/src/modules/admin/settings/settings.routes.ts](apps/backend/src/modules/admin/settings/settings.routes.ts)
- **Description**: Endpoint defined but never used in frontend
- **Recommendation**: Consider removing if not needed for external APIs

### 16. UNUSED ENDPOINT

- **Endpoint**: `GET /admin/settings/defaults/prices`
- **File**: [apps/backend/src/modules/admin/settings/settings.routes.ts](apps/backend/src/modules/admin/settings/settings.routes.ts)
- **Description**: Endpoint defined but never used in frontend
- **Recommendation**: Consider removing if not needed for external APIs

### 17. UNUSED ENDPOINT

- **Endpoint**: `GET /admin/settings/:key`
- **File**: [apps/backend/src/modules/admin/settings/settings.routes.ts](apps/backend/src/modules/admin/settings/settings.routes.ts)
- **Description**: Endpoint defined but never used in frontend
- **Recommendation**: Consider removing if not needed for external APIs

### 18. UNUSED ENDPOINT

- **Endpoint**: `PATCH /admin/settings/:key`
- **File**: [apps/backend/src/modules/admin/settings/settings.routes.ts](apps/backend/src/modules/admin/settings/settings.routes.ts)
- **Description**: Endpoint defined but never used in frontend
- **Recommendation**: Consider removing if not needed for external APIs

### 19. UNUSED ENDPOINT

- **Endpoint**: `GET /admin/volume-versions/:volumeVersionId/pages`
- **File**: [apps/backend/src/modules/admin/pages/pages.routes.ts](apps/backend/src/modules/admin/pages/pages.routes.ts)
- **Description**: Endpoint defined but never used in frontend
- **Recommendation**: Consider removing if not needed for external APIs

### 20. UNUSED ENDPOINT

- **Endpoint**: `POST /admin/pages`
- **File**: [apps/backend/src/modules/admin/pages/pages.routes.ts](apps/backend/src/modules/admin/pages/pages.routes.ts)
- **Description**: Endpoint defined but never used in frontend
- **Recommendation**: Consider removing if not needed for external APIs

### 21. UNUSED ENDPOINT

- **Endpoint**: `DELETE /admin/pages/:id`
- **File**: [apps/backend/src/modules/admin/pages/pages.routes.ts](apps/backend/src/modules/admin/pages/pages.routes.ts)
- **Description**: Endpoint defined but never used in frontend
- **Recommendation**: Consider removing if not needed for external APIs

### 22. UNUSED ENDPOINT

- **Endpoint**: `POST /admin/pages/reorder`
- **File**: [apps/backend/src/modules/admin/pages/pages.routes.ts](apps/backend/src/modules/admin/pages/pages.routes.ts)
- **Description**: Endpoint defined but never used in frontend
- **Recommendation**: Consider removing if not needed for external APIs

### 23. UNUSED ENDPOINT

- **Endpoint**: `GET /admin/orders/:id`
- **File**: [apps/backend/src/modules/admin/orders/orders.routes.ts](apps/backend/src/modules/admin/orders/orders.routes.ts)
- **Description**: Endpoint defined but never used in frontend
- **Recommendation**: Consider removing if not needed for external APIs

### 24. UNUSED ENDPOINT

- **Endpoint**: `POST /admin/assets/upload`
- **File**: [apps/backend/src/modules/admin/assets/assets.routes.ts](apps/backend/src/modules/admin/assets/assets.routes.ts)
- **Description**: Endpoint defined but never used in frontend
- **Recommendation**: Consider removing if not needed for external APIs

### 25. UNUSED ENDPOINT

- **Endpoint**: `POST /admin/chapters/:chapterId/assets/:assetId/versions/:versionId`
- **File**: [apps/backend/src/modules/admin/assets/assets.routes.ts](apps/backend/src/modules/admin/assets/assets.routes.ts)
- **Description**: Endpoint defined but never used in frontend
- **Recommendation**: Consider removing if not needed for external APIs

### 26. UNUSED ENDPOINT

- **Endpoint**: `DELETE /admin/chapters/:chapterId/assets/:assetId/versions/:versionId`
- **File**: [apps/backend/src/modules/admin/assets/assets.routes.ts](apps/backend/src/modules/admin/assets/assets.routes.ts)
- **Description**: Endpoint defined but never used in frontend
- **Recommendation**: Consider removing if not needed for external APIs

