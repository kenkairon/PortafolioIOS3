"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, RefreshCw, ExternalLink, TriangleAlert, Waves, Map, List } from "lucide-react";
import {
  Earthquake,
  fetchWorldEarthquakes,
  fetchChileEarthquakes,
  magnitudeClass,
  timeAgo,
} from "@/lib/earthquakes";

// Leaflet necesita "window", así que el mapa se carga solo en el navegador,
// nunca durante el build estático ni en el servidor.
const HazardMap = dynamic(() => import("./HazardMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-56 sm:h-64 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center">
      <Loader2 size={20} className="animate-spin text-ios-textSub dark:text-white/40" />
    </div>
  ),
});

type Region = "chile" | "world";
type View = "mapa" | "lista";

const REGION_CENTER: Record<Region, [number, number]> = {
  chile: [-35.5, -71],
  world: [10, -20],
};
const REGION_ZOOM: Record<Region, number> = {
  chile: 4,
  world: 2,
};

export default function EarthquakeApp() {
  const [region, setRegion] = useState<Region>("chile");
  const [view, setView] = useState<View>("mapa");
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
          Los sismos mostrados <strong>ya ocurrieron</strong> (USGS) — esto no predice terremotos futuros. El clima y
          los ríos sí son pronósticos (Open-Meteo).
        </span>
      </div>

      {/* Controles: región + vista + refrescar */}
      <div className="flex items-center justify-between mb-2 shrink-0 flex-wrap gap-2">
        <div className="flex rounded-full bg-black/[0.05] dark:bg-white/10 p-0.5">
          {(["chile", "world"] as Region[]).map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium transition-colors ${region === r ? "bg-ios-blue text-white" : "text-ios-textSub dark:text-white/50"
                }`}
            >
              {r === "chile" ? "Chile" : "Mundo"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex rounded-full bg-black/[0.05] dark:bg-white/10 p-0.5">
            <button
              onClick={() => setView("mapa")}
              className={`w-8 h-7 rounded-full flex items-center justify-center transition-colors ${view === "mapa" ? "bg-ios-blue text-white" : "text-ios-textSub dark:text-white/50"
                }`}
              aria-label="Ver mapa"
            >
              <Map size={13} />
            </button>
            <button
              onClick={() => setView("lista")}
              className={`w-8 h-7 rounded-full flex items-center justify-center transition-colors ${view === "lista" ? "bg-ios-blue text-white" : "text-ios-textSub dark:text-white/50"
                }`}
              aria-label="Ver lista"
            >
              <List size={13} />
            </button>
          </div>
          <button
            onClick={() => load(region)}
            disabled={loading}
            className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-ios-textSub dark:text-white/60 disabled:opacity-40"
            aria-label="Actualizar"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <p className="text-[11px] text-ios-textSub dark:text-white/40 mb-2 shrink-0">
        {region === "chile" ? "Sismos M2.5+ · últimos 7 días" : "Sismos M2.5+ · última semana"} · toca el mapa para
        ver el clima de cualquier punto
      </p>

      {view === "mapa" ? (
        <div className="flex-1 min-h-0 overflow-y-auto win-scroll -mx-1 px-1">
          <HazardMap quakes={quakes} center={REGION_CENTER[region]} zoom={REGION_ZOOM[region]} />
          {loading && (
            <p className="flex items-center gap-2 text-[12px] text-ios-textSub dark:text-white/50 mt-2">
              <Loader2 size={13} className="animate-spin" /> Actualizando sismos...
            </p>
          )}
          {error && <p className="text-[12px] text-ios-red mt-2">{error}</p>}
        </div>
      ) : (
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
              <p className="text-[12.5px] text-ios-textSub dark:text-white/50">Sin sismos de esta magnitud en el período.</p>
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
                      {sev.label} · {timeAgo(q.time)} · {Math.round(q.depthKm)} km
                      {q.tsunami && " · ⚠️ alerta de tsunami"}
                    </p>
                  </div>
                  <ExternalLink size={14} className="text-ios-textSub dark:text-white/30 shrink-0" />
                </a>
              );
            })}
        </div>
      )}

      <p className="text-[10px] text-ios-textSub dark:text-white/30 text-center pt-2 shrink-0">
        Sismos: USGS · Clima y ríos: Open-Meteo · Mapa: OpenStreetMap
      </p>
    </div>
  );
}
