# Collapsible Sidebar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add collapsible sidebar to admin user detail page with toggle button, keyboard shortcut, icon-only collapsed state, and mobile floating button.

**Architecture:** Use React state (`sidebarCollapsed`) with localStorage persistence. Conditional rendering based on screen size (mobile < 768px uses floating button). Keyboard listener for Escape key. Smooth CSS transitions for expand/collapse animations. Icon-only sidebar shows on hover to expand.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, react-icons (MdChevronRight, MdChevronLeft), localStorage API

---

## Task 1: Add State Management & localStorage Persistence

**Files:**
- Modify: `apps/admin/src/pages/UserDetailImproved.tsx:129-180`

**Step 1: Initialize collapsed state from localStorage**

In the component, add this after the existing state declarations (around line 140):

```typescript
// Initialize from localStorage, default to false (expanded)
const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
  try {
    const stored = localStorage.getItem('userDetailSidebarCollapsed');
    return stored ? JSON.parse(stored) : false;
  } catch {
    return false;
  }
});
```

**Step 2: Add useEffect to persist state to localStorage**

Add this after the loadUser useEffect (around line 155):

```typescript
// Persist collapsed state to localStorage
useEffect(() => {
  try {
    localStorage.setItem('userDetailSidebarCollapsed', JSON.stringify(sidebarCollapsed));
  } catch {
    // Silently fail if localStorage unavailable
  }
}, [sidebarCollapsed]);
```

**Step 3: Commit**

```bash
cd .worktrees/feature/collapsible-sidebar
git add apps/admin/src/pages/UserDetailImproved.tsx
git commit -m "feat: add sidebar collapsed state with localStorage persistence"
```

---

## Task 2: Add Keyboard Shortcut (Escape to Toggle)

**Files:**
- Modify: `apps/admin/src/pages/UserDetailImproved.tsx:129-200`

**Step 1: Add keyboard event listener useEffect**

Add this after the localStorage persistence useEffect (around line 165):

```typescript
// Handle Escape key to toggle sidebar
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSidebarCollapsed(prev => !prev);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

**Step 2: Commit**

```bash
git add apps/admin/src/pages/UserDetailImproved.tsx
git commit -m "feat: add Escape key shortcut to toggle sidebar"
```

---

## Task 3: Add Collapse/Expand Toggle Button

**Files:**
- Modify: `apps/admin/src/pages/UserDetailImproved.tsx:1-50` (imports)
- Modify: `apps/admin/src/pages/UserDetailImproved.tsx:215-250` (left panel header)

**Step 1: Import icons**

Add to imports at the top of the file (around line 14, after existing MdIcon imports):

```typescript
import { MdChevronRight, MdChevronLeft } from "react-icons/md";
```

**Step 2: Add toggle button to left panel header**

Find the left panel div (currently starts around line 215 with `<div className="lg:col-span-1">`).

Inside the card, find the gradient header section and add a toggle button. Replace this section:

```typescript
{/* Gradient Header */}
<div className="h-24 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400"></div>
```

With:

```typescript
{/* Gradient Header with Toggle Button */}
<div className="relative h-24 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
  <button
    onClick={() => setSidebarCollapsed(prev => !prev)}
    className="absolute top-2 right-2 p-1 bg-white rounded-full hover:bg-gray-200 transition-colors"
    title="Toggle sidebar (Esc)">
    {sidebarCollapsed ? (
      <MdChevronLeft size={20} className="text-gray-700" />
    ) : (
      <MdChevronRight size={20} className="text-gray-700" />
    )}
  </button>
</div>
```

**Step 3: Commit**

```bash
git add apps/admin/src/pages/UserDetailImproved.tsx
git commit -m "feat: add toggle button for sidebar collapse/expand"
```

---

## Task 4: Implement Collapsed Icon-Only Sidebar

**Files:**
- Modify: `apps/admin/src/pages/UserDetailImproved.tsx:400-600` (conditional rendering and icon bar layout)

**Step 1: Wrap left panel in conditional rendering**

Find the entire left panel section (the `<div className="lg:col-span-1">` block, approximately lines 215-312).

Replace the outer wrapper with conditional rendering:

```typescript
{/* Left Sidebar - Desktop */}
{!sidebarCollapsed && (
  <div className="lg:col-span-1">
    {/* ... entire existing left panel code ... */}
  </div>
)}

{/* Collapsed Icon Bar - Desktop */}
{sidebarCollapsed && (
  <div className="hidden lg:flex lg:col-span-0 flex-col items-center gap-2 py-6 px-3 w-20 bg-white rounded-2xl shadow-sm sticky top-6">
    {/* Avatar Icon */}
    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => setSidebarCollapsed(false)}
      title="Expand sidebar">
      {user.email[0].toUpperCase()}
    </div>

    {/* Icon Buttons */}
    <button
      onClick={() => setSidebarCollapsed(false)}
      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      title="Expand">
      <MdChevronLeft size={18} className="text-gray-700" />
    </button>

    <button
      onClick={() => handleToggleStatus()}
      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      title="Éditer">
      <MdEdit size={18} className="text-gray-700" />
    </button>

    <button
      onClick={() => setShowAddEntitlementModal(true)}
      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      title="Ajouter accès">
      <MdBook size={18} className="text-gray-700" />
    </button>

    <button
      onClick={() => setShowAssignPromoModal(true)}
      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      title="Ajouter promo">
      <MdLocalOffer size={18} className="text-gray-700" />
    </button>

    <button
      onClick={() => navigate("/users")}
      className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-auto"
      title="Retour">
      <MdArrowBack size={18} className="text-gray-700" />
    </button>
  </div>
)}
```

**Step 2: Commit**

```bash
git add apps/admin/src/pages/UserDetailImproved.tsx
git commit -m "feat: implement collapsed icon-only sidebar for desktop"
```

---

## Task 5: Implement Mobile Floating Button

**Files:**
- Modify: `apps/admin/src/pages/UserDetailImproved.tsx` (add mobile modal state and floating button)

**Step 1: Add modal state for mobile**

Add this state declaration after the other useState hooks (around line 142):

```typescript
const [showMobileSidebar, setShowMobileSidebar] = useState(false);

// Auto-detect mobile screen size
const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

useEffect(() => {
  const handleResize = () => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (!mobile) setShowMobileSidebar(false); // Close modal on desktop
  };

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

**Step 2: Add floating button before the grid ends**

Add this floating button right before the closing `</div>` of the main container (around line 520, after the right content area):

```typescript
{/* Mobile Floating Button */}
{isMobile && (
  <>
    <button
      onClick={() => setShowMobileSidebar(true)}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xl font-bold shadow-lg hover:shadow-xl transition-shadow z-40"
      title="Ouvrir profil">
      {user.email[0].toUpperCase()}
    </button>

    {/* Mobile Sidebar Modal */}
    {showMobileSidebar && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden" onClick={() => setShowMobileSidebar(false)}>
        <div
          className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg overflow-y-auto"
          onClick={(e) => e.stopPropagation()}>
          {/* Close button */}
          <div className="flex justify-end p-4">
            <button
              onClick={() => setShowMobileSidebar(false)}
              className="p-1 hover:bg-gray-100 rounded-lg">
              <MdChevronLeft size={24} />
            </button>
          </div>

          {/* Sidebar content (reuse from full sidebar) */}
          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-white p-1 shadow-lg">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user.email[0].toUpperCase()}
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                {user.email.split("@")[0]}
              </h2>
              <p className="text-xs text-gray-500 mb-3">
                ID: {user.publicId.slice(0, 12)}
              </p>
            </div>

            {/* Status Badge */}
            <div className="mb-4 flex justify-center">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                {user.status}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                <MdSend size={16} />
                <span>Message</span>
              </button>
              <button
                onClick={() => {
                  handleToggleStatus();
                  setShowMobileSidebar(false);
                }}
                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                <MdEdit size={16} />
                <span>Éditer</span>
              </button>
              <button
                onClick={() => {
                  setShowAddEntitlementModal(true);
                  setShowMobileSidebar(false);
                }}
                className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                <MdBook size={16} />
                <span>+ Accès</span>
              </button>
              <button
                onClick={() => {
                  setShowAssignPromoModal(true);
                  setShowMobileSidebar(false);
                }}
                className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                <MdLocalOffer size={16} />
                <span>+ Promo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
)}
```

**Step 3: Commit**

```bash
git add apps/admin/src/pages/UserDetailImproved.tsx
git commit -m "feat: add mobile floating button with sidebar modal"
```

---

## Task 6: Update Main Grid Layout for Responsive Behavior

**Files:**
- Modify: `apps/admin/src/pages/UserDetailImproved.tsx:600-620` (main grid)

**Step 1: Update grid classes for responsive collapse**

Find the main grid layout (around line 600, starts with `<div className="grid grid-cols-...`).

Update the grid to handle collapsed state:

```typescript
<div className={`grid gap-6 transition-all duration-300 ${
  isMobile
    ? 'grid-cols-1'
    : sidebarCollapsed
      ? 'grid-cols-5 lg:grid-cols-5'
      : 'grid-cols-4 lg:grid-cols-4'
}`}>
```

Also update the main content area grid-col-span:

```typescript
<div className={`${
  isMobile
    ? 'col-span-1'
    : sidebarCollapsed
      ? 'col-span-4'
      : 'col-span-3'
}`}>
  {/* All the tab content goes here */}
</div>
```

**Step 2: Commit**

```bash
git add apps/admin/src/pages/UserDetailImproved.tsx
git commit -m "feat: update grid layout to adapt when sidebar collapses"
```

---

## Task 7: Manual Testing & Polish

**Files:**
- Test: `apps/admin/src/pages/UserDetailImproved.tsx` (manual testing only, no unit tests for UI state)

**Step 1: Test toggle button**

1. Open admin panel and navigate to a user detail page
2. Click the chevron button in top-right of left panel
3. Verify sidebar collapses to icon-only bar
4. Hover over icon bar - tooltip should show
5. Click expand button (chevron) to expand back

**Step 2: Test keyboard shortcut**

1. While on user detail page, press `Escape`
2. Verify sidebar toggles collapsed/expanded
3. Press `Escape` again to toggle back

**Step 3: Test localStorage persistence**

1. Collapse sidebar
2. Refresh the page
3. Verify sidebar remains collapsed
4. Expand sidebar
5. Refresh the page
6. Verify sidebar remains expanded

**Step 4: Test mobile behavior**

1. Resize browser to < 768px width (or use device emulation)
2. Verify left panel disappears
3. Verify floating button appears (bottom-right with avatar initial)
4. Click floating button
5. Verify modal slides in from left with sidebar content
6. Click close button or overlay to close
7. Resize back to desktop - verify modal closes automatically

**Step 5: Test responsive transitions**

1. Collapse sidebar on desktop
2. Slowly resize to mobile - verify smooth transition from icon bar to floating button
3. Resize back to desktop - verify smooth transition from floating button to full sidebar

**Step 6: Commit final polish**

```bash
git add apps/admin/src/pages/UserDetailImproved.tsx
git commit -m "feat: complete collapsible sidebar with all interactions tested"
```

---

## Summary

**Total Implementation Steps:** 6 tasks + manual testing
**Estimated Time:** 30-45 minutes
**Key Files Modified:**
- `apps/admin/src/pages/UserDetailImproved.tsx` (single file, ~150 lines added/modified)

**Features Implemented:**
- ✅ Collapsed state with localStorage persistence
- ✅ Keyboard shortcut (Escape) to toggle
- ✅ Toggle button with chevron icons
- ✅ Icon-only sidebar for desktop (collapsed state)
- ✅ Mobile floating button with modal
- ✅ Responsive grid layout adaptation
- ✅ Smooth transitions and animations

**Browser Support:** All modern browsers (Chrome, Firefox, Safari, Edge)

**Accessibility:** Buttons have title attributes, focus states supported by Tailwind

---
