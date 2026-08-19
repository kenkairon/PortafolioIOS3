"use client";

import { ReactNode } from "react";

interface AppIconProps {
  label: string;
  icon: ReactNode;
  gradient: string;
  onTap: () => void;
  size?: "md" | "lg";
}

export default function AppIcon({ label, icon, gradient, onTap, size = "md" }: AppIconProps) {
  const box = size === "lg" ? "w-14 h-14" : "w-[58px] h-[58px]";

  return (
    <button
      onClick={onTap}
      className="flex flex-col items-center gap-1.5 w-20 group active:scale-90 transition-transform"
    >
      <div
        className={`${box} squircle shadow-icon flex items-center justify-center text-white`}
        style={{ background: gradient }}
      >
        {icon}
      </div>
      {size === "md" && (
        <span className="text-[11.5px] text-white text-center leading-tight [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
          {label}
        </span>
      )}
    </button>
  );
}
