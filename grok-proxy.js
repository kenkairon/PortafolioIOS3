// Proxy hacia la API de Groq. Se despliega SEPARADO de la app de
// Next.js, en Cloudflare Workers (gratis). Hace dos cosas:
//   1. Esconde la API key real de Groq (nunca llega al navegador del visitante).
//   2. Agrega los headers CORS que api.groq.com no expone para peticiones
//      hechas directo desde el navegador.
//
// La API key vive SOLO acá, como "secret" de Cloudflare (ver README),
// nunca en el código ni en el repositorio.

// Cambia esto por tu dominio real antes de desplegar.
const ALLOWED_ORIGINS = [
  "https://kenkairon.github.io/PortafolioIOS3/", // tu sitio en GitHub Pages
];

const MODEL = "openai/gpt-oss-120b";

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const isAllowed = ALLOWED_ORIGINS.includes(origin);

    // Reflejamos el origen (o "*") en TODAS las respuestas, incluidos errores,
    // para que el navegador siempre pueda leer el mensaje real en vez de
    // ocultarlo detrás de un "Failed to fetch" genérico. La seguridad real
    // no depende de este header: depende de que solo los orígenes permitidos
    // lleguen a usar la API key de verdad (ver el chequeo de "isAllowed" abajo).
    const corsHeaders = {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Preflight de CORS
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (!isAllowed) {
      return new Response(
        JSON.stringify({
          error: `Origen no permitido: "${origin || "(vacío)"}". Orígenes permitidos: ${ALLOWED_ORIGINS.join(", ")}`,
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (request.method !== "POST") {
      return new Response("Método no permitido", { status: 405, headers: corsHeaders });
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return new Response("JSON inválido", { status: 400, headers: corsHeaders });
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: payload.messages,
        temperature: 0.8,
        max_tokens: 700,
      }),
    });

    const data = await groqRes.text();
    return new Response(data, {
      status: groqRes.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  },
};