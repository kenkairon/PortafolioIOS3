"use client";

import { ChevronDown } from "lucide-react";
import { ReactNode } from "react";

interface AppSheetProps {
  title: string;
  icon: ReactNode;
  gradient: string;
  onClose: () => void;
  children: ReactNode;
}

export default function AppSheet({ title, icon, gradient, onClose, children }: AppSheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Fondo oscurecido */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative w-full sm:w-[440px] sm:max-h-[80vh] h-[88vh] sm:h-auto glass-strong rounded-t-sheet sm:rounded-sheet shadow-ios flex flex-col animate-sheet-up overflow-hidden">
        {/* Manija de arrastre */}
        <div className="flex justify-center pt-2.5 pb-1 sm:hidden">
          <div className="w-9 h-1.5 rounded-full bg-black/20 dark:bg-white/30" />
        </div>

        {/* Barra de navegación */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 squircle flex items-center justify-center text-white shrink-0"
              style={{ background: gradient }}
            >
              {icon}
            </div>
            <h2 className="text-[16px] font-semibold text-ios-text dark:text-white">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-ios-textSub dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
            aria-label="Cerrar"
          >
            <ChevronDown size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto win-scroll p-5">{children}</div>
      </div>
    </div>
  );
}
