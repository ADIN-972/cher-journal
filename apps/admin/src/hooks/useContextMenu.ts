import { useState, MouseEvent } from "react";
import { ContextMenuSection } from "../components/ContextMenu";

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  sections: ContextMenuSection[];
}

export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    sections: [],
  });

  const openContextMenu = (e: MouseEvent, sections: ContextMenuSection[]) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      sections,
    });
  };

  const closeContextMenu = () => {
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
  };

  return {
    contextMenu,
    openContextMenu,
    closeContextMenu,
  };
}
