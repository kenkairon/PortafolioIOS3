"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, ExternalLink, TriangleAlert, Waves } from "lucide-react";
import {
  Earthquake,
  fetchWorldEarthquakes,
  fetchChileEarthquakes,
  magnitudeClass,
  timeAgo,
} from "@/lib/earthquakes";

type Region = "chile" | "world";

export default function EarthquakeApp() {
  const [region, setRegion] = useState<Region>("chile");
  const [quakes, setQuakes] = useState<Earthquake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (r: Region) => {
    setLoading(true);
    setError(null);
    try {
      const data = r === "chile" ? await fetchChileEarthquakes(7, 2.5) : await fetchWorldEarthquakes("2.5", "week");
      setQuakes(data);
    } catch (e: any) {
      setError(e.message ?? "No se pudo cargar la actividad sísmica.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(region);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Aviso: esto es monitoreo, no predicción */}
      <div className="flex items-start gap-2 bg-ios-orange/10 text-ios-orange rounded-xl px-3 py-2.5 mb-3 text-[11.5px] leading-snug shrink-0">
        <TriangleAlert size={15} className="shrink-0 mt-0.5" />
        <span>
          Esto muestra sismos que <strong>ya ocurrieron</strong> (datos del USGS). La ciencia actual no puede
          predecir cuándo o dónde va a ocurrir un terremoto futuro.
        </span>
      </div>

      {/* Selector de región + refrescar */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex rounded-full bg-black/[0.05] dark:bg-white/10 p-0.5">
          {(["chile", "world"] as Region[]).map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium transition-colors ${
                region === r ? "bg-ios-blue text-white" : "text-ios-textSub dark:text-white/50"
              }`}
            >
              {r === "chile" ? "Chile" : "Mundo"}
            </button>
          ))}
        </div>
        <button
          onClick={() => load(region)}
          disabled={loading}
          className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-ios-textSub dark:text-white/60 disabled:opacity-40"
          aria-label="Actualizar"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <p className="text-[11px] text-ios-textSub dark:text-white/40 mb-2 shrink-0">
        {region === "chile" ? "Magnitud 2.5+ · últimos 7 días" : "Magnitud 2.5+ · última semana"}
      </p>

      {/* Lista */}
      <div className="flex-1 min-h-0 overflow-y-auto win-scroll -mx-1 px-1 flex flex-col gap-2">
        {loading && (
          <div className="flex items-center justify-center gap-2 text-[13px] text-ios-textSub dark:text-white/50 py-8">
            <Loader2 size={16} className="animate-spin" /> Cargando...
          </div>
        )}

        {!loading && error && <p className="text-[12.5px] text-ios-red text-center py-6">{error}</p>}

        {!loading && !error && quakes.length === 0 && (
          <div className="flex flex-col items-center gap-2 text-center py-8">
            <Waves size={22} className="text-ios-textSub dark:text-white/30" />
            <p className="text-[12.5px] text-ios-textSub dark:text-white/50">
              Sin sismos de esta magnitud en el período.
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          quakes.map((q) => {
            const sev = magnitudeClass(q.magnitude);
            return (
              <a
                key={q.id}
                href={q.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl bg-black/[0.03] dark:bg-white/5 border border-black/5 dark:border-white/10 p-3 hover:bg-black/[0.06] dark:hover:bg-white/10 transition-colors"
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0"
                  style={{ backgroundColor: sev.color }}
                >
                  {q.magnitude.toFixed(1)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-ios-text dark:text-white truncate">{q.place}</p>
                  <p className="text-[11px] text-ios-textSub dark:text-white/50">
                    {sev.label} · {timeAgo(q.time)} · {Math.round(q.depthKm)} km de profundidad
                    {q.tsunami && " · ⚠️ alerta de tsunami"}
                  </p>
                </div>
                <ExternalLink size={14} className="text-ios-textSub dark:text-white/30 shrink-0" />
              </a>
            );
          })}
      </div>

      <p className="text-[10px] text-ios-textSub dark:text-white/30 text-center pt-2 shrink-0">
        Datos: U.S. Geological Survey (USGS)
      </p>
    </div>
  );
}
