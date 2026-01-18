# API Documentation - Cher Journal

Base URL: `http://localhost:3000` ou `http://localhost:3000/api`

Toutes les routes fonctionnent avec ET sans le préfixe `/api`.

## Authentication

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "publicId": "uuid",
      "email": "user@example.com",
      "status": "ACTIVE",
      "role": "USER",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Sets `sessionToken` httpOnly cookie.

### Logout
```http
POST /auth/logout
```

Clears session cookie.

### Get Current User
```http
GET /auth/me
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

## Reader - Library

### Get User Library
```http
GET /library
```

**Auth Required**

Returns chapters user has access to with wait status.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "chapter": { ... },
      "availableVolumes": [1, 2, 3, 4, 5],
      "currentVolume": 3,
      "versionScope": "BASE",
      "waitStatus": {
        "isActive": true,
        "unlocksAt": "2024-01-02T00:00:00.000Z",
        "remainingMs": 86400000
      }
    }
  ]
}
```

## Reader - Catalog

### List Published Chapters
```http
GET /chapters
```

**Auth Required**

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Chapter Title",
      "protagonistName": "Character Name",
      "status": "PUBLISHED",
      "coverAsset": { ... },
      "_count": { "volumes": 10 }
    }
  ]
}
```

### Get Chapter Details
```http
GET /chapters/:id
```

**Auth Required**

Includes volumes and user access info.

## Reader - Wait-Until-Free

### Start Wait Timer
```http
POST /wait/start
Content-Type: application/json

{
  "chapterId": "uuid",
  "volumeNumber": 3
}
```

**Auth Required**

Starts wait timer for specified volume (first open only).

**Response:**
```json
{
  "success": true,
  "data": {
    "unlocksAt": "2024-01-02T00:00:00.000Z",
    "remainingMs": 86400000
  }
}
```

**Errors:**
- `VOLUME_NOT_FOUND` - Volume doesn't exist
- `NO_ACCESS` - User has no entitlement
- `WAIT_ALREADY_ACTIVE` - Another wait is active for this chapter

### Get Wait Status
```http
GET /wait/status?chapterId=uuid&volumeNumber=3
```

**Auth Required**

**Response:**
```json
{
  "success": true,
  "data": {
    "isActive": true,
    "unlocksAt": "2024-01-02T00:00:00.000Z",
    "remainingMs": 43200000
  }
}
```

### List Active Waits
```http
GET /wait/active
```

**Auth Required**

Returns all active waits for current user.

## Reader - Volume Reading

### Get Volume Version
```http
GET /reader/volume-version?chapterId=uuid&volumeNumber=1&perspective=NARRATOR
```

**Auth Required**

Returns volume version with assets (pages).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "volumeId": "uuid",
    "perspective": "NARRATOR",
    "title": "Volume 1 - Narrateur",
    "illustrationAsset": { ... },
    "assets": [
      {
        "id": "uuid",
        "assetOrder": 0,
        "chapterAsset": { ... }
      }
    ]
  }
}
```

### Render Volume Text as Image
```http
GET /reader/volume-versions/:versionId/render?fontSize=18&width=800
```

**Auth Required**

Query params:
- `fontSize` - Font size (default: 18)
- `fontFamily` - Font family (default: Arial)
- `width` - Canvas width (default: 800)
- `lineHeight` - Line height (default: fontSize * 1.5)

**Response:** PNG image

**Errors:**
- `NO_ACCESS` - User doesn't have access
- `NO_TEXT` - No text available for this version

## Stripe - Payments

### Create Checkout Session
```http
POST /stripe/create-checkout-session
Content-Type: application/json

{
  "chapterId": "uuid",
  "type": "CHAPTER",
  "versionScope": "ALL",
  "successUrl": "https://example.com/success",
  "cancelUrl": "https://example.com/cancel"
}
```

**Auth Required**

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_...",
    "url": "https://checkout.stripe.com/..."
  }
}
```

Redirect user to `url` for payment.

### Webhook (Stripe)
```http
POST /stripe/webhook
Stripe-Signature: xxx

{...stripe event...}
```

**Raw body required for signature verification**

Processes:
- `checkout.session.completed` - Grants entitlements
- `payment_intent.succeeded` - Confirms payment

## Admin - Dashboard

### Get Dashboard Stats
```http
GET /admin/dashboard
```

**Admin Auth Required**

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 10,
    "totalChapters": 5,
    "totalOrders": 20,
    "totalRevenue": 59980,
    "recentOrders": [...]
  }
}
```

## Admin - Chapters

### List Chapters
```http
GET /admin/chapters
```

**Admin Auth Required**

### Get Chapter
```http
GET /admin/chapters/:id
```

**Admin Auth Required**

Includes volumes, assets, and versions.

### Create Chapter
```http
POST /admin/chapters
Content-Type: application/json

{
  "title": "New Chapter",
  "protagonistName": "Hero Name",
  "status": "DRAFT"
}
```

**Admin Auth Required**

### Update Chapter
```http
PATCH /admin/chapters/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "PUBLISHED",
  "coverAssetId": "uuid"
}
```

**Admin Auth Required**

### Delete Chapter
```http
DELETE /admin/chapters/:id
```

**Admin Auth Required**

### Bootstrap Volumes
```http
POST /admin/chapters/:id/bootstrap-volumes
Content-Type: application/json

{
  "count": 10,
  "extraVolumes": 2
}
```

**Admin Auth Required**

Creates volumes 1-10 (normal) + 11-12 (extra) with narrator and protagonist versions.

## Admin - Volumes

### List Volumes by Chapter
```http
GET /admin/chapters/:chapterId/volumes
```

**Admin Auth Required**

### Get Volume
```http
GET /admin/volumes/:id
```

**Admin Auth Required**

### Update Volume
```http
PATCH /admin/volumes/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "isFinalPaywall": true,
  "illustrationAssetId": "uuid"
}
```

**Admin Auth Required**

### Update Volume Version
```http
PATCH /admin/volume-versions/:versionId
Content-Type: application/json

{
  "title": "New Title",
  "illustrationAssetId": "uuid",
  "text": "Plain text content (will be encrypted automatically)"
}
```

**Admin Auth Required**

Text is automatically encrypted before storage.

## Admin - Assets

### List Assets
```http
GET /admin/chapters/:chapterId/assets
```

**Admin Auth Required**

### Upload Asset
```http
POST /admin/assets/upload
Content-Type: multipart/form-data

chapterId: uuid
kind: IMAGE
label: Cover Image
file: [binary]
```

**Admin Auth Required**

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "chapterId": "uuid",
    "kind": "IMAGE",
    "objectKey": "chapter-id/timestamp-hash.jpg",
    "mimeType": "image/jpeg",
    "sizeBytes": 102400,
    "width": 1920,
    "height": 1080
  }
}
```

### Delete Asset
```http
DELETE /admin/assets/:id
```

**Admin Auth Required**

## Admin - Pages (VersionAssets)

### List Pages for Version
```http
GET /admin/volume-versions/:volumeVersionId/pages
```

**Admin Auth Required**

### Create Page
```http
POST /admin/pages
Content-Type: application/json

{
  "volumeVersionId": "uuid",
  "assetOrder": 0,
  "chapterAssetId": "uuid"
}
```

**Admin Auth Required**

### Delete Page
```http
DELETE /admin/pages/:id
```

**Admin Auth Required**

### Reorder Pages
```http
POST /admin/pages/reorder
Content-Type: application/json

{
  "pages": [
    { "id": "uuid-1", "assetOrder": 0 },
    { "id": "uuid-2", "assetOrder": 1 },
    { "id": "uuid-3", "assetOrder": 2 }
  ]
}
```

**Admin Auth Required**

## Admin - Users

### List Users
```http
GET /admin/users
```

**Admin Auth Required**

### Get User
```http
GET /admin/users/:id
```

**Admin Auth Required**

Includes orders, entitlements, and sessions.

## Admin - Orders

### List Orders
```http
GET /admin/orders
```

**Admin Auth Required**

### Get Order
```http
GET /admin/orders/:id
```

**Admin Auth Required**

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }
  }
}
```

Common error codes:
- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Insufficient permissions
- `VALIDATION_ERROR` - Invalid input
- `NOT_FOUND` - Resource not found
- `INTERNAL_ERROR` - Server error

## Rate Limiting

Default: 100 requests per 15 minutes per IP

Returns `429 Too Many Requests` when exceeded.

## CORS

Credentials (cookies) must be included:

```javascript
fetch('http://localhost:3000/api/auth/me', {
  credentials: 'include'
})
```
