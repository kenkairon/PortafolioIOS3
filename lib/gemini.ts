// Llama directamente a la API de Gemini desde el navegador.
// Como este sitio es 100% estático (GitHub Pages no corre backend),
// no hay forma de esconder la key en un servidor propio. La forma
// segura de hacerlo es restringir la API key por "HTTP referrer" en
// Google AI Studio / Google Cloud Console, para que solo funcione
// si la petición viene desde tu dominio de GitHub Pages.
// Ver el README para el paso a paso de cómo crear y restringir la key.

const GEMINI_MODEL = "gemini-3.6-flash";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export async function askGemini(systemInstruction: string, history: ChatMessage[]): Promise<string> {
  if (!API_KEY) {
    throw new Error(
      "Falta configurar NEXT_PUBLIC_GEMINI_API_KEY (ver README, sección del chatbot)."
    );
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: history.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.6,
        // gemini-3.x "piensa" antes de responder y ese pensamiento gasta
        // tokens del mismo presupuesto que la respuesta final. "low" lo
        // deja al mínimo para que no se coma el límite (no se puede
        // desactivar del todo en los modelos Flash de la serie 3).
        thinkingConfig: { thinkingLevel: "low" },
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini respondió ${res.status}. ${detail.slice(0, 150)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";
  return text || "No obtuve una respuesta clara, ¿puedes reformular la pregunta?";
}
