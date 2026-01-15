import { useState, useRef, useEffect } from "react";
import { MdAdd, MdClose } from "react-icons/md";

export interface FloatingAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  badge?: number;
}

export interface FloatingActionSection {
  title?: string;
  actions: FloatingAction[];
}

interface FloatingActionButtonProps {
  sections: FloatingActionSection[];
  position?: "bottom-right" | "bottom-left";
}

export default function FloatingActionButton({
  sections,
  position = "bottom-right",
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleActionClick = (action: FloatingAction) => {
    if (!action.disabled) {
      action.onClick();
      setIsOpen(false);
    }
  };

  const getVariantClasses = (variant?: string) => {
    switch (variant) {
      case "danger":
        return "bg-red-50 hover:bg-red-100 text-red-700 border-red-200";
      case "secondary":
        return "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200";
    }
  };

  const positionClasses =
    position === "bottom-right" ? "bottom-8 right-8" : "bottom-8 left-8";

  return (
    <div
      ref={menuRef}
      className={`fixed ${positionClasses} z-50`}>
      {/* Menu modal */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 mb-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          {sections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              {section.title && (
                <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <h3 className="font-semibold text-sm">{section.title}</h3>
                </div>
              )}
              <div className="p-2">
                {section.actions.map((action, actionIdx) => (
                  <button
                    key={actionIdx}
                    onClick={() => handleActionClick(action)}
                    disabled={action.disabled}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border ${
                      action.disabled
                        ? "opacity-50 cursor-not-allowed bg-gray-50"
                        : getVariantClasses(action.variant)
                    }`}>
                    <div className="flex-shrink-0 text-xl">{action.icon}</div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{action.label}</div>
                    </div>
                    {action.badge !== undefined && action.badge > 0 && (
                      <div className="flex-shrink-0 bg-indigo-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {action.badge}
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {sectionIdx < sections.length - 1 && (
                <div className="border-t border-gray-200 my-2"></div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
          isOpen
            ? "bg-gray-600 hover:bg-gray-700 rotate-45"
            : "bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        }`}
        title={isOpen ? "Fermer le menu" : "Actions rapides"}>
        {isOpen ? (
          <MdClose className="w-7 h-7 text-white" />
        ) : (
          <MdAdd className="w-7 h-7 text-white" />
        )}
      </button>

      {/* Ripple effect on click */}
      {!isOpen && (
        <div className="absolute inset-0 rounded-full animate-ping bg-indigo-400 opacity-20 pointer-events-none"></div>
      )}
    </div>
  );
}
