import React, { useEffect, useMemo, useRef, useState } from "react";
import TableGrid, { TableAction, TableColumn } from "./TableGrid";
import { MdViewColumn } from "react-icons/md";
import SegmentedToggle from "./SegmentedToggle";

type VisibleColumnsState = Record<string, boolean>;

export interface SmartTableColumn<T> extends TableColumn<T> {
  id: string; // unique id for persistence
  defaultVisible?: boolean;
}

interface SmartTableGridProps<T> {
  listName: string; // used as session storage key
  data: T[];
  columns: SmartTableColumn<T>[];
  actions?: TableAction<T>[];
  /**
   * Force affichage des cases à cocher (par ex. si bulk actions).
   * Si non fourni, sera activé automatiquement si des handlers de sélection sont présents.
   */
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelection?: (id: string) => void;
  onToggleSelectAll?: () => void;
  getItemId: (item: T) => string;
  emptyMessage?: string;
  loading?: boolean;
  onRowContextMenu?: (e: React.MouseEvent, item: T) => void;
  onBackgroundContextMenu?: (e: React.MouseEvent) => void;
  /** Optional segmented toggle to display in the toolbar (e.g., view modes) */
  toggleConfig?: {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label?: string; icon?: React.ReactNode }[];
    ariaLabel?: string;
  };
  /** Optional field name to check for active/inactive status. If false, row gets "dashed bg-gray-200" classes */
  /**
   * Optional field name to check for active/inactive status. If false, row gets "dashed bg-gray-200" classes
   */
  isActiveField?: keyof T;
  /**
   * Optional override: if provided, called for each row to determine if it's active.
   * Takes precedence over isActiveField.
   */
}

/**
 * SmartTableGrid wraps TableGrid and adds:
 * - Column visibility toggle with persistence in sessionStorage
 * - Context menu/dedicated button to pick columns
 */
export function SmartTableGrid<T>({
  listName,
  data,
  columns,
  actions,
  selectable,
  selectedIds,
  onToggleSelection,
  onToggleSelectAll,
  getItemId,
  emptyMessage,
  loading,
  onRowContextMenu,
  onBackgroundContextMenu,
  toggleConfig,
  isActiveField,
}: SmartTableGridProps<T>) {
  const storageKey = `table-columns-${listName}`;
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumnsState>({});
  const [hydrated, setHydrated] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load persisted visibility (or defaults) before we allow persistence
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setVisibleColumns(JSON.parse(stored));
        setHydrated(true);
        return;
      } catch (err) {
        console.warn("Failed to parse column visibility, resetting", err);
      }
    }
    const initial: VisibleColumnsState = {};
    columns.forEach((col) => {
      initial[col.id] = col.defaultVisible !== false; // default true
    });
    setVisibleColumns(initial);
    setHydrated(true);
  }, [storageKey, columns]);

  // Persist when changes (only after hydration)
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(storageKey, JSON.stringify(visibleColumns));
  }, [storageKey, visibleColumns, hydrated]);

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [pickerOpen]);

  const filteredColumns: TableColumn<T>[] = useMemo(() => {
    return columns.filter((col) => visibleColumns[col.id] !== false);
  }, [columns, visibleColumns]);

  // Si l'appelant fournit explicitement selectable, on respecte. Sinon, on active si handlers fournis.
  const effectiveSelectable = useMemo(() => {
    if (selectable !== undefined) return selectable;
    return Boolean(onToggleSelection || onToggleSelectAll || selectedIds);
  }, [selectable, onToggleSelection, onToggleSelectAll, selectedIds]);

  return (
    <div
      className="relative"
      ref={containerRef}>
      <div className="flex flex-wrap items-center justify-end gap-2 mb-2">
        {toggleConfig && (
          <SegmentedToggle
            ariaLabel={toggleConfig.ariaLabel}
            value={toggleConfig.value}
            onChange={toggleConfig.onChange}
            options={toggleConfig.options}
          />
        )}
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
          title="Choisir les colonnes à afficher">
          <MdViewColumn className="h-5 w-5" />
          Colonnes
        </button>
      </div>

      {pickerOpen && (
        <div className="absolute right-0 z-10 w-64 rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="p-3 text-sm text-gray-700">Colonnes affichées</div>
          <div className="max-h-64 overflow-y-auto px-3 pb-3 text-sm">
            {columns.map((col) => (
              <label
                key={col.id}
                className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  checked={visibleColumns[col.id] !== false}
                  onChange={(e) =>
                    setVisibleColumns((prev) => ({
                      ...prev,
                      [col.id]: e.target.checked,
                    }))
                  }
                />
                <span>{col.header}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2 border-t border-gray-200 px-3 py-2 text-xs text-blue-600">
            <button
              type="button"
              className="hover:underline"
              onClick={() =>
                setVisibleColumns(() => {
                  const next: VisibleColumnsState = {};
                  columns.forEach((col) => {
                    next[col.id] = true;
                  });
                  return next;
                })
              }>
              Tout cocher
            </button>
            <button
              type="button"
              className="hover:underline"
              onClick={() =>
                setVisibleColumns(() => {
                  const next: VisibleColumnsState = {};
                  columns.forEach((col) => {
                    next[col.id] = false;
                  });
                  return next;
                })
              }>
              Tout masquer
            </button>
            <button
              type="button"
              className="hover:underline"
              onClick={() => setPickerOpen(false)}>
              Fermer
            </button>
          </div>
        </div>
      )}

      <TableGrid
        data={data}
        columns={filteredColumns}
        actions={actions}
        selectable={effectiveSelectable}
        selectedIds={selectedIds}
        onToggleSelection={onToggleSelection}
        onToggleSelectAll={onToggleSelectAll}
        getItemId={getItemId}
        emptyMessage={emptyMessage}
        loading={loading}
        onRowContextMenu={onRowContextMenu}
        onBackgroundContextMenu={onBackgroundContextMenu}
        isActiveField={isActiveField}
      />
    </div>
  );
}

export default SmartTableGrid;
