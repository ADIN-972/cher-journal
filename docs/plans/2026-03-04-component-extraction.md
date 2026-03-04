# Component Extraction: ChapterHeader & VolumeCard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Extract the chapter reading section from UserDetailImproved.tsx into reusable ChapterHeader and VolumeCard components.

**Architecture:** Create a new directory `apps/admin/src/components/ChapterReadingSection/` with two components: ChapterHeader (presentational, receives protagonistName and title) and VolumeCard (smart, handles date formatting and internal logic). Both components are used together to display user's chapter reading progress in UserDetailImproved.tsx.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Material Design Icons

---

## Task 1: Create Directory Structure and Index File

**Files:**
- Create: `apps/admin/src/components/ChapterReadingSection/index.ts`
- Create: `apps/admin/src/components/ChapterReadingSection/ChapterHeader.tsx`
- Create: `apps/admin/src/components/ChapterReadingSection/VolumeCard.tsx`

**Step 1: Create the ChapterReadingSection directory**

Run: `mkdir -p apps/admin/src/components/ChapterReadingSection`

**Step 2: Create the index.ts barrel export file**

Create `apps/admin/src/components/ChapterReadingSection/index.ts`:

```typescript
export { ChapterHeader } from './ChapterHeader';
export { VolumeCard } from './VolumeCard';
```

**Step 3: Commit**

```bash
cd .worktrees/component-extraction
git add apps/admin/src/components/ChapterReadingSection/index.ts
git commit -m "feat: create ChapterReadingSection directory structure"
```

---

## Task 2: Create ChapterHeader Presentational Component

**Files:**
- Create: `apps/admin/src/components/ChapterReadingSection/ChapterHeader.tsx`

**Step 1: Create the ChapterHeader component**

Create `apps/admin/src/components/ChapterReadingSection/ChapterHeader.tsx`:

```typescript
import React from 'react';

interface ChapterHeaderProps {
  protagonistName: string;
  title: string;
}

export const ChapterHeader: React.FC<ChapterHeaderProps> = ({
  protagonistName,
  title,
}) => {
  return (
    <h3 className="font-semibold text-gray-900 mb-4">
      {protagonistName} : {title}
    </h3>
  );
};
```

**Step 2: Verify file is created and looks correct**

Run: `ls -la apps/admin/src/components/ChapterReadingSection/ChapterHeader.tsx`
Expected: File exists

**Step 3: Commit**

```bash
git add apps/admin/src/components/ChapterReadingSection/ChapterHeader.tsx
git commit -m "feat: create ChapterHeader presentational component"
```

---

## Task 3: Create VolumeCard Smart Component

**Files:**
- Create: `apps/admin/src/components/ChapterReadingSection/VolumeCard.tsx`

**Step 1: Create the VolumeCard component**

Create `apps/admin/src/components/ChapterReadingSection/VolumeCard.tsx`:

```typescript
import React, { useMemo } from 'react';

interface VolumeRead {
  id: string;
  chapterId: string;
  volumeNumber: number;
  perspective: 'NARRATOR' | 'PROTAGONIST';
  progress: number;
  firstOpenedAt: string;
  completedAt: string | null;
}

interface VolumeCardProps {
  volume: VolumeRead;
  locale?: string;
}

export const VolumeCard: React.FC<VolumeCardProps> = ({
  volume,
  locale = 'en-US'
}) => {
  // Memoized computed values
  const perspectiveBadgeColor = useMemo(() => {
    return volume.perspective === 'NARRATOR'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-purple-100 text-purple-700';
  }, [volume.perspective]);

  const perspectiveLabel = useMemo(() => {
    return volume.perspective === 'NARRATOR'
      ? '📖 Narrateur'
      : '🔓 Protagoniste';
  }, [volume.perspective]);

  const progressBarColor = useMemo(() => {
    return volume.perspective === 'NARRATOR' ? 'bg-blue-500' : 'bg-purple-500';
  }, [volume.perspective]);

  const openedDate = useMemo(() => {
    return new Date(volume.firstOpenedAt).toLocaleDateString(locale);
  }, [volume.firstOpenedAt, locale]);

  const completedDate = useMemo(() => {
    if (!volume.completedAt) return null;
    return new Date(volume.completedAt).toLocaleDateString(locale);
  }, [volume.completedAt, locale]);

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-600 bg-gray-300">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-medium text-gray-700">
            Vol. {volume.volumeNumber}
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${perspectiveBadgeColor}`}>
            {perspectiveLabel}
          </span>
          <span className="text-xs text-gray-500 ml-auto">
            Ouvert {openedDate}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all ${progressBarColor}`}
              style={{ width: `${volume.progress}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700 min-w-[50px] text-right">
            {volume.progress}%
          </span>
        </div>
        {completedDate && (
          <div className="text-xs text-green-600 mt-1">
            ✓ Complété {completedDate}
          </div>
        )}
      </div>
    </div>
  );
};
```

**Step 2: Verify file is created**

Run: `ls -la apps/admin/src/components/ChapterReadingSection/VolumeCard.tsx`
Expected: File exists

**Step 3: Commit**

```bash
git add apps/admin/src/components/ChapterReadingSection/VolumeCard.tsx
git commit -m "feat: create VolumeCard smart component with date formatting and progress display"
```

---

## Task 4: Update ChapterReadingSection Index Export

**Files:**
- Modify: `apps/admin/src/components/ChapterReadingSection/index.ts`

**Step 1: Export component types for external use**

Update `apps/admin/src/components/ChapterReadingSection/index.ts`:

```typescript
export { ChapterHeader } from './ChapterHeader';
export { VolumeCard } from './VolumeCard';
export type { VolumeRead } from './VolumeCard';
```

**Step 2: Verify index exports are correct**

Run: `grep -n "export" apps/admin/src/components/ChapterReadingSection/index.ts`
Expected: Shows ChapterHeader, VolumeCard, and VolumeRead exports

**Step 3: Commit**

```bash
git add apps/admin/src/components/ChapterReadingSection/index.ts
git commit -m "feat: export component types from ChapterReadingSection index"
```

---

## Task 5: Update UserDetailImproved.tsx to Use New Components

**Files:**
- Modify: `apps/admin/src/pages/UserDetailImproved.tsx` (lines 1-50 for imports, lines 553-627 for usage)

**Step 1: Add imports for new components**

Add to the imports section at the top of UserDetailImproved.tsx (around line 14):

```typescript
import { ChapterHeader, VolumeCard } from '../components/ChapterReadingSection';
```

**Step 2: Replace the inline chapter reading section with component usage**

Find the section at lines 553-627 that contains:
```typescript
user.reads.reduce((map, read) => {
  const chapter = map.get(read.chapterId) || {
    id: read.chapterId,
    title: read.chapter.title,
    protagonistName: read.chapter.protagonistName,
    volumes: [],
  };
  chapter.volumes.push(read);
  map.set(read.chapterId, chapter);
  return map;
}, new Map<string, any>()),
).map(([, chapter]) => (
  <div key={chapter.id}>
    <h3 className="font-semibold text-gray-900 mb-4">
      {chapter.protagonistName} : {chapter.title}
    </h3>
    <div className="grid grid-cols-2 gap-3">
      {chapter.volumes
        .sort((a, b) => a.volumeNumber - b.volumeNumber)
        .map((volume: VolumeRead) => (
          <div key={volume.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-600 bg-gray-300">
            {/* Volume card content */}
          </div>
        ))}
    </div>
  </div>
))
```

Replace it with:

```typescript
user.reads.reduce((map, read) => {
  const chapter = map.get(read.chapterId) || {
    id: read.chapterId,
    title: read.chapter.title,
    protagonistName: read.chapter.protagonistName,
    volumes: [],
  };
  chapter.volumes.push(read);
  map.set(read.chapterId, chapter);
  return map;
}, new Map<string, any>()),
).map(([, chapter]) => (
  <div key={chapter.id}>
    <ChapterHeader
      protagonistName={chapter.protagonistName}
      title={chapter.title}
    />
    <div className="grid grid-cols-2 gap-3">
      {chapter.volumes
        .sort((a, b) => a.volumeNumber - b.volumeNumber)
        .map((volume: VolumeRead) => (
          <VolumeCard
            key={volume.id}
            volume={volume}
            locale={locale}
          />
        ))}
    </div>
  </div>
))
```

**Step 3: Verify syntax is correct**

Run: `npx tsc --noEmit apps/admin/src/pages/UserDetailImproved.tsx`
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add apps/admin/src/pages/UserDetailImproved.tsx
git commit -m "feat: integrate ChapterHeader and VolumeCard components into UserDetailImproved"
```

---

## Task 6: Test Component Integration

**Files:**
- Test: `apps/admin/src/pages/UserDetailImproved.tsx` (manual testing only)

**Step 1: Start development server**

Run: `npm run dev`
Expected: Dev server starts without errors

**Step 2: Navigate to a user detail page**

1. Open admin dashboard in browser
2. Go to Users list
3. Click on any user to open detail page
4. Scroll to "Lectures du" (Chapter Reading) section

**Step 3: Verify components render correctly**

Check:
- ✅ Chapter header displays protagonistName and title
- ✅ Volume cards appear in a 2-column grid
- ✅ Each volume card shows volume number, perspective badge, open date, progress bar, and completion date
- ✅ Perspective badges show correct colors (blue for NARRATOR, purple for PROTAGONIST)
- ✅ Progress bars fill correctly based on progress percentage
- ✅ All dates are formatted correctly with locale

**Step 4: Verify no visual regressions**

Compare the rendered UI with the original implementation. They should look identical.

**Step 5: Test different scenarios**

1. User with multiple chapters and volumes
2. User with mix of NARRATOR and PROTAGONIST perspectives
3. Volumes with 0%, 50%, 100% progress
4. Volumes with and without completion dates

**Step 6: Commit verification**

```bash
git add apps/admin/src/pages/UserDetailImproved.tsx
git commit -m "test: verify component integration and visual rendering"
```

---

## Summary

**Total Implementation Steps:** 6 tasks
**Estimated Time:** 20-30 minutes
**Key Files Modified:**
- `apps/admin/src/components/ChapterReadingSection/` (new directory with 2 components)
- `apps/admin/src/pages/UserDetailImproved.tsx` (refactored to use components)

**Features Implemented:**
- ✅ ChapterHeader presentational component (protagonistName, title props)
- ✅ VolumeCard smart component (handles date formatting, progress display, perspective logic)
- ✅ Integration into UserDetailImproved.tsx
- ✅ Zero visual regressions - UI looks identical to original
- ✅ Type safety maintained throughout
- ✅ Memoized computations in VolumeCard for performance

**Browser Support:** All modern browsers (Chrome, Firefox, Safari, Edge)

**Accessibility:** Component structure maintains semantic HTML and accessibility attributes

---
