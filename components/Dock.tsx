"use client";

import { ReactNode } from "react";

interface DockApp {
  key: string;
  label: string;
  icon: ReactNode;
  gradient: string;
}

interface DockProps {
  apps: DockApp[];
  onTap: (key: string) => void;
}

export default function Dock({ apps, onTap }: DockProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 flex flex-col items-center pb-2 z-40">
      <div className="glass rounded-[28px] shadow-ios px-4 py-2.5 flex items-center gap-3 mb-1.5">
        {apps.map((app) => (
          <button
            key={app.key}
            onClick={() => onTap(app.key)}
            className="w-14 h-14 squircle shadow-icon flex items-center justify-center text-white active:scale-90 transition-transform"
            style={{ background: app.gradient }}
            title={app.label}
          >
            {app.icon}
          </button>
        ))}
      </div>
      {/* Home indicator */}
      <div className="w-32 h-1.5 rounded-full bg-white/70" />
    </div>
  );
}
