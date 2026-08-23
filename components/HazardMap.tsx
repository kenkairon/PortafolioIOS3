"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Earthquake, magnitudeClass, timeAgo } from "@/lib/earthquakes";
import { fetchRainForecast, fetchFloodRisk, weatherCodeLabel, RainInfo, FloodInfo } from "@/lib/weather";
import { searchPlace, GeoResult } from "@/lib/geocode";
import { Loader2, CloudRain, Waves as WavesIcon, X, Search } from "lucide-react";

interface HazardMapProps {
  quakes: Earthquake[];
  center: [number, number];
  zoom: number;
}

export default function HazardMap({ quakes, center, zoom }: HazardMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const clickMarkerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  const [selected, setSelected] = useState<{ lat: number; lon: number } | null>(null);
  const [rain, setRain] = useState<RainInfo | null>(null);
  const [flood, setFlood] = useState<FloodInfo | null>(null);
  const [loadingPoint, setLoadingPoint] = useState(false);
  const [pointError, setPointError] = useState<string | null>(null);

  // Buscador de lugares
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  /** Consulta clima + inundación para un punto y lo deja seleccionado en el panel de abajo. */
  const checkPoint = async (lat: number, lon: number) => {
    placeClickMarker(lat, lon);
    setSelected({ lat, lon });
    setRain(null);
    setFlood(null);
    setPointError(null);
    setLoadingPoint(true);
    try {
      const [rainData, floodData] = await Promise.all([fetchRainForecast(lat, lon), fetchFloodRisk(lat, lon)]);
      setRain(rainData);
      setFlood(floodData);
    } catch (err: any) {
      setPointError(err.message ?? "No se pudo consultar el clima de este punto.");
    } finally {
      setLoadingPoint(false);
    }
  };

  // Inicializar el mapa una sola vez
  useEffect(() => {
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      leafletRef.current = L;

      const map = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView(center, zoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);

      map.on("click", (e: any) => checkPoint(e.latlng.lat, e.latlng.lng));

      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recentrar cuando cambia la región (Chile/Mundo)
  useEffect(() => {
    mapRef.current?.setView(center, zoom);
  }, [center, zoom]);

  // Redibujar los marcadores de sismos cuando cambian los datos
  useEffect(() => {
    const L = leafletRef.current;
    if (!L || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    quakes.forEach((q) => {
      const sev = magnitudeClass(q.magnitude);
      const size = Math.min(34, Math.max(12, 8 + q.magnitude * 3.2));
      const ring = q.tsunami ? `outline: 3px solid #FF3B30; outline-offset: 1px;` : "";

      const icon = L.divIcon({
        className: "",
        html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${sev.color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.45);${ring}"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([q.lat, q.lon], { icon });
      marker.bindPopup(
        `<b>M${q.magnitude.toFixed(1)}</b> — ${q.place}<br/>${sev.label} · ${timeAgo(q.time)}<br/>${Math.round(
          q.depthKm
        )} km de profundidad${q.tsunami ? "<br/>⚠️ <b>Alerta de tsunami</b>" : ""}`
      );
      marker.on("click", (e: any) => L.DomEvent.stopPropagation(e));
      marker.addTo(markersLayerRef.current);
    });
  }, [quakes]);

  const placeClickMarker = (lat: number, lng: number) => {
    const L = leafletRef.current;
    if (!L || !mapRef.current) return;
    if (clickMarkerRef.current) mapRef.current.removeLayer(clickMarkerRef.current);
    const icon = L.divIcon({
      className: "",
      html: `<div style="width:16px;height:16px;border-radius:50%;background:#007AFF;border:3px solid white;box-shadow:0 1px 6px rgba(0,0,0,0.5);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    clickMarkerRef.current = L.marker([lat, lng], { icon }).addTo(mapRef.current);
  };

  const closePanel = () => {
    setSelected(null);
    if (clickMarkerRef.current && mapRef.current) {
      mapRef.current.removeLayer(clickMarkerRef.current);
      clickMarkerRef.current = null;
    }
  };

  const runSearch = async () => {
    const q = searchQuery.trim();
    if (!q || searching) return;
    setSearching(true);
    setSearchError(null);
    setSearchResults([]);
    try {
      const results = await searchPlace(q);
      if (results.length === 0) {
        setSearchError("Sin resultados para ese lugar.");
      } else if (results.length === 1) {
        goToResult(results[0]);
      } else {
        setSearchResults(results);
      }
    } catch (e: any) {
      setSearchError(e.message ?? "No se pudo buscar.");
    } finally {
      setSearching(false);
    }
  };

  const goToResult = (r: GeoResult) => {
    mapRef.current?.setView([r.lat, r.lon], 10);
    checkPoint(r.lat, r.lon);
    setSearchResults([]);
    setSearchQuery(r.displayName.split(",")[0]);
  };

  return (
    <div className="relative">
      {/* Buscador de lugares */}
      <div className="relative mb-2">
        <div className="flex items-center gap-2 h-9 px-3 rounded-full bg-black/[0.05] dark:bg-white/10">
          <Search size={14} className="text-ios-textSub dark:text-white/50 shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="Buscar un lugar (ciudad, dirección...)"
            className="flex-1 bg-transparent outline-none text-[13px] text-ios-text dark:text-white placeholder:text-ios-textSub dark:placeholder:text-white/40"
          />
          {searching && <Loader2 size={14} className="animate-spin text-ios-textSub dark:text-white/40 shrink-0" />}
        </div>

        {searchError && <p className="text-[11px] text-ios-red mt-1 px-1">{searchError}</p>}

        {searchResults.length > 0 && (
          <div className="absolute top-11 left-0 right-0 z-[400] rounded-2xl bg-white dark:bg-[#1c1c1e] shadow-ios border border-black/5 dark:border-white/10 overflow-hidden">
            {searchResults.map((r, i) => (
              <button
                key={i}
                onClick={() => goToResult(r)}
                className="w-full text-left px-3.5 py-2.5 text-[12.5px] text-ios-text dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors border-b border-black/5 dark:border-white/10 last:border-0 truncate"
              >
                {r.displayName}
              </button>
            ))}
          </div>
        )}
      </div>

      <div ref={containerRef} className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden z-0" />

      {selected && (
        <div className="mt-2 rounded-2xl bg-black/[0.03] dark:bg-white/5 border border-black/5 dark:border-white/10 p-3 animate-pop-in">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[11.5px] text-ios-textSub dark:text-white/40">
              {selected.lat.toFixed(3)}, {selected.lon.toFixed(3)}
            </p>
            <button onClick={closePanel} className="text-ios-textSub dark:text-white/40" aria-label="Cerrar">
              <X size={14} />
            </button>
          </div>

          {loadingPoint && (
            <div className="flex items-center gap-2 text-[12.5px] text-ios-textSub dark:text-white/50 py-2">
              <Loader2 size={14} className="animate-spin" /> Consultando clima...
            </div>
          )}

          {!loadingPoint && pointError && <p className="text-[12px] text-ios-red">{pointError}</p>}

          {!loadingPoint && rain && (
            <div className="flex items-center gap-2 mb-2">
              <CloudRain size={16} className="text-ios-blue shrink-0" />
              <p className="text-[13px] text-ios-text dark:text-white">
                {weatherCodeLabel(rain.weatherCode)} ·{" "}
                <strong>
                  {rain.currentProbability !== null ? `${rain.currentProbability}% prob. de lluvia` : "sin datos de probabilidad"}
                </strong>
              </p>
            </div>
          )}

          {!loadingPoint && rain && rain.hourly.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto win-scroll pb-1 mb-2">
              {rain.hourly.map((h) => (
                <div
                  key={h.time}
                  className="flex flex-col items-center shrink-0 w-10 text-center bg-black/[0.03] dark:bg-white/5 rounded-lg py-1.5"
                >
                  <span className="text-[9.5px] text-ios-textSub dark:text-white/40">
                    {h.time.slice(11, 16)}
                  </span>
                  <span className="text-[11px] font-medium text-ios-blue">{h.probability}%</span>
                </div>
              ))}
            </div>
          )}

          {!loadingPoint && (
            <div className="flex items-center gap-2">
              <WavesIcon size={15} className="text-ios-teal shrink-0" />
              {flood ? (
                <p className="text-[12.5px] text-ios-text dark:text-white">
                  Caudal del río más cercano: <strong>{flood.riverDischarge[0]?.toFixed(1)} m³/s</strong> hoy
                </p>
              ) : (
                <p className="text-[12px] text-ios-textSub dark:text-white/40">
                  Sin datos de río cerca de este punto.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
