#!/usr/bin/env node
/**
 * Context Menu Coverage Agent
 *
 * Scans admin pages to verify that all list/grid sections have context menus
 * with appropriate actions (background menu, item menu, bulk actions).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ContextMenuIssue {
  file: string;
  section: string;
  missing: string[];
  severity: "critical" | "high" | "medium" | "low";
  recommendation: string;
}

interface ContextMenuReport {
  timestamp: string;
  totalPages: number;
  pagesWithIssues: number;
  issues: ContextMenuIssue[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

const ADMIN_PAGES_DIR = path.join(__dirname, "../apps/admin/src/pages");
const OUTPUT_FILE = path.join(__dirname, "../docs/context-menu-coverage.md");

// Patterns to identify list/grid sections
const SECTION_PATTERNS = {
  tableGrid: /TableGrid/i,
  dataList: /\.map\((.*?)\s*=>\s*<div/,
  chapterView: /ChapterView/i,
  grid: /className=["'].*grid.*["']/,
};

// Required context menu features
const REQUIRED_FEATURES = {
  backgroundContextMenu: "onBackgroundContextMenu",
  itemContextMenu: "onContextMenu|onRowContextMenu|onChapterContextMenu",
  bulkActions: "selectedIds|selectedChapterIds|selectedUserIds",
  contextMenuComponent: "ContextMenu|useContextMenu",
  floatingActionButton: "FloatingActionButton",
};

function scanFile(filePath: string): ContextMenuIssue[] {
  const issues: ContextMenuIssue[] = [];
  const content = fs.readFileSync(filePath, "utf-8");
  const fileName = path.basename(filePath);

  // Skip non-list pages (Login, Register, simple forms, etc.)
  const skipPatterns = [
    /Login\.tsx$/,
    /Register\.tsx$/,
    /Settings\.tsx$/,
    /Form\.tsx$/, // Skip form pages (VolumeForm, ChapterForm, etc.)
  ];

  if (skipPatterns.some((pattern) => pattern.test(fileName))) {
    return [];
  }

  // Check if file contains list/grid sections
  const hasListSection = Object.entries(SECTION_PATTERNS).some(([_, pattern]) =>
    pattern.test(content)
  );

  // Check if it's a detail/form page with nested list (e.g., ChapterDetail with volumes list)
  const isDetailPageWithList = /Detail\.tsx$/.test(fileName) && hasListSection;

  // Skip if it's a pure form page without lists
  if (/Form\.tsx$/.test(fileName) && !hasListSection) {
    return [];
  }

  // Skip if no list section and not a detail page with list
  if (!hasListSection && !isDetailPageWithList) {
    return [];
  }

  // Dashboard is a special case - it may have widgets but not actionable lists
  if (fileName === "Dashboard.tsx") {
    // Check if dashboard has actionable tables (not just stats)
    const hasActionableTable = /onClick|onEdit|onDelete|TableGrid/i.test(
      content
    );
    if (!hasActionableTable) {
      return [];
    }
  }

  const sectionName = fileName.replace(".tsx", "");
  const missing: string[] = [];

  // Check for background context menu
  if (!new RegExp(REQUIRED_FEATURES.backgroundContextMenu).test(content)) {
    missing.push("Background context menu (global actions)");
  }

  // Check for item context menu
  if (!new RegExp(REQUIRED_FEATURES.itemContextMenu).test(content)) {
    missing.push("Item context menu (per-item actions)");
  }

  // Check for bulk actions support
  if (!new RegExp(REQUIRED_FEATURES.bulkActions).test(content)) {
    missing.push("Bulk actions support (selection)");
  }

  // Check for ContextMenu component usage
  if (!new RegExp(REQUIRED_FEATURES.contextMenuComponent).test(content)) {
    missing.push("ContextMenu component integration");
  }

  // Check for FloatingActionButton
  if (!new RegExp(REQUIRED_FEATURES.floatingActionButton).test(content)) {
    missing.push("FloatingActionButton (FAB) for quick actions");
  }

  if (missing.length > 0) {
    issues.push({
      file: fileName,
      section: sectionName,
      missing,
      severity:
        missing.length >= 3 ? "high" : missing.length >= 2 ? "medium" : "low",
      recommendation: generateRecommendation(missing),
    });
  }

  return issues;
}

function generateRecommendation(missing: string[]): string {
  const recommendations: string[] = [];

  if (missing.some((m) => m.includes("Background context menu"))) {
    recommendations.push(
      "Add onBackgroundContextMenu handler for global actions (create, sort, filter, view mode)"
    );
  }

  if (missing.some((m) => m.includes("Item context menu"))) {
    recommendations.push(
      "Add onContextMenu/onRowContextMenu for per-item actions (view, edit, delete, status change)"
    );
  }

  if (missing.some((m) => m.includes("Bulk actions"))) {
    recommendations.push(
      "Add selection state (selectedIds) and bulk edit functionality"
    );
  }

  if (missing.some((m) => m.includes("ContextMenu component"))) {
    recommendations.push(
      "Import and use ContextMenu component with useContextMenu hook"
    );
  }

  if (missing.some((m) => m.includes("FloatingActionButton"))) {
    recommendations.push(
      "Add FloatingActionButton with primary actions (create, filter, bulk edit, etc.)"
    );
  }

  return recommendations.join(" | ");
}

function scanAllPages(): ContextMenuIssue[] {
  const allIssues: ContextMenuIssue[] = [];

  if (!fs.existsSync(ADMIN_PAGES_DIR)) {
    console.error(`Directory not found: ${ADMIN_PAGES_DIR}`);
    return allIssues;
  }

  const files = fs
    .readdirSync(ADMIN_PAGES_DIR)
    .filter((f) => f.endsWith(".tsx"));

  for (const file of files) {
    const filePath = path.join(ADMIN_PAGES_DIR, file);
    const issues = scanFile(filePath);
    allIssues.push(...issues);
  }

  return allIssues;
}

function generateReport(issues: ContextMenuIssue[]): ContextMenuReport {
  const summary = {
    critical: issues.filter((i) => i.severity === "critical").length,
    high: issues.filter((i) => i.severity === "high").length,
    medium: issues.filter((i) => i.severity === "medium").length,
    low: issues.filter((i) => i.severity === "low").length,
  };

  const pagesWithIssues = new Set(issues.map((i) => i.file)).size;

  return {
    timestamp: new Date().toISOString(),
    totalPages: fs
      .readdirSync(ADMIN_PAGES_DIR)
      .filter((f) => f.endsWith(".tsx")).length,
    pagesWithIssues,
    issues,
    summary,
  };
}

function writeMarkdownReport(report: ContextMenuReport): void {
  const lines: string[] = [];

  lines.push("# Context Menu Coverage Report");
  lines.push("");
  lines.push(`**Generated:** ${new Date(report.timestamp).toLocaleString()}`);
  lines.push("");

  // Summary
  lines.push("## Summary");
  lines.push("");
  lines.push(`- **Total Pages Scanned:** ${report.totalPages}`);
  lines.push(`- **Pages with Issues:** ${report.pagesWithIssues}`);
  lines.push(
    `- **Coverage:** ${Math.round(((report.totalPages - report.pagesWithIssues) / report.totalPages) * 100)}%`
  );
  lines.push("");
  lines.push("### Issues by Severity");
  lines.push("");
  lines.push(`- 🔴 **Critical:** ${report.summary.critical}`);
  lines.push(`- 🟠 **High:** ${report.summary.high}`);
  lines.push(`- 🟡 **Medium:** ${report.summary.medium}`);
  lines.push(`- 🟢 **Low:** ${report.summary.low}`);
  lines.push("");

  // Details
  if (report.issues.length > 0) {
    lines.push("## Issues Found");
    lines.push("");

    const groupedIssues = {
      critical: report.issues.filter((i) => i.severity === "critical"),
      high: report.issues.filter((i) => i.severity === "high"),
      medium: report.issues.filter((i) => i.severity === "medium"),
      low: report.issues.filter((i) => i.severity === "low"),
    };

    for (const [severity, severityIssues] of Object.entries(groupedIssues)) {
      if (severityIssues.length > 0) {
        const emoji =
          severity === "critical"
            ? "🔴"
            : severity === "high"
              ? "🟠"
              : severity === "medium"
                ? "🟡"
                : "🟢";
        lines.push(`### ${emoji} ${severity.toUpperCase()} Priority`);
        lines.push("");

        for (const issue of severityIssues) {
          lines.push(`#### ${issue.section} (${issue.file})`);
          lines.push("");
          lines.push("**Missing Features:**");
          for (const missing of issue.missing) {
            lines.push(`- ${missing}`);
          }
          lines.push("");
          lines.push(`**Recommendation:** ${issue.recommendation}`);
          lines.push("");
        }
      }
    }
  } else {
    lines.push("## ✅ All Pages Have Context Menus!");
    lines.push("");
    lines.push(
      "All admin pages with list/grid sections have proper context menu implementation."
    );
    lines.push("");
  }

  // Best Practices
  lines.push("## Best Practices");
  lines.push("");
  lines.push("### Context Menu Implementation Checklist");
  lines.push("");
  lines.push("For every admin page with a list/grid section:");
  lines.push("");
  lines.push("1. **Background Context Menu** (Global Actions)");
  lines.push('   - Add "Create new item" action');
  lines.push("   - Add sort options (A-Z, date, etc.)");
  lines.push("   - Add view mode toggles (grid, list, calendar)");
  lines.push("   - Add filter options");
  lines.push('   - Add "Select all" / "Deselect all"');
  lines.push('   - If items selected: Add "Bulk edit (N)" option');
  lines.push("");
  lines.push("2. **Item Context Menu** (Per-Item Actions)");
  lines.push("   - View details");
  lines.push("   - Edit");
  lines.push("   - Duplicate (if applicable)");
  lines.push("   - Status changes (publish, draft, archive)");
  lines.push("   - Delete (danger action)");
  lines.push("");
  lines.push("3. **Selection & Bulk Actions**");
  lines.push("   - Checkbox selection per item");
  lines.push('   - "Select all" button in toolbar');
  lines.push("   - Bulk edit modal for selected items");
  lines.push("   - Persistent selection state");
  lines.push("");
  lines.push("4. **Visual Indicators**");
  lines.push("   - Highlight selected options in menus (`selected: true`)");
  lines.push("   - Show current sort/filter/view mode");
  lines.push("   - Display selection count");
  lines.push("");
  lines.push("5. **Floating Action Button (FAB)**");
  lines.push("   - Fixed position bottom-right");
  lines.push("   - Primary action: Create new item");
  lines.push("   - Secondary actions: Filters, bulk edit, select all");
  lines.push("   - Show badge count for selections");
  lines.push("   - Accessible from anywhere in the page");
  lines.push("");

  // Example Implementation
  lines.push("## Example Implementation");
  lines.push("");
  lines.push("```typescript");
  lines.push("// Import context menu hook");
  lines.push('import { useContextMenu } from "../hooks/useContextMenu";');
  lines.push('import ContextMenu from "../components/ContextMenu";');
  lines.push("");
  lines.push("// Setup context menu");
  lines.push(
    "const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();"
  );
  lines.push("");
  lines.push("// Background context menu (global actions)");
  lines.push("const handleBackgroundContextMenu = (e: React.MouseEvent) => {");
  lines.push("  e.preventDefault();");
  lines.push("  openContextMenu(e, [");
  lines.push("    {");
  lines.push('      title: "Actions",');
  lines.push("      items: [");
  lines.push(
    '        { label: "Create", icon: <MdAdd />, onClick: openCreateModal },'
  );
  lines.push(
    '        { label: "Select All", icon: <MdCheckBox />, onClick: toggleSelectAll },'
  );
  lines.push("      ],");
  lines.push("    },");
  lines.push("    {");
  lines.push('      title: "View",');
  lines.push("      items: [");
  lines.push(
    '        { label: "Grid", icon: <MdViewModule />, onClick: () => setView("grid"), selected: view === "grid" },'
  );
  lines.push(
    '        { label: "List", icon: <MdViewList />, onClick: () => setView("list"), selected: view === "list" },'
  );
  lines.push("      ],");
  lines.push("    },");
  lines.push("  ]);");
  lines.push("};");
  lines.push("");
  lines.push("// Item context menu");
  lines.push(
    "const handleItemContextMenu = (e: React.MouseEvent, item: Item) => {"
  );
  lines.push("  openContextMenu(e, [");
  lines.push("    {");
  lines.push('      title: "Actions",');
  lines.push("      items: [");
  lines.push(
    '        { label: "View", icon: <MdVisibility />, onClick: () => viewItem(item) },'
  );
  lines.push(
    '        { label: "Edit", icon: <MdEdit />, onClick: () => editItem(item) },'
  );
  lines.push(
    '        { label: "Delete", icon: <MdDelete />, onClick: () => deleteItem(item), danger: true },'
  );
  lines.push("      ],");
  lines.push("    },");
  lines.push("  ]);");
  lines.push("};");
  lines.push("```");
  lines.push("");

  // FAB Example
  lines.push("## FloatingActionButton Example");
  lines.push("");
  lines.push("```typescript");
  lines.push(
    'import FloatingActionButton from "../components/FloatingActionButton";'
  );
  lines.push('import { MdAdd, MdEdit, MdCheckBox } from "react-icons/md";');
  lines.push("");
  lines.push("<FloatingActionButton");
  lines.push("  sections={[");
  lines.push("    {");
  lines.push('      title: "Actions principales",');
  lines.push("      actions: [");
  lines.push("        {");
  lines.push('          label: "Créer",');
  lines.push("          icon: <MdAdd />,");
  lines.push("          onClick: openCreateModal,");
  lines.push('          variant: "primary",');
  lines.push("        },");
  lines.push("        ...(selectedIds.size > 0 ? [{");
  lines.push('          label: "Édition en lot",');
  lines.push("          icon: <MdEdit />,");
  lines.push("          onClick: handleBulkEdit,");
  lines.push('          variant: "secondary" as const,');
  lines.push("          badge: selectedIds.size,");
  lines.push("        }] : []),");
  lines.push("      ],");
  lines.push("    },");
  lines.push("  ]}");
  lines.push("/>");
  lines.push("```");
  lines.push("");

  // Write to file
  fs.writeFileSync(OUTPUT_FILE, lines.join("\n"));
  console.log(`✅ Report written to: ${OUTPUT_FILE}`);
}

// Main execution
console.log("🔍 Scanning admin pages for context menu coverage...\n");

const issues = scanAllPages();
const report = generateReport(issues);

console.log("📊 Scan Results:");
console.log(`   Total pages: ${report.totalPages}`);
console.log(`   Pages with issues: ${report.pagesWithIssues}`);
console.log(
  `   Coverage: ${Math.round(((report.totalPages - report.pagesWithIssues) / report.totalPages) * 100)}%`
);
console.log("");
console.log("📝 Issues by severity:");
console.log(`   🔴 Critical: ${report.summary.critical}`);
console.log(`   🟠 High: ${report.summary.high}`);
console.log(`   🟡 Medium: ${report.summary.medium}`);
console.log(`   🟢 Low: ${report.summary.low}`);
console.log("");

writeMarkdownReport(report);

process.exit(report.summary.critical > 0 || report.summary.high > 0 ? 1 : 0);
