// Buscador de lugares vía Nominatim (el geocodificador de OpenStreetMap).
// Gratis, sin API key. Política de uso: máximo 1 petición por segundo y
// nada de autocompletado disparando una consulta por cada tecla — por eso
// en la UI se busca recién al presionar Enter, no mientras se escribe.
// https://operations.osmfoundation.org/policies/nominatim/

export interface GeoResult {
  displayName: string;
  lat: number;
  lon: number;
}

export async function searchPlace(query: string): Promise<GeoResult[]> {
  const q = query.trim();
  if (!q) return [];

  const params = new URLSearchParams({ q, format: "json", limit: "5" });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);

  if (!res.ok) {
    throw new Error(
      res.status === 429
        ? "Demasiadas búsquedas seguidas, esperá un segundo e intentá de nuevo."
        : `Buscador no disponible (${res.status})`
    );
  }

  const data = await res.json();
  return (data as any[]).map((d) => ({
    displayName: d.display_name,
    lat: parseFloat(d.lat),
    lon: parseFloat(d.lon),
  }));
}
