import { MdClose } from "react-icons/md";
import { useEffect, useRef } from "react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: "sm" | "md" | "lg" | "xl";
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  width = "lg",
}: DrawerProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll to top when drawer opens
  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  const widthClass = {
    sm: "w-96",
    md: "w-[600px]",
    lg: "w-[800px]",
    xl: "w-[1000px]",
  }[width];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full ${widthClass} bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 overflow-hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close drawer">
            <MdClose className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>
  );
}
