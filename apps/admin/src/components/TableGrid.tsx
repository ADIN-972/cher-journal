import { ReactNode } from "react";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";

export interface TableColumn<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  align?: "left" | "center" | "right";
}

export interface TableAction<T> {
  label?: string;
  onClick: (item: T) => void;
  className?: string;
  icon?: ReactNode;
  render?: (item: T) => ReactNode;
}

interface TableGridProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelection?: (id: string) => void;
  onToggleSelectAll?: () => void;
  getItemId: (item: T) => string;
  emptyMessage?: string;
  loading?: boolean;
  onRowContextMenu?: (e: React.MouseEvent, item: T) => void;
  onBackgroundContextMenu?: (e: React.MouseEvent) => void;
  isActiveField?: keyof T;
  isActive?: (item: T) => boolean;
}

export default function TableGrid<T>({
  data,
  columns,
  actions,
  selectable = false,
  selectedIds = new Set(),
  onToggleSelection,
  onToggleSelectAll,
  getItemId,
  emptyMessage = "Aucune donnée disponible",
  loading = false,
  onRowContextMenu,
  onBackgroundContextMenu,
  isActiveField,
  isActive,
}: TableGridProps<T>) {
  const allSelected = data.length > 0 && selectedIds.size === data.length;

  const getCellValue = (item: T, column: TableColumn<T>): ReactNode => {
    if (column.render) {
      return column.render(item);
    }
    if (column.accessor) {
      const value = item[column.accessor];
      return value !== null && value !== undefined ? String(value) : "-";
    }
    return "-";
  };

  const getAlignmentClass = (align?: "left" | "center" | "right") => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center text-gray-500">
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-lg shadow overflow-hidden"
      onContextMenu={(e) => {
        // Only trigger if clicked on wrapper, not on table content
        if (e.target === e.currentTarget) {
          onBackgroundContextMenu?.(e);
        }
      }}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200  dark:divide-[#4d252f]">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <button
                    onClick={onToggleSelectAll}
                    className="flex items-center hover:text-gray-700"
                    title={
                      allSelected ? "Tout désélectionner" : "Tout sélectionner"
                    }>
                    {allSelected ? (
                      <MdCheckBox className="w-5 h-5" />
                    ) : (
                      <MdCheckBoxOutlineBlank className="w-5 h-5" />
                    )}
                  </button>
                </th>
              )}
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase ${
                    column.headerClassName || ""
                  } ${getAlignmentClass(column.align)}`}>
                  {column.header}
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:divide-[#4d252f]">
            {data.map((item) => {
              const itemId = getItemId(item);
              const isSelected = selectedIds.has(itemId);
              const isItemActive = isActive
                ? isActive(item)
                : isActiveField
                  ? Boolean(item[isActiveField])
                  : true;
              const rowClassName = isItemActive
                ? "" // "hover:bg-gray-50"
                : "dashed bg-gray-100"; //"hover:bg-gray-50";

              return (
                <tr
                  key={itemId}
                  className={rowClassName}
                  onContextMenu={(e) => onRowContextMenu?.(e, item)}>
                  {selectable && (
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onToggleSelection?.(itemId)}
                        className="flex items-center text-gray-500 hover:text-gray-700">
                        {isSelected ? (
                          <MdCheckBox className="w-5 h-5 text-blue-600" />
                        ) : (
                          <MdCheckBoxOutlineBlank className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  )}
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 ${column.className || ""} ${getAlignmentClass(
                        column.align,
                      )}`}>
                      {getCellValue(item, column)}
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="px-6 py-4">
                      <div className="flex flex-row gap-3 h-full items-center justify-end text-right gap-1">
                        {actions.map((action, actionIndex) =>
                          action.render ? (
                            <div key={actionIndex}>{action.render(item)}</div>
                          ) : (
                            <button
                              key={actionIndex}
                              onClick={() => action.onClick(item)}
                              className={
                                action.className ||
                                "text-blue-600 hover:text-blue-800 text-sm font-medium"
                              }>
                              {action.icon && (
                                <span className="inline-block">
                                  {action.icon}
                                </span>
                              )}
                              {action.label ?? ""}
                            </button>
                          ),
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
