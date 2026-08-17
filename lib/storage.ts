// Utilidades para guardar preferencias del visitante en localStorage.
// Se usan try/catch porque localStorage puede no estar disponible
// (modo incógnito estricto, SSR, navegadores con storage bloqueado, etc.)

const KEYS = {
  wallpaper: "cv-win11:wallpaper",
  dark: "cv-win11:dark",
};

export function getStoredWallpaper(fallback: string): string {
  if (typeof window === "undefined") return fallback;
  try {
    return localStorage.getItem(KEYS.wallpaper) ?? fallback;
  } catch {
    return fallback;
  }
}

export function setStoredWallpaper(id: string) {
  try {
    localStorage.setItem(KEYS.wallpaper, id);
  } catch {
    // Si el navegador bloquea localStorage, simplemente no persiste.
  }
}

export function getStoredDark(fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(KEYS.dark);
    return v === null ? fallback : v === "true";
  } catch {
    return fallback;
  }
}

export function setStoredDark(value: boolean) {
  try {
    localStorage.setItem(KEYS.dark, String(value));
  } catch {
    // no-op
  }
}

export function clearStoredPreferences() {
  try {
    localStorage.removeItem(KEYS.wallpaper);
    localStorage.removeItem(KEYS.dark);
  } catch {
    // no-op
  }
}
