// Habla con el proxy de Cloudflare Worker (worker/grok-proxy.js), no
// directo con api.x.ai — la API key de xAI vive solo en el Worker.

export interface GrokMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// URL pública de tu Worker (no es secreta, es solo el endpoint del proxy;
// la key real está protegida adentro del Worker). Cámbiala por la tuya
// después de desplegar, ver README.
const WORKER_URL = "https://grok-dejavoo-proxy.kenkairon.workers.dev";

export async function askGrok(messages: GrokMessage[]): Promise<string> {
  if (WORKER_URL.includes("TU-SUBDOMINIO")) {
    throw new Error("Falta configurar la URL del Worker en lib/grok.ts (ver README, sección Dejavoo).");
  }

  const res = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Dejavoo no pudo responder (${res.status}). ${detail.slice(0, 150)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  return text || "Miau... no se me ocurrió nada, ¿probamos de nuevo?";
}
