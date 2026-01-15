# API Inventory Report

Generated: 2026-01-12T12:00:17.326Z

Total endpoints: 55

## Module: stripe

### POST /stripe/create-checkout-session

- **Feature**: stripe.routes.ts
- **Handler**: controller.createCheckoutSession.bind
- **Authentication**: ✅ Required
- **Admin**: ❌ No
- **Middleware**: requireAuth
- **Used by**: 0 location(s)

### POST /stripe/webhook

- **Feature**: stripe.routes.ts
- **Handler**: controller.createCheckoutSession.bind
- **Authentication**: ✅ Required
- **Admin**: ❌ No
- **Middleware**: requireAuth
- **Used by**: 0 location(s)

## Module: auth

### POST /auth/register

- **Feature**: auth.routes.ts
- **Handler**: controller.register.bind
- **Authentication**: ✅ Required
- **Admin**: ❌ No
- **Middleware**: requireAuth
- **Used by**: 0 location(s)

### POST /auth/login

- **Feature**: auth.routes.ts
- **Handler**: controller.register.bind
- **Authentication**: ✅ Required
- **Admin**: ❌ No
- **Middleware**: requireAuth
- **Used by**: 1 location(s)
  - admin: [apps\admin\src\store\auth.ts:19](apps\admin\src\store\auth.ts#L19)

### POST /auth/logout

- **Feature**: auth.routes.ts
- **Handler**: controller.login.bind
- **Authentication**: ✅ Required
- **Admin**: ❌ No
- **Middleware**: requireAuth
- **Used by**: 1 location(s)
  - admin: [apps\admin\src\store\auth.ts:25](apps\admin\src\store\auth.ts#L25)

### GET /auth/me

- **Feature**: auth.routes.ts
- **Handler**: controller.logout.bind
- **Authentication**: ✅ Required
- **Admin**: ❌ No
- **Middleware**: requireAuth
- **Used by**: 1 location(s)
  - admin: [apps\admin\src\store\auth.ts:36](apps\admin\src\store\auth.ts#L36)

### GET /me

- **Feature**: auth.routes.ts
- **Handler**: controller.me.bind
- **Authentication**: ✅ Required
- **Admin**: ❌ No
- **Middleware**: requireAuth
- **Used by**: 0 location(s)

## Module: reader

### POST /wait/start

- **Feature**: wait
- **Handler**: controller.startWait.bind
- **Authentication**: ✅ Required
- **Admin**: ❌ No
- **Middleware**: requireAuth
- **Body Schema**: `startWaitSchema`
- **Used by**: 0 location(s)

### GET /wait/status

- **Feature**: wait
- **Handler**: controller.startWait.bind
- **Authentication**: ✅ Required
- **Admin**: ❌ No
- **Middleware**: requireAuth
- **Body Schema**: `startWaitSchema`
- **Used by**: 0 location(s)

### GET /wait/active

- **Feature**: wait
- **Handler**: controller.getWaitStatus.bind
- **Authentication**: ✅ Required
- **Admin**: ❌ No
- **Middleware**: requireAuth
- **Used by**: 0 location(s)

### GET /reader/volume-version

- **Feature**: reader
- **Handler**: controller.getVolumeVersion.bind
- **Authentication**: ✅ Required
- **Admin**: ❌ No
- **Middleware**: requireAuth
- **Used by**: 0 location(s)

### GET /reader/volume-versions/:versionId/render

- **Feature**: reader
- **Handler**: controller.getVolumeVersion.bind
- **Authentication**: ✅ Required
- **Admin**: ❌ No
- **Middleware**: requireAuth
- **Parameters**:
  - `versionId` (path, required)
- **Used by**: 0 location(s)

### GET /library

- **Feature**: library
- **Handler**: controller.getLibrary.bind
- **Authentication**: ✅ Required
- **Admin**: ❌ No
- **Middleware**: requireAuth
- **Used by**: 0 location(s)

### GET /chapters

- **Feature**: catalog
- **Handler**: controller.listChapters.bind
- **Authentication**: ✅ Required
- **Admin**: ❌ No
- **Middleware**: requireAuth
- **Used by**: 0 location(s)

### GET /chapters/:id

- **Feature**: catalog
- **Handler**: controller.listChapters.bind
- **Authentication**: ✅ Required
- **Admin**: ❌ No
- **Middleware**: requireAuth
- **Parameters**:
  - `id` (path, required)
- **Used by**: 0 location(s)

## Module: admin

### GET /admin/chapters/:chapterId/volumes

- **Feature**: volumes
- **Handler**: controller.listByChapter.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `chapterId` (path, required)
- **Used by**: 0 location(s)

### POST /admin/chapters/:chapterId/volumes

- **Feature**: volumes
- **Handler**: controller.listByChapter.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `chapterId` (path, required)
- **Used by**: 1 location(s)
  - admin: [apps\admin\src\pages\VolumeForm.tsx:105](apps\admin\src\pages\VolumeForm.tsx#L105)

### GET /admin/volumes/:id

- **Feature**: volumes
- **Handler**: controller.create.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `id` (path, required)
- **Body Schema**: `updateVolumeSchema`
- **Used by**: 1 location(s)
  - admin: [apps\admin\src\pages\VolumeForm.tsx:47](apps\admin\src\pages\VolumeForm.tsx#L47)

### PATCH /admin/volumes/:id

- **Feature**: volumes
- **Handler**: controller.getById.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `id` (path, required)
- **Body Schema**: `updateVolumeSchema`
- **Used by**: 3 location(s)
  - admin: [apps\admin\src\pages\VolumeForm.tsx:102](apps\admin\src\pages\VolumeForm.tsx#L102)
  - admin: [apps\admin\src\pages\ChapterDetail.tsx:163](apps\admin\src\pages\ChapterDetail.tsx#L163)
  - admin: [apps\admin\src\pages\ChapterDetail.tsx:191](apps\admin\src\pages\ChapterDetail.tsx#L191)

### DELETE /admin/volumes/:id

- **Feature**: volumes
- **Handler**: controller.update.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `id` (path, required)
- **Used by**: 1 location(s)
  - admin: [apps\admin\src\pages\ChapterDetail.tsx:110](apps\admin\src\pages\ChapterDetail.tsx#L110)

### POST /admin/volumes/:volumeId/versions

- **Feature**: volumes
- **Handler**: controller.delete.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `volumeId` (path, required)
- **Body Schema**: `updateVolumeVersionSchema`
- **Used by**: 2 location(s)
  - admin: [apps\admin\src\components\VolumePerspectiverDrawer.tsx:157](apps\admin\src\components\VolumePerspectiverDrawer.tsx#L157)
  - admin: [apps\admin\src\components\VolumePerspectiverDrawer.tsx:206](apps\admin\src\components\VolumePerspectiverDrawer.tsx#L206)

### PATCH /admin/volume-versions/:versionId

- **Feature**: volumes
- **Handler**: controller.createVersion.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `versionId` (path, required)
- **Body Schema**: `updateVolumeVersionSchema`
- **Used by**: 2 location(s)
  - admin: [apps\admin\src\components\VolumePerspectiverDrawer.tsx:132](apps\admin\src\components\VolumePerspectiverDrawer.tsx#L132)
  - admin: [apps\admin\src\components\VolumePerspectiverDrawer.tsx:151](apps\admin\src\components\VolumePerspectiverDrawer.tsx#L151)

### DELETE /admin/volume-versions/:versionId

- **Feature**: volumes
- **Handler**: controller.updateVersion.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `versionId` (path, required)
- **Body Schema**: `bulkUpdateVolumesSchema`
- **Used by**: 1 location(s)
  - admin: [apps\admin\src\components\VolumePerspectiverDrawer.tsx:178](apps\admin\src\components\VolumePerspectiverDrawer.tsx#L178)

### POST /admin/volumes/bulk-update

- **Feature**: volumes
- **Handler**: controller.deleteVersion.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Body Schema**: `bulkUpdateVolumesSchema`
- **Used by**: 1 location(s)
  - admin: [apps\admin\src\pages\ChapterDetail.tsx:147](apps\admin\src\pages\ChapterDetail.tsx#L147)

### GET /admin/volume-versions/:versionId/text

- **Feature**: volumes
- **Handler**: controller.bulkUpdate.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `versionId` (path, required)
- **Used by**: 0 location(s)

### PATCH /admin/volume-versions/:versionId/text

- **Feature**: volumes
- **Handler**: controller.getVersionText.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `versionId` (path, required)
- **Used by**: 1 location(s)
  - admin: [apps\admin\src\components\VolumePerspectiverDrawer.tsx:199](apps\admin\src\components\VolumePerspectiverDrawer.tsx#L199)

### GET /admin/users

- **Feature**: users
- **Handler**: controller.list.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Used by**: 1 location(s)
  - admin: [apps\admin\src\pages\Users.tsx:19](apps\admin\src\pages\Users.tsx#L19)

### GET /admin/users/:id

- **Feature**: users
- **Handler**: controller.list.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `id` (path, required)
- **Used by**: 0 location(s)

### PATCH /admin/users/:id

- **Feature**: users
- **Handler**: controller.getById.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `id` (path, required)
- **Used by**: 1 location(s)
  - admin: [apps\admin\src\pages\Users.tsx:32](apps\admin\src\pages\Users.tsx#L32)

### GET /admin/settings

- **Feature**: settings
- **Handler**: settingsController.getAll.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Used by**: 0 location(s)

### GET /admin/settings/defaults/prices

- **Feature**: settings
- **Handler**: settingsController.getAll.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Used by**: 0 location(s)

### GET /admin/settings/:key

- **Feature**: settings
- **Handler**: settingsController.getDefaultPrices.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `key` (path, required)
- **Used by**: 0 location(s)

### PATCH /admin/settings/:key

- **Feature**: settings
- **Handler**: settingsController.getByKey.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `key` (path, required)
- **Used by**: 0 location(s)

### GET /admin/volume-versions/:volumeVersionId/pages

- **Feature**: pages
- **Handler**: controller.listByVersion.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `volumeVersionId` (path, required)
- **Body Schema**: `createPageSchema`
- **Used by**: 0 location(s)

### POST /admin/pages

- **Feature**: pages
- **Handler**: controller.listByVersion.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Body Schema**: `createPageSchema`
- **Used by**: 0 location(s)

### DELETE /admin/pages/:id

- **Feature**: pages
- **Handler**: controller.create.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `id` (path, required)
- **Body Schema**: `createPageSchema`
- **Used by**: 0 location(s)

### POST /admin/pages/reorder

- **Feature**: pages
- **Handler**: controller.delete.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Body Schema**: `updatePageOrderSchema`
- **Used by**: 0 location(s)

### GET /admin/orders

- **Feature**: orders
- **Handler**: controller.list.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Used by**: 1 location(s)
  - admin: [apps\admin\src\pages\Orders.tsx:39](apps\admin\src\pages\Orders.tsx#L39)

### GET /admin/orders/:id

- **Feature**: orders
- **Handler**: controller.list.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `id` (path, required)
- **Used by**: 0 location(s)

### GET /admin/dashboard

- **Feature**: dashboard
- **Handler**: controller.getStats.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Used by**: 1 location(s)
  - admin: [apps\admin\src\pages\Dashboard.tsx:36](apps\admin\src\pages\Dashboard.tsx#L36)

### GET /admin/chapters

- **Feature**: chapters
- **Handler**: controller.list.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Used by**: 1 location(s)
  - admin: [apps\admin\src\pages\Chapters.tsx:87](apps\admin\src\pages\Chapters.tsx#L87)

### GET /admin/chapters/:id

- **Feature**: chapters
- **Handler**: controller.list.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `id` (path, required)
- **Body Schema**: `createChapterSchema`
- **Used by**: 2 location(s)
  - admin: [apps\admin\src\pages\VolumeForm.tsx:73](apps\admin\src\pages\VolumeForm.tsx#L73)
  - admin: [apps\admin\src\pages\ChapterDetail.tsx:61](apps\admin\src\pages\ChapterDetail.tsx#L61)

### POST /admin/chapters

- **Feature**: chapters
- **Handler**: controller.getById.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Body Schema**: `createChapterSchema`
- **Used by**: 1 location(s)
  - admin: [apps\admin\src\pages\Chapters.tsx:99](apps\admin\src\pages\Chapters.tsx#L99)

### PATCH /admin/chapters/:id

- **Feature**: chapters
- **Handler**: controller.create.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `id` (path, required)
- **Body Schema**: `updateChapterSchema`
- **Used by**: 3 location(s)
  - admin: [apps\admin\src\pages\Chapters.tsx:112](apps\admin\src\pages\Chapters.tsx#L112)
  - admin: [apps\admin\src\pages\Chapters.tsx:208](apps\admin\src\pages\Chapters.tsx#L208)
  - admin: [apps\admin\src\pages\ChapterDetail.tsx:185](apps\admin\src\pages\ChapterDetail.tsx#L185)

### DELETE /admin/chapters/:id

- **Feature**: chapters
- **Handler**: controller.update.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `id` (path, required)
- **Body Schema**: `bootstrapVolumesSchema`
- **Used by**: 1 location(s)
  - admin: [apps\admin\src\pages\Chapters.tsx:131](apps\admin\src\pages\Chapters.tsx#L131)

### POST /admin/chapters/:id/bootstrap-volumes

- **Feature**: chapters
- **Handler**: controller.delete.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `id` (path, required)
- **Body Schema**: `bootstrapVolumesSchema`
- **Used by**: 1 location(s)
  - admin: [apps\admin\src\pages\ChapterDetail.tsx:84](apps\admin\src\pages\ChapterDetail.tsx#L84)

### POST /admin/chapters/bulk-update

- **Feature**: chapters
- **Handler**: controller.bootstrapVolumes.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Body Schema**: `bulkUpdateChaptersSchema`
- **Used by**: 1 location(s)
  - admin: [apps\admin\src\pages\Chapters.tsx:183](apps\admin\src\pages\Chapters.tsx#L183)

### POST /admin/chapters/:id/duplicate

- **Feature**: chapters
- **Handler**: controller.bulkUpdate.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `id` (path, required)
- **Used by**: 1 location(s)
  - admin: [apps\admin\src\pages\Chapters.tsx:198](apps\admin\src\pages\Chapters.tsx#L198)

### GET /admin/chapters/:chapterId/assets

- **Feature**: assets
- **Handler**: controller.list.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `chapterId` (path, required)
- **Used by**: 2 location(s)
  - admin: [apps\admin\src\components\ImageGallery.tsx:44](apps\admin\src\components\ImageGallery.tsx#L44)
  - admin: [apps\admin\src\components\ChapterImageGallery.tsx:57](apps\admin\src\components\ChapterImageGallery.tsx#L57)

### POST /admin/assets/upload

- **Feature**: assets
- **Handler**: controller.list.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Used by**: 0 location(s)

### DELETE /admin/assets/:id

- **Feature**: assets
- **Handler**: controller.upload.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `id` (path, required)
- **Used by**: 1 location(s)
  - admin: [apps\admin\src\components\ImageGallery.tsx:61](apps\admin\src\components\ImageGallery.tsx#L61)

### PATCH /admin/chapters/:chapterId/assets/:id

- **Feature**: assets
- **Handler**: controller.delete.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `chapterId` (path, required)
  - `id` (path, required)
- **Used by**: 1 location(s)
  - admin: [apps\admin\src\components\ChapterImageGallery.tsx:82](apps\admin\src\components\ChapterImageGallery.tsx#L82)

### GET /admin/volumes/:volumeId/versions

- **Feature**: assets
- **Handler**: controller.update.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `volumeId` (path, required)
- **Used by**: 1 location(s)
  - admin: [apps\admin\src\components\VolumePerspectiverDrawer.tsx:84](apps\admin\src\components\VolumePerspectiverDrawer.tsx#L84)

### POST /admin/chapters/:chapterId/assets/:assetId/versions/:versionId

- **Feature**: assets
- **Handler**: controller.getVersions.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `chapterId` (path, required)
  - `assetId` (path, required)
  - `versionId` (path, required)
- **Used by**: 0 location(s)

### DELETE /admin/chapters/:chapterId/assets/:assetId/versions/:versionId

- **Feature**: assets
- **Handler**: controller.assignToVersion.bind
- **Authentication**: ❌ None
- **Admin**: ✅ Required
- **Middleware**: requireAdmin
- **Parameters**:
  - `chapterId` (path, required)
  - `assetId` (path, required)
  - `versionId` (path, required)
- **Used by**: 0 location(s)

