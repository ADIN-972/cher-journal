import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
  selected?: boolean;
}

export interface ContextMenuSection {
  title?: string;
  items: ContextMenuItem[];
}

interface ContextMenuProps {
  x: number;
  y: number;
  sections: ContextMenuSection[];
  onClose: () => void;
}

export default function ContextMenu({
  x,
  y,
  sections,
  onClose,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    // Petit délai pour éviter que le clic qui ouvre le menu ne le ferme immédiatement
    setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }, 0);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Ajuster la position si le menu dépasse de l'écran
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const menu = menuRef.current;

      if (rect.right > window.innerWidth) {
        menu.style.left = `${x - rect.width}px`;
      }
      if (rect.bottom > window.innerHeight) {
        menu.style.top = `${y - rect.height}px`;
      }
    }
  }, [x, y]);

  const handleItemClick = (item: ContextMenuItem) => {
    if (!item.disabled) {
      item.onClick();
      onClose();
    }
  };

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[200px] max-w-[280px]"
      style={{ left: x, top: y }}>
      {sections.map((section, sectionIdx) => (
        <div key={sectionIdx}>
          {section.title && (
            <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {section.title}
            </div>
          )}
          {section.items.map((item, itemIdx) => (
            <div key={itemIdx}>
              {item.divider ? (
                <div className="my-1 border-t border-gray-200" />
              ) : (
                <button
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-3 transition-colors ${
                    item.disabled
                      ? "opacity-50 cursor-not-allowed"
                      : item.danger
                        ? "hover:bg-red-50 text-red-600"
                        : item.selected
                          ? "bg-indigo-50 text-indigo-700 font-medium"
                          : "hover:bg-gray-100 text-gray-700"
                  }`}>
                  {item.icon && (
                    <span className="flex-shrink-0">{item.icon}</span>
                  )}
                  <span className="flex-1">{item.label}</span>
                  {item.selected && (
                    <span className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full"></span>
                  )}
                </button>
              )}
            </div>
          ))}
          {sectionIdx < sections.length - 1 && (
            <div className="my-1 border-t border-gray-200" />
          )}
        </div>
      ))}
    </div>,
    document.body
  );
}
