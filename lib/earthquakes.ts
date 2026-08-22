// Cliente para la API pública del USGS (Servicio Geológico de EE.UU.).
// Es de acceso libre, sin API key, con CORS abierto — se puede llamar
// directo desde el navegador. Cubre sismos de todo el mundo, incluido Chile.
//
// IMPORTANTE: esto es MONITOREO de sismos que ya ocurrieron, no predicción.
// La ciencia actual no puede predecir cuándo/dónde va a ocurrir un terremoto
// futuro — cualquier app que lo prometa no está siendo honesta.

export interface Earthquake {
  id: string;
  place: string;
  magnitude: number;
  magType: string;
  time: number; // epoch ms
  depthKm: number;
  lat: number;
  lon: number;
  url: string; // página del evento en USGS
  tsunami: boolean;
  felt: number | null;
}

function normalize(feature: any): Earthquake {
  const [lon, lat, depthKm] = feature.geometry.coordinates;
  return {
    id: feature.id,
    place: feature.properties.place ?? "Ubicación desconocida",
    magnitude: feature.properties.mag,
    magType: feature.properties.magType ?? "",
    time: feature.properties.time,
    depthKm,
    lat,
    lon,
    url: feature.properties.url,
    tsunami: feature.properties.tsunami === 1,
    felt: feature.properties.felt,
  };
}

/** Sismos significativos/recientes a nivel mundial (feeds pre-armados del USGS). */
export async function fetchWorldEarthquakes(
  minMagnitude: "significant" | "4.5" | "2.5" | "1.0" | "all" = "2.5",
  period: "hour" | "day" | "week" | "month" = "week"
): Promise<Earthquake[]> {
  const url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${minMagnitude}_${period}.geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`USGS respondió ${res.status}`);
  const data = await res.json();
  return (data.features ?? []).map(normalize).sort((a: Earthquake, b: Earthquake) => b.time - a.time);
}

// Caja delimitadora aproximada de Chile continental + insular cercano.
const CHILE_BBOX = { minlat: -56, maxlat: -17, minlon: -76, maxlon: -66 };

/** Sismos recientes dentro del territorio chileno (últimos N días, vía la API de búsqueda del USGS). */
export async function fetchChileEarthquakes(days = 7, minMagnitude = 2.5): Promise<Earthquake[]> {
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const params = new URLSearchParams({
    format: "geojson",
    starttime: start,
    minmagnitude: String(minMagnitude),
    minlatitude: String(CHILE_BBOX.minlat),
    maxlatitude: String(CHILE_BBOX.maxlat),
    minlongitude: String(CHILE_BBOX.minlon),
    maxlongitude: String(CHILE_BBOX.maxlon),
    orderby: "time",
    limit: "100",
  });

  const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`USGS respondió ${res.status}`);
  const data = await res.json();
  return (data.features ?? []).map(normalize);
}

/** Clasificación de severidad por magnitud, con color asociado (para la UI). */
export function magnitudeClass(mag: number): { label: string; color: string } {
  if (mag < 3) return { label: "Menor", color: "#34C759" };
  if (mag < 4) return { label: "Leve", color: "#FFD60A" };
  if (mag < 5) return { label: "Moderado", color: "#FF9500" };
  if (mag < 6) return { label: "Fuerte", color: "#FF3B30" };
  if (mag < 7) return { label: "Mayor", color: "#D70015" };
  return { label: "Gran terremoto", color: "#8E0000" };
}

/** "hace 5 minutos", "hace 3 horas", etc. */
export function timeAgo(epochMs: number): string {
  const diffSec = Math.floor((Date.now() - epochMs) / 1000);
  if (diffSec < 60) return "hace instantes";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  return `hace ${diffD} d`;
}
