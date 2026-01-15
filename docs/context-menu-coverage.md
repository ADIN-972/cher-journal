# Context Menu Coverage Report

**Generated:** 12/01/2026 09:40:20

## Summary

- **Total Pages Scanned:** 9
- **Pages with Issues:** 1
- **Coverage:** 89%

### Issues by Severity

- 🔴 **Critical:** 0
- 🟠 **High:** 1
- 🟡 **Medium:** 0
- 🟢 **Low:** 0

## Issues Found

### 🟠 HIGH Priority

#### Orders (Orders.tsx)

**Missing Features:**
- Background context menu (global actions)
- Item context menu (per-item actions)
- Bulk actions support (selection)
- ContextMenu component integration

**Recommendation:** Add onBackgroundContextMenu handler for global actions (create, sort, filter, view mode) | Add onContextMenu/onRowContextMenu for per-item actions (view, edit, delete, status change) | Add selection state (selectedIds) and bulk edit functionality | Import and use ContextMenu component with useContextMenu hook

## Best Practices

### Context Menu Implementation Checklist

For every admin page with a list/grid section:

1. **Background Context Menu** (Global Actions)
   - Add "Create new item" action
   - Add sort options (A-Z, date, etc.)
   - Add view mode toggles (grid, list, calendar)
   - Add filter options
   - Add "Select all" / "Deselect all"
   - If items selected: Add "Bulk edit (N)" option

2. **Item Context Menu** (Per-Item Actions)
   - View details
   - Edit
   - Duplicate (if applicable)
   - Status changes (publish, draft, archive)
   - Delete (danger action)

3. **Selection & Bulk Actions**
   - Checkbox selection per item
   - "Select all" button in toolbar
   - Bulk edit modal for selected items
   - Persistent selection state

4. **Visual Indicators**
   - Highlight selected options in menus (`selected: true`)
   - Show current sort/filter/view mode
   - Display selection count

5. **Floating Action Button (FAB)**
   - Fixed position bottom-right
   - Primary action: Create new item
   - Secondary actions: Filters, bulk edit, select all
   - Show badge count for selections
   - Accessible from anywhere in the page

## Example Implementation

```typescript
// Import context menu hook
import { useContextMenu } from "../hooks/useContextMenu";
import ContextMenu from "../components/ContextMenu";

// Setup context menu
const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();

// Background context menu (global actions)
const handleBackgroundContextMenu = (e: React.MouseEvent) => {
  e.preventDefault();
  openContextMenu(e, [
    {
      title: "Actions",
      items: [
        { label: "Create", icon: <MdAdd />, onClick: openCreateModal },
        { label: "Select All", icon: <MdCheckBox />, onClick: toggleSelectAll },
      ],
    },
    {
      title: "View",
      items: [
        { label: "Grid", icon: <MdViewModule />, onClick: () => setView("grid"), selected: view === "grid" },
        { label: "List", icon: <MdViewList />, onClick: () => setView("list"), selected: view === "list" },
      ],
    },
  ]);
};

// Item context menu
const handleItemContextMenu = (e: React.MouseEvent, item: Item) => {
  openContextMenu(e, [
    {
      title: "Actions",
      items: [
        { label: "View", icon: <MdVisibility />, onClick: () => viewItem(item) },
        { label: "Edit", icon: <MdEdit />, onClick: () => editItem(item) },
        { label: "Delete", icon: <MdDelete />, onClick: () => deleteItem(item), danger: true },
      ],
    },
  ]);
};
```

## FloatingActionButton Example

```typescript
import FloatingActionButton from "../components/FloatingActionButton";
import { MdAdd, MdEdit, MdCheckBox } from "react-icons/md";

<FloatingActionButton
  sections={[
    {
      title: "Actions principales",
      actions: [
        {
          label: "Créer",
          icon: <MdAdd />,
          onClick: openCreateModal,
          variant: "primary",
        },
        ...(selectedIds.size > 0 ? [{
          label: "Édition en lot",
          icon: <MdEdit />,
          onClick: handleBulkEdit,
          variant: "secondary" as const,
          badge: selectedIds.size,
        }] : []),
      ],
    },
  ]}
/>
```
