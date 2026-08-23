// Clima y riesgo de inundación por coordenadas, vía Open-Meteo — gratis,
// sin API key, con CORS abierto (llamada directa desde el navegador).
// https://open-meteo.com

export interface RainInfo {
  currentPrecipitationMm: number;
  currentProbability: number | null;
  hourly: { time: string; probability: number }[];
  weatherCode: number;
}

/** Clima actual + probabilidad de lluvia por hora (próximas 24h) para un punto del mapa. */
export async function fetchRainForecast(lat: number, lon: number): Promise<RainInfo> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "precipitation,weather_code",
    hourly: "precipitation_probability",
    forecast_days: "1",
    timezone: "auto",
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo respondió ${res.status}`);
  const data = await res.json();

  const hourly = (data.hourly?.time ?? []).map((time: string, i: number) => ({
    time,
    probability: data.hourly.precipitation_probability?.[i] ?? 0,
  }));

  // La probabilidad "actual" es la de la hora en curso, si está disponible.
  const nowHour = new Date().toISOString().slice(0, 13);
  const currentHourEntry = hourly.find((h: any) => h.time.startsWith(nowHour));

  return {
    currentPrecipitationMm: data.current?.precipitation ?? 0,
    currentProbability: currentHourEntry?.probability ?? null,
    hourly: hourly.slice(0, 12),
    weatherCode: data.current?.weather_code ?? 0,
  };
}

export interface FloodInfo {
  dates: string[];
  riverDischarge: number[]; // m³/s
}

/**
 * Riesgo de inundación (caudal del río más cercano, hasta 5 km) para un punto.
 * NOTA: este sub-servicio de Open-Meteo (flood-api.open-meteo.com) es un
 * dominio distinto al de clima; su soporte de CORS puede variar. Si falla,
 * la función devuelve null en vez de romper el resto de la app — significa
 * que no hay un río lo bastante cerca del punto elegido, o que no se pudo
 * consultar en este momento.
 */
export async function fetchFloodRisk(lat: number, lon: number): Promise<FloodInfo | null> {
  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      daily: "river_discharge",
      forecast_days: "7",
    });
    const res = await fetch(`https://flood-api.open-meteo.com/v1/flood?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.daily?.river_discharge) return null;
    return { dates: data.daily.time, riverDischarge: data.daily.river_discharge };
  } catch {
    return null;
  }
}

/** Interpretación simple del código de clima de Open-Meteo (WMO) a texto + emoji. */
export function weatherCodeLabel(code: number): string {
  if (code === 0) return "☀️ Despejado";
  if (code <= 3) return "⛅ Parcialmente nublado";
  if (code <= 48) return "🌫️ Neblina";
  if (code <= 57) return "🌦️ Llovizna";
  if (code <= 67) return "🌧️ Lluvia";
  if (code <= 77) return "🌨️ Nieve";
  if (code <= 82) return "🌧️ Chubascos";
  if (code <= 99) return "⛈️ Tormenta";
  return "—";
}
