# Design Review Results: Cher Journal — Full App

**Review Date**: 2026-02-26  
**Routes Reviewed**: `/login`, `/register`, `/` (HomeNew), `/catalogue`, `/chapters/:id`, `/library`, `/profile`, `/account`  
**Focus Areas**: Visual Design · UX/Usability · Responsive/Mobile · Accessibility · Micro-interactions · Consistency · Performance

---

## Summary

Cher Journal has a strong and evocative luxury aesthetic with a warm boudoir/gold palette and beautiful typographic choices. However, the codebase shows significant **theme drift across pages** (purple on Profile, gray-950 on Login vs the warm boudoir on catalogue/chapter), **dead code accumulation** (3 ToC versions, 2 layout files, 2 home pages), **critical mobile interaction failures** on the Chapter ToC (hover-only UX), and **numerous accessibility gaps**. Many of these issues compound into a broken experience on mobile and for keyboard/screen reader users.

---

## Issues

| # | Issue | Criticality | Category | Location |
|---|-------|-------------|----------|----------|
| 1 | `ChapterTableOfContents_V3` book rows are `div[onClick]` instead of `<button>`. Breaks keyboard focus, Tab navigation, and screen reader interactions | 🔴 Critical | Accessibility | `apps/web/src/components/chapter/ChapterTableOfContents_V3.tsx:161-258` |
| 2 | No mobile navigation menu. On small screens, LayoutNew's icon-only nav has no hamburger/drawer fallback — users can't navigate | 🔴 Critical | Responsive/Mobile | `apps/web/src/components/common/LayoutNew.tsx:36-59` |
| 3 | `VolumeActionButtons` in ToC V3 only appear on `hover` — completely inaccessible on touch devices. Tapping a book triggers `onOpenVolume` immediately, bypassing the action panel entirely | 🔴 Critical | UX/Usability | `apps/web/src/components/chapter/ChapterTableOfContents_V3.tsx:87-88, 262-323` |
| 4 | Malformed CSS class in Login background: `to-g[#1a0b10e6]` is invalid Tailwind syntax (note the `g` prefix). The gradient silently breaks | 🟠 High | Visual Design | `apps/web/src/pages/Auth/Login.tsx:29` |
| 5 | Library link is commented out in the main navigation. Users cannot access their library without going through `/account` — a critical feature is hidden | 🟠 High | UX/Usability | `apps/web/src/components/common/LayoutNew.tsx:90-97` |
| 6 | Search input in the header has no state, no event handler, and no logic — completely non-functional. Creates false affordance | 🟠 High | UX/Usability | `apps/web/src/components/common/LayoutNew.tsx:67-76` |
| 7 | `Profile.tsx` uses an off-brand purple/blue gradient (`from-purple-900/50 via-blue-900/30`) and pink text (`text-pink-200/70`) — completely inconsistent with the warm boudoir/gold design system | 🟠 High | Visual Design | `apps/web/src/pages/Profile.tsx:17-19, 42, 67` |
| 8 | `animate-pulse` on the selection checkmark in `MobilePerspectiveSelectorV2` triggers constantly while selected. Violates WCAG 2.3.3 (animations should be stoppable/avoidable) | 🟠 High | Accessibility | `apps/web/src/components/MobilePerspectiveSelector_V2.tsx:139` |
| 9 | Perpetual `last:animate-[wiggle_1s_ease-in-out_infinite]` on the last locked book. This constantly distracting animation violates WCAG 2.2.2 (Pause, Stop, Hide) | 🟠 High | Micro-interactions | `apps/web/src/components/chapter/ChapterTableOfContents_V3.tsx:167` |
| 10 | No `@media (prefers-reduced-motion)` override for any keyframe animation. Affects users with vestibular disorders who have the OS-level reduced motion setting enabled | 🟠 High | Accessibility | `apps/web/src/index.css:6-13, 421-433, 567-574, 600-634` |
| 11 | `.bg-primary` is defined twice in `index.css` (lines 115-117 and 233-235) with the same value. Duplicate CSS rules create confusion and maintenance risk | 🟡 Medium | Consistency | `apps/web/src/index.css:115-117, 233-235` |
| 12 | `.font-ornate` is defined twice with different values: first as `Playfair Display` (inside `@layer base`) then overridden as `Cinzel` (outside the layer). The cascade makes the value unpredictable | 🟡 Medium | Consistency | `apps/web/src/index.css:355-357, 359-361` |
| 13 | `Library.tsx` uses 20+ hardcoded hex literals (`#c5a059`, `#1a0f14`, `#2d1620`, `#ee2b5b`) instead of the design tokens defined in `tailwind.config.js`. Breaks theming and dark mode | 🟡 Medium | Consistency | `apps/web/src/pages/Library.tsx:62, 85, 120, 157, 213, 291, etc.` |
| 14 | `Account.tsx` uses hardcoded `#c5a059` and `#2d1620` instead of `gold` and `background-dark` tokens | 🟡 Medium | Consistency | `apps/web/src/pages/Account.tsx:180, 197, 203, etc.` |
| 15 | `font-display` is used extensively across many components but is **not defined** in `tailwind.config.js` (only `font-serif`, `font-script`, `font-sans` are defined). It silently falls back to system font | 🟡 Medium | Visual Design | `apps/web/src/pages/Library.tsx:74, 79; apps/web/src/pages/Account.tsx:183, etc.` |
| 16 | Filter buttons in `Catalogue.tsx` have no `aria-pressed` attribute. Screen readers cannot determine which filters are active | 🟡 Medium | Accessibility | `apps/web/src/pages/Catalogue.tsx:394-414, 481-503` |
| 17 | Search input in the header has no `aria-label` — screen readers will announce it as an unlabelled text field | 🟡 Medium | Accessibility | `apps/web/src/components/common/LayoutNew.tsx:71-76` |
| 18 | No `role="alert"` or `aria-live` on the error block in `Library.tsx`. Screen readers won't announce errors when they appear dynamically | 🟡 Medium | Accessibility | `apps/web/src/pages/Library.tsx:106-130` |
| 19 | "Notre sélection" button in the catalogue filter bar has no text label (only `p-2` padding, no visible text or icon), making it unidentifiable for users | 🟡 Medium | UX/Usability | `apps/web/src/pages/Catalogue.tsx:406-413` |
| 20 | "Forgot Password?" link points to `href="#"` — not yet implemented. Should show a "Coming soon" toast or be hidden until implemented | 🟡 Medium | UX/Usability | `apps/web/src/pages/Auth/Login.tsx:126` |
| 21 | No password visibility toggle on Login and Register pages — standard UX pattern for password fields | 🟡 Medium | UX/Usability | `apps/web/src/pages/Auth/Login.tsx:97-109; apps/web/src/pages/Auth/Register.tsx` |
| 22 | Profile page uses emoji `👤` as avatar placeholder instead of a proper icon or image component. Emojis render differently across OS/browsers | 🟡 Medium | Visual Design | `apps/web/src/pages/Profile.tsx:22` |
| 23 | Two conflicting gold tokens: `text-gold` maps to `rgb(197 160 89)` while `text-soft-gold` maps to `rgb(212 175 55)`. No design docs or usage guidelines distinguish them | 🟡 Medium | Consistency | `apps/web/src/index.css:58-63` |
| 24 | Sort button labels hidden on mobile (`hidden md:flex`). Mobile users see icon-only buttons with no tooltip or accessible label for sort options | ⚪ Low | Responsive/Mobile | `apps/web/src/pages/Catalogue.tsx:494` |
| 25 | Nav links in `LayoutNew.tsx` are icon-only on desktop with only `title` tooltip — fine for power users but poor discoverability for new users | ⚪ Low | UX/Usability | `apps/web/src/components/common/LayoutNew.tsx:38-58` |
| 26 | `index.css` manually re-defines Tailwind utilities (`.transition-all`, `.transition-colors`) with full property lists. These are already in Tailwind and the overrides can create subtle differences | ⚪ Low | Performance | `apps/web/src/index.css:186-217` |
| 27 | Page initial bundle is **6.3MB** (observed: `pageSize: 6644785`). Likely caused by Google Fonts loading 5+ font families simultaneously and lack of font-display optimization | ⚪ Low | Performance | `apps/web/src/index.css:1` |
| 28 | 3 versions of `ChapterTableOfContents` (V1, V2, V3) and 3 versions of `MobilePerspectiveSelector` remain in the codebase. Unused files inflate the bundle and confuse maintainers | ⚪ Low | Consistency | `apps/web/src/components/chapter/`, `apps/web/src/components/` |
| 29 | `Home.tsx` (imported nowhere, uses a purple/dark theme) and `HomeNew.tsx` (active) coexist. Same for `Layout.tsx` vs `LayoutNew.tsx`. Dead files should be deleted | ⚪ Low | Consistency | `apps/web/src/pages/Home.tsx`, `apps/web/src/components/common/Layout.tsx` |
| 30 | No `<link rel="icon">` or `favicon.ico` — browser logs a 404 for favicon on every page load | ⚪ Low | Performance | `apps/web/index.html` |
| 31 | Button border-radius is inconsistent across pages: `rounded-full` (chapter CTA), `rounded-lg` (login form), `rounded-2xl` (perspective selector), `rounded-md` (account menu). No design system rule governs this | ⚪ Low | Visual Design | App-wide |
| 32 | No skip-to-main-content link for keyboard-only users — standard accessibility affordance | ⚪ Low | Accessibility | `apps/web/src/components/common/LayoutNew.tsx:1` |

---

## Criticality Legend
- 🔴 **Critical**: Breaks functionality or violates accessibility standards  
- 🟠 **High**: Significantly impacts user experience or design quality  
- 🟡 **Medium**: Noticeable issue that should be addressed  
- ⚪ **Low**: Nice-to-have improvement  

---

## Next Steps

### Immediate Priority (Critical)
1. **Fix #1**: Replace `div[onClick]` with `<button>` in `ChapterTableOfContents_V3`
2. **Fix #2**: Add a mobile hamburger/drawer navigation to `LayoutNew`
3. **Fix #3**: Replace hover-only action panel in ToC V3 with a tap-friendly pattern (e.g., tap book → expand inline actions)
4. **Fix #4**: Correct the malformed CSS class on Login page

### Short-term (High)
5. **Fix #5**: Restore the Library link in the main nav
6. **Fix #6**: Either implement search or remove the input to avoid false affordance
7. **Fix #7**: Retheme `Profile.tsx` to use the boudoir/gold design system
8. **Fix #8 & #9**: Replace perpetual animations with one-time or user-triggered animations
9. **Fix #10**: Add `@media (prefers-reduced-motion: reduce)` to all keyframe animations in `index.css`

### Medium-term (Cleanup)
10. **Fix #11-#14**: Standardize all color usage to design tokens; remove hardcoded hex values
11. **Fix #15**: Add `font-display` to `tailwind.config.js` or replace with `font-serif`
12. **Fix #16-#18**: Add ARIA attributes to interactive elements
13. **Fix #28-#29**: Delete unused component versions and dead pages/layouts

### Low-hanging (Nice-to-have)
14. **Fix #20-#21**: Implement forgot password flow; add password visibility toggle
15. **Fix #27**: Add `font-display: swap` to Google Fonts `@import` and consider self-hosting fonts
16. **Fix #30**: Add a favicon
