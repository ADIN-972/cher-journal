# Chapter Muse & Private Chapters Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow admins to designate a "Muse" (inspiring user) per chapter, with `isPrivate` chapters visible-but-locked for non-subscribers, and automatic promotions for the Muse.

**Architecture:** New `ChapterMuse` model links Chapter -> User -> CustomStoryRequest. `isPrivate` flag on Chapter controls access: private chapters are visible to all (with filigrane cover + padlock) but only accessible to the Muse and Club members. Muse discounts reuse the existing Promotion system (PERCENT/FIXED/FREE with scopes).

**Tech Stack:** Prisma (PostgreSQL), Fastify/Express, React (admin + web), React Native (mobile), Tailwind CSS, Zustand

---

## Task 1: Prisma Schema - Add isPrivate + ChapterMuse model

**Files:**
- Modify: `apps/backend/prisma/schema.prisma`

**Step 1: Add `isPrivate` field to Chapter model**

After the `isArchived` field (~line 63), add:

```prisma
isPrivate           Boolean               @default(false)
```

**Step 2: Add ChapterMuse model**

After the Chapter model, add:

```prisma
model ChapterMuse {
  id              String              @id @default(uuid())
  chapterId       String              @unique // One muse per chapter
  userId          String
  customStoryId   String?             // Optional link to CustomStoryRequest
  promotionId     String?             // Auto-created promotion for this muse
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  chapter         Chapter             @relation(fields: [chapterId], references: [id])
  user            User                @relation(fields: [userId], references: [id])
  customStory     CustomStoryRequest? @relation(fields: [customStoryId], references: [id])
  promotion       Promotion?          @relation(fields: [promotionId], references: [id])

  @@map("chapter_muses")
}
```

**Step 3: Add reverse relations**

- On `Chapter` model, add: `muse ChapterMuse?`
- On `User` model, add: `musedChapters ChapterMuse[]`
- On `CustomStoryRequest` model, add: `musedChapter ChapterMuse?`
- On `Promotion` model, add: `museGrant ChapterMuse?`

**Step 4: Generate migration**

```bash
cd apps/backend && npx prisma migrate dev --name add-chapter-muse-system
```

**Step 5: Commit**

```bash
git add apps/backend/prisma/
git commit -m "feat: add ChapterMuse model and isPrivate field to Chapter"
```

---

## Task 2: Backend - Admin chapters service + schema (isPrivate + bulk edit)

**Files:**
- Modify: `apps/backend/src/modules/admin/chapters/chapters.schemas.ts`
- Modify: `apps/backend/src/modules/admin/chapters/chapters.service.ts`
- Modify: `apps/backend/src/modules/admin/chapters/chapters.controller.ts`

**Step 1: Update validation schemas**

In `chapters.schemas.ts`, add `isPrivate` to:
- Single chapter update schema (`updateChapterSchema`): add `isPrivate: z.boolean().optional()`
- Bulk update schema (`bulkUpdateSchema.updates`): add `isPrivate: z.boolean().optional()`
- Create chapter schema if applicable

**Step 2: Update chapters service**

In `chapters.service.ts`:
- `updateChapter()`: handle `isPrivate` field in update data
- `bulkUpdate()` (~line 493-547): add `isPrivate` to the Prisma updateMany call when provided
- `listChapters()`: include `muse` relation in chapter queries (with user info)
- `getChapter()`: include `muse` relation with user and customStory

**Step 3: Update chapters controller**

In `chapters.controller.ts`:
- Ensure `isPrivate` is passed through from request body to service

**Step 4: Commit**

```bash
git add apps/backend/src/modules/admin/chapters/
git commit -m "feat: add isPrivate to admin chapter CRUD and bulk edit"
```

---

## Task 3: Backend - ChapterMuse admin routes + service

**Files:**
- Create: `apps/backend/src/modules/admin/chapter-muse/chapter-muse.service.ts`
- Create: `apps/backend/src/modules/admin/chapter-muse/chapter-muse.controller.ts`
- Create: `apps/backend/src/modules/admin/chapter-muse/chapter-muse.routes.ts`
- Create: `apps/backend/src/modules/admin/chapter-muse/chapter-muse.schemas.ts`
- Modify: `apps/backend/src/app.ts` (register routes)

**Step 1: Create schemas**

```typescript
// chapter-muse.schemas.ts
import { z } from 'zod';

export const assignMuseSchema = z.object({
  chapterId: z.string().uuid(),
  userId: z.string().uuid(),
  customStoryId: z.string().uuid().optional(),
});

export const updateMuseSchema = z.object({
  customStoryId: z.string().uuid().nullable().optional(),
  promotionId: z.string().uuid().nullable().optional(),
});
```

**Step 2: Create service**

```typescript
// chapter-muse.service.ts
// Methods:
// - assignMuse(chapterId, userId, customStoryId?) -> creates ChapterMuse record
// - removeMuse(chapterId) -> deletes ChapterMuse record
// - getMuseByChapter(chapterId) -> returns ChapterMuse with user + customStory
// - getMuseByUser(userId) -> returns all ChapterMuse records for a user
// - updateMuse(chapterId, data) -> updates customStoryId or promotionId
```

**Step 3: Create controller + routes**

Endpoints:
- `POST /admin/chapter-muse` - Assign muse to chapter
- `DELETE /admin/chapter-muse/:chapterId` - Remove muse from chapter
- `GET /admin/chapter-muse/:chapterId` - Get muse for chapter
- `PATCH /admin/chapter-muse/:chapterId` - Update muse (link promotion, etc.)

**Step 4: Register routes in app.ts**

**Step 5: Commit**

```bash
git add apps/backend/src/modules/admin/chapter-muse/ apps/backend/src/app.ts
git commit -m "feat: add admin ChapterMuse CRUD endpoints"
```

---

## Task 4: Backend - Access control for isPrivate chapters

**Files:**
- Modify: `apps/backend/src/lib/accessControl.ts`
- Modify: `apps/backend/src/modules/reader/catalog/catalog.service.ts`

**Step 1: Add chapter privacy check to AccessControlService**

New method in `accessControl.ts`:

```typescript
/**
 * Check if user can access a private chapter.
 * Private chapters are accessible to: the Muse, Club subscribers.
 * They are VISIBLE to everyone (with filigrane cover + padlock).
 */
async canAccessPrivateChapter(
  userId: string,
  chapterId: string
): Promise<boolean> {
  // Check if user is the muse
  const muse = await prisma.chapterMuse.findUnique({
    where: { chapterId },
  });
  if (muse && muse.userId === userId) return true;

  // Check if user has active Club subscription
  return this.hasActiveSubscription(userId);
}
```

**Step 2: Update catalog service**

In `catalog.service.ts`:
- `listChapters()`: Always return ALL published chapters (including isPrivate)
  - Add `isPrivate` field to response
  - Add `isPrivateLocked: boolean` — true if isPrivate AND user can't access
  - Include `muse` relation (only userId, not full user data for privacy)
- `getChapter()`:
  - If `isPrivate` and user can't access: return chapter metadata (cover, title, description) but NO volumes/content. Set a flag `isPrivateLocked: true`
  - If `isPrivate` and user CAN access (muse or club): normal response

**Step 3: Commit**

```bash
git add apps/backend/src/lib/accessControl.ts apps/backend/src/modules/reader/catalog/
git commit -m "feat: access control for private chapters (visible but locked)"
```

---

## Task 5: Backend - Reader endpoint for Muse's custom story links

**Files:**
- Modify: `apps/backend/src/modules/reader/reader/reader.service.ts` or create new
- Modify: `apps/backend/src/modules/reader/reader/reader.controller.ts`

**Step 1: Add endpoint to get user's muse chapters**

New reader endpoint: `GET /reader/my-muse-chapters`

Returns chapters where the current user is the muse, including:
- Chapter info (title, cover, id)
- Custom story request link (if any)
- Associated promotion (if any)

This data feeds the "Mes inspirations" / "Mes demandes" UI.

**Step 2: Commit**

```bash
git add apps/backend/src/modules/reader/
git commit -m "feat: add reader endpoint for muse's inspired chapters"
```

---

## Task 6: Admin UI - isPrivate in bulk edit + chapter form

**Files:**
- Modify: `apps/admin/src/components/BulkEditChapterModal.tsx`
- Modify: `apps/admin/src/components/ChapterForm.tsx`

**Step 1: Add isPrivate to BulkEditChapterModal**

Add a new optional checkbox row (same pattern as status/publishedAt/waitDuration):
- Checkbox to enable: "Chapitres prives"
- Toggle: isPrivate (true/false)
- Send in `updates.isPrivate` when checked

**Step 2: Add isPrivate toggle to ChapterForm**

Add a toggle/switch in the chapter form:
- Label: "Chapitre prive (Muse + Club uniquement)"
- Description: "Ce chapitre sera visible par tous mais accessible uniquement par la Muse et les membres du Club Prive"
- Boolean toggle

**Step 3: Commit**

```bash
git add apps/admin/src/components/BulkEditChapterModal.tsx apps/admin/src/components/ChapterForm.tsx
git commit -m "feat: add isPrivate toggle to admin chapter form and bulk edit"
```

---

## Task 7: Admin UI - Muse management on chapter detail

**Files:**
- Modify: `apps/admin/src/pages/ChapterDetail.tsx`
- Create: `apps/admin/src/components/ChapterMuseSection.tsx`

**Step 1: Create ChapterMuseSection component**

A card/section on the chapter detail page:
- Title: "Muse du chapitre"
- If no muse assigned:
  - User search/select dropdown (search users by email/name)
  - Optional: Custom story selector (dropdown of user's custom story requests)
  - "Assigner la Muse" button
- If muse assigned:
  - Show muse info (name, email)
  - Show linked custom story (if any) with link
  - Show linked promotion (if any) with link to promotion page
  - "Creer une promotion pour la Muse" button -> navigates to promotion form pre-filled with targetType=SPECIFIC_USERS, targetUserIds=[museUserId]
  - "Retirer la Muse" button (with confirmation)

**Step 2: Integrate into ChapterDetail page**

Add `<ChapterMuseSection chapterId={id} />` to the chapter detail page.

**Step 3: Commit**

```bash
git add apps/admin/src/components/ChapterMuseSection.tsx apps/admin/src/pages/ChapterDetail.tsx
git commit -m "feat: add Muse management section to admin chapter detail"
```

---

## Task 8: Web Frontend - Private chapter display (filigrane + padlock)

**Files:**
- Modify: `apps/web/src/components/catalog/ChapterCard.tsx`
- Modify: `apps/web/src/pages/Chapter.tsx`

**Step 1: Update ChapterCard for private chapters**

When `chapter.isPrivate && chapter.isPrivateLocked`:
- Cover image: apply CSS filter (grayscale + opacity 50%) for filigrane effect
- Overlay: padlock icon (material-symbols `lock`) centered on cover
- Badge: "Club Prive" or "Exclusif" purple badge in corner
- Card still clickable -> navigates to chapter page

**Step 2: Update Chapter detail page for locked private chapters**

When `chapter.isPrivateLocked`:
- Show chapter header (cover, title, protagonist name) normally
- Replace volume list with a promotional block:
  - Padlock icon
  - "Ce chapitre est reserve aux membres du Club Prive"
  - CTA button: "Rejoindre le Club" -> subscription page
  - If user is muse: should never reach this state (backend grants access)

**Step 3: Commit**

```bash
git add apps/web/src/components/catalog/ChapterCard.tsx apps/web/src/pages/Chapter.tsx
git commit -m "feat: show private chapters with filigrane cover and padlock on web"
```

---

## Task 9: Mobile Frontend - Private chapter display

**Files:**
- Modify: `apps/mobile/src/screens/ChaptersListScreen.tsx`
- Modify: `apps/mobile/src/screens/ChapterDetailScreen.tsx`

**Step 1: Update ChaptersListScreen for private chapters**

When `chapter.isPrivate && chapter.isPrivateLocked`:
- Cover image: apply opacity style (0.4) + grayscale tint
- Padlock icon overlay on the cover thumbnail
- Purple "Club" badge
- Row still tappable -> navigates to chapter detail

**Step 2: Update ChapterDetailScreen for locked private chapters**

When `chapter.isPrivateLocked`:
- Show hero header (cover image, title, protagonist) normally
- Replace volumes list with lock/promotion card:
  - Lock icon
  - "Chapitre reserve aux membres du Club Prive"
  - "Rejoindre le Club" button -> subscription screen

**Step 3: Commit**

```bash
git add apps/mobile/src/screens/ChaptersListScreen.tsx apps/mobile/src/screens/ChapterDetailScreen.tsx
git commit -m "feat: show private chapters with filigrane cover and padlock on mobile"
```

---

## Task 10: Mobile - Muse link in My Requests screen

**Files:**
- Modify: `apps/mobile/src/screens/MyRequestsScreen.tsx`

**Step 1: Show linked chapter for Muse's custom stories**

When a custom story request has a linked published chapter (via ChapterMuse):
- Show a "Chapitre publie" badge on the request card
- Add a link/button "Voir le chapitre" that navigates to the chapter detail screen
- Fetch muse data from the new `GET /reader/my-muse-chapters` endpoint

**Step 2: Commit**

```bash
git add apps/mobile/src/screens/MyRequestsScreen.tsx
git commit -m "feat: show linked chapter in Muse's custom story requests"
```

---

## Task 11: Web - Muse link in account/requests

**Files:**
- Modify: `apps/web/src/pages/Account.tsx` (or the relevant requests section)

**Step 1: Show linked chapter for Muse's custom stories**

Same concept as mobile: when the user is a Muse, show a link to the chapter they inspired in their requests/account section.

**Step 2: Commit**

```bash
git add apps/web/src/pages/Account.tsx
git commit -m "feat: show linked chapter in Muse's custom story requests on web"
```

---

## Task 12: Admin translations

**Files:**
- Modify: `apps/admin/public/locales/fr/common.json`
- Modify: `apps/admin/public/locales/en/common.json`

**Step 1: Add translation keys**

French:
```json
"isPrivate": "Chapitre prive",
"isPrivate_description": "Visible par tous, accessible uniquement par la Muse et les membres du Club",
"muse": "Muse",
"muse_section_title": "Muse du chapitre",
"assign_muse": "Assigner la Muse",
"remove_muse": "Retirer la Muse",
"create_muse_promotion": "Creer une promotion pour la Muse",
"no_muse_assigned": "Aucune Muse assignee",
"linked_custom_story": "Histoire personnalisee liee",
"linked_promotion": "Promotion liee"
```

English equivalents.

**Step 2: Commit**

```bash
git add apps/admin/public/locales/
git commit -m "feat: add Muse and isPrivate translation keys"
```

---

## Summary of all files touched

### Created (4 files):
- `apps/backend/src/modules/admin/chapter-muse/chapter-muse.service.ts`
- `apps/backend/src/modules/admin/chapter-muse/chapter-muse.controller.ts`
- `apps/backend/src/modules/admin/chapter-muse/chapter-muse.routes.ts`
- `apps/admin/src/components/ChapterMuseSection.tsx`

### Modified (15+ files):
- `apps/backend/prisma/schema.prisma`
- `apps/backend/src/app.ts`
- `apps/backend/src/lib/accessControl.ts`
- `apps/backend/src/modules/admin/chapters/chapters.schemas.ts`
- `apps/backend/src/modules/admin/chapters/chapters.service.ts`
- `apps/backend/src/modules/admin/chapters/chapters.controller.ts`
- `apps/backend/src/modules/reader/catalog/catalog.service.ts`
- `apps/backend/src/modules/reader/reader/reader.service.ts`
- `apps/admin/src/components/BulkEditChapterModal.tsx`
- `apps/admin/src/components/ChapterForm.tsx`
- `apps/admin/src/pages/ChapterDetail.tsx`
- `apps/admin/public/locales/fr/common.json`
- `apps/admin/public/locales/en/common.json`
- `apps/web/src/components/catalog/ChapterCard.tsx`
- `apps/web/src/pages/Chapter.tsx`
- `apps/mobile/src/screens/ChaptersListScreen.tsx`
- `apps/mobile/src/screens/ChapterDetailScreen.tsx`
- `apps/mobile/src/screens/MyRequestsScreen.tsx`
