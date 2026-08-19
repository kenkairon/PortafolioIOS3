"use client";

import { useEffect, useState } from "react";
import { Signal, Wifi, BatteryFull } from "lucide-react";

export default function StatusBar() {
  const [hora, setHora] = useState("");

  useEffect(() => {
    const actualizar = () =>
      setHora(new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }));
    actualizar();
    const id = setInterval(actualizar, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-11 flex items-center justify-between px-7 z-50 text-white text-[14px] font-semibold [text-shadow:0_1px_2px_rgba(0,0,0,0.3)] pointer-events-none">
      <span>{hora}</span>

      {/* Dynamic Island */}
      <div className="absolute left-1/2 -translate-x-1/2 top-2 w-28 h-7 bg-black rounded-full" />

      <div className="flex items-center gap-1.5">
        <Signal size={15} />
        <Wifi size={15} />
        <BatteryFull size={18} />
      </div>
    </div>
  );
}
