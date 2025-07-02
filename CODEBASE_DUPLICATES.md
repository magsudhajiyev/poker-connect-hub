# Codebase Duplicates Analysis

This document tracks duplicate files and logic found in the codebase. Each section represents a category of duplication that needs to be addressed.

## Status Legend

- ⏳ **Pending** - Not yet addressed
- 🚧 **In Progress** - Currently being worked on
- ✅ **Completed** - Successfully merged/resolved
- ❌ **Skipped** - Decided not to merge (with reason)

---

## 1. UI Component Duplicates

### Feed Components ✅

**Status:** Completed  
**Date:** 2025-01-21  
**Branch:** `main` (worked directly on main)

Duplicated across 2 locations:

- `/app/feed/components/` (5 files)
- `/src/components/feed/` (5 files)

Files:

- FeedHeader.tsx
- FeedMainContent.tsx
- FeedPostCard.tsx
- PostComposer.tsx
- SamplePostCard.tsx

**Action:** Consolidate to single location, likely keep app/feed/components

**Completed Actions:**

- ✅ Updated imports in /app/feed/page.tsx to use @/components/feed
- ✅ Added 'use client' directives to all 5 components in src
- ✅ Updated FeedMainContent to use correct sidebar import
- ✅ Updated ProfileTopBar in src to match app version
- ✅ Deleted duplicate files in /app/feed/components/
- ✅ Verified build completes successfully

---

### Profile Components ✅

**Status:** Completed  
**Date:** 2025-01-21  
**Branch:** `main` (worked directly on main)

Duplicated across 2 locations:

- `/app/profile/components/` (4 files)
- `/src/components/profile/` (4 files)

Files:

- ProfileContent.tsx
- ProfileHeader.tsx
- ProfileNav.tsx
- ProfileStats.tsx

**Action:** Consolidate to single location, likely keep app/profile/components

**Completed Actions:**

- ✅ Kept components in /app/profile/components (already had 'use client' directives)
- ✅ Moved ProfileTopBar to /src/components/shared for shared usage
- ✅ Updated all imports to use new locations
- ✅ Fixed sidebar import in ProfileTopBar
- ✅ Deleted duplicate files in /src/components/profile/
- ✅ Verified build completes successfully

---

### ProfileTopBar (Triplicated) ✅

**Status:** Completed  
**Date:** 2025-01-21  
**Branch:** `main` (handled with Profile Components)

Triplicated across 3 locations:

- `/app/profile/components/ProfileTopBar.tsx`
- `/app/feed/components/ProfileTopBar.tsx` (already removed with Feed components)
- `/src/components/profile/ProfileTopBar.tsx`

**Note:** Each has slightly different implementations - different imports and styling

**Action:** Create single shared component with props for customization

**Completed Actions:**

- ✅ Moved ProfileTopBar to /src/components/shared/ProfileTopBar.tsx
- ✅ Updated all imports (FeedMainContent, profile page, share-hand page)
- ✅ Fixed sidebar import to use correct path
- ✅ Deleted all duplicate versions
- ✅ Verified component works across all pages

---

### HandView Components ✅

**Status:** Completed  
**Date:** 2025-01-21  
**Branch:** `main` (worked directly on main)

Duplicated across 2 locations:

- `/app/hand-view/components/` (5 files)
- `/src/components/hand-view/` (5 files)

Files:

- HandViewCard.tsx
- HandViewComments.tsx
- HandViewContent.tsx
- HandViewHeader.tsx
- MobileSidebar.tsx

**Action:** Consolidate to single location

**Completed Actions:**

- ✅ Kept components in /app/hand-view/components (already had 'use client' directives)
- ✅ Verified no external imports from src location
- ✅ Deleted duplicate files in /src/components/hand-view/
- ✅ Verified build completes successfully

---

## 2. Error Boundary Duplicates ⏳

**Status:** Pending  
**Branch:** `refactor/consolidate-error-boundaries`

Multiple error boundary implementations:

- `/src/components/ErrorBoundary.tsx`
- `/src/components/error-boundary.tsx`
- `/src/components/error-boundary/ErrorBoundary.tsx`
- `/src/components/error-boundary/ShareHandErrorBoundary.tsx`

**Action:** Keep one generic ErrorBoundary and one specialized ShareHandErrorBoundary if needed

---

## 3. ShareHand Provider Duplicates ⏳

**Status:** Pending  
**Branch:** `refactor/consolidate-sharehand-provider`

Two versions exist:

- `/app/share-hand/components/ShareHandProvider.tsx`
- `/app/share-hand/components/ShareHandProviderOptimized.tsx`

**Action:** Compare performance, keep optimized version if better, otherwise merge improvements

---

## 4. Toast/Use-Toast Duplicates ⏳

**Status:** Pending  
**Branch:** `refactor/consolidate-toast-hooks`

Two implementations:

- `/src/hooks/use-toast.ts` (full implementation)
- `/src/components/ui/use-toast.ts` (re-export wrapper)

**Action:** Remove wrapper, update all imports to use direct path

---

## 5. Poker Service Files ⏳

**Status:** Pending  
**Branch:** `refactor/consolidate-poker-services`

Multiple poker service implementations:

- `/backend/src/poker/poker.service.ts`
- `/lib/poker/poker-service.ts`
- `/src/lib/poker/poker-service.ts`
- `/src/services/poker.ts`

**Action:** Align frontend and backend service interfaces, create shared types

---

## 6. Interface/Type Definition Files ⏳

**Status:** Pending  
**Branch:** `refactor/consolidate-interfaces`

Multiple interface files:

- `/lib/poker/interfaces.ts`
- `/src/lib/poker/interfaces.ts`
- `/backend/src/poker/interfaces/poker.interfaces.ts`

Related type duplicates in:

- `/src/types/unified.ts`
- `/src/types/shareHand.ts`

**Common duplicated types:** Player, GameState, PokerAction, User, AuthResponse

**Action:** Create single source of truth for shared types, possibly in a shared package

---

## 7. Card Input Components ⏳

**Status:** Pending  
**Branch:** `refactor/consolidate-card-inputs`

Multiple card-related components:

- `/src/components/CardInput.tsx`
- `/src/components/CardSelector.tsx`
- `/src/components/CardSelectionModal.tsx`
- `/src/components/card-input/` (folder with related components)

**Action:** Review functionality overlap and consolidate if appropriate

---

## 8. Position Utilities ⏳

**Status:** Pending  
**Branch:** `refactor/consolidate-position-utils`

Two position-related utilities:

- `/src/utils/positionUtils.ts`
- `/src/utils/positionMapping.ts`

**Action:** Merge into single position utility file

---

## 9. API Routes Pattern ⏳

**Status:** Pending  
**Note:** This follows Next.js App Router pattern - likely not duplicates but worth reviewing

13 route.ts files in `/app/api/` directory

**Action:** Review for any actual logic duplication between routes

---

## Completed Refactors

### MobileSidebarContent ✅

**Status:** Completed  
**Branch:** `main` (merged)  
**Date:** 2025-01-21

Consolidated 5 duplicate MobileSidebarContent files into single shared component:

- Removed: `/app/feed/components/MobileSidebarContent.tsx`
- Removed: `/app/profile/components/MobileSidebarContent.tsx`
- Removed: `/app/share-hand/components/MobileSidebarContent.tsx`
- Removed: `/app/settings/components/MobileSidebarContent.tsx`
- Kept: `/src/components/MobileSidebarContent.tsx` (unified version)

---

## Priority Order Recommendation

1. **High Priority** (Breaking/Confusing):
   - Error Boundaries (multiple files with same name)
   - Toast hooks (import confusion)
   - Type definitions (inconsistent types across codebase)

2. **Medium Priority** (Maintenance burden):
   - UI Components (Feed, Profile, HandView)
   - Poker Services
   - ShareHand Providers

3. **Low Priority** (Nice to have):
   - Position utilities
   - Card input components
   - API routes review

---

## Notes for Implementation

When addressing each duplicate:

1. Create a new branch as specified
2. Compare implementations for differences
3. Preserve all unique functionality
4. Update all imports
5. Test thoroughly before merging
6. Update this document with completion status

For each refactor, consider:

- Are there feature differences between duplicates?
- Which location makes more sense architecturally?
- Will this break any existing functionality?
- Are there any performance implications?
