"use client";

import { useState } from "react";
import { Search, X, Sparkles } from "lucide-react";
import { catTips } from "@/lib/data";

export interface SearchResult {
  id: string;
  label: string;
  sub: string;
  onSelect: () => void;
}

interface CatGuideProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchResults: SearchResult[];
}

export default function CatGuide({ searchQuery, onSearchChange, searchResults }: CatGuideProps) {
  const [open, setOpen] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  return (
    <div className="fixed bottom-24 left-4 z-40 flex flex-col items-start gap-3">
      {/* Burbuja de diálogo */}
      {open && (
        <div className="w-72 max-w-[80vw] glass-strong rounded-sheet shadow-ios p-4 animate-pop-in">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐱</span>
              <p className="text-[13px] font-semibold text-ios-text dark:text-white">Miu, tu guía</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-ios-textSub dark:text-white/60"
              aria-label="Cerrar"
            >
              <X size={12} />
            </button>
          </div>

          <p className="text-[12.5px] text-ios-textSub dark:text-white/60 leading-relaxed mb-3">
            {catTips[tipIndex]}
          </p>

          {/* Buscador */}
          <div className="flex items-center gap-2 h-9 px-3 rounded-full bg-black/5 dark:bg-white/10 mb-1">
            <Search size={14} className="text-ios-textSub dark:text-white/50 shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar habilidades, proyectos..."
              className="bg-transparent outline-none w-full text-[13px] text-ios-text dark:text-white placeholder:text-ios-textSub dark:placeholder:text-white/40"
            />
          </div>

          {searchQuery.trim().length > 0 && (
            <ul className="max-h-56 overflow-y-auto win-scroll mt-1 -mx-1">
              {searchResults.length === 0 ? (
                <p className="px-2 py-3 text-[12.5px] text-ios-textSub dark:text-white/50">
                  No encontré nada para "{searchQuery}" 🐾
                </p>
              ) : (
                searchResults.map((r) => (
                  <li key={r.id}>
                    <button
                      onClick={() => {
                        r.onSelect();
                        onSearchChange("");
                        setOpen(false);
                      }}
                      className="w-full text-left px-2 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                      <p className="text-[13px] font-medium text-ios-text dark:text-white">{r.label}</p>
                      <p className="text-[11px] text-ios-textSub dark:text-white/50">{r.sub}</p>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}

          {searchQuery.trim().length === 0 && (
            <button
              onClick={() => setTipIndex((i) => (i + 1) % catTips.length)}
              className="flex items-center gap-1.5 text-[12px] font-medium text-ios-blue mt-1"
            >
              <Sparkles size={13} />
              Otro consejo
            </button>
          )}
        </div>
      )}

      {/* Avatar del gato */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-16 h-16 rounded-full glass-strong shadow-ios flex items-center justify-center text-3xl active:scale-90 transition-transform ${
          open ? "" : "animate-bounce-cat"
        }`}
        aria-label="Abrir asistente"
      >
        🐱
      </button>
    </div>
  );
}
