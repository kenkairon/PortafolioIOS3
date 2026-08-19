// Embeddings para RAG (Retrieval-Augmented Generation): convierte texto en
// vectores numéricos para poder buscar los fragmentos más relevantes de un
// archivo subido, antes de mandarle la pregunta + esos fragmentos a un modelo
// de chat (Gemini o Grok). Grok/Groq no ofrecen un endpoint de embeddings
// público, así que esta parte SIEMPRE usa Gemini, sin importar qué modelo
// elija el usuario para la respuesta final.

const EMBEDDING_MODEL = "gemini-embedding-001";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export interface Chunk {
  text: string;
  embedding: number[];
}

/** Divide un texto largo en fragmentos con superposición, para no cortar ideas a la mitad. */
export function chunkText(text: string, chunkSize = 900, overlap = 150): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];

  const chunks: string[] = [];
  let start = 0;
  while (start < clean.length) {
    const end = Math.min(start + chunkSize, clean.length);
    chunks.push(clean.slice(start, end));
    if (end === clean.length) break;
    start = end - overlap;
  }
  return chunks;
}

/** Genera embeddings para varios fragmentos en una sola llamada (indexar un documento). */
export async function embedChunks(chunks: string[]): Promise<number[][]> {
  if (!API_KEY) throw new Error("Falta configurar NEXT_PUBLIC_GEMINI_API_KEY.");
  if (chunks.length === 0) return [];

  // batchEmbedContents acepta hasta 100 textos por llamada.
  const BATCH_SIZE = 90;
  const results: number[][] = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:batchEmbedContents?key=${API_KEY}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: batch.map((text) => ({
          model: `models/${EMBEDDING_MODEL}`,
          content: { parts: [{ text }] },
          taskType: "RETRIEVAL_DOCUMENT",
        })),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Error generando embeddings (${res.status}). ${detail.slice(0, 150)}`);
    }

    const data = await res.json();
    for (const item of data.embeddings ?? []) {
      results.push(item.values);
    }
  }

  return results;
}

/** Genera el embedding de la pregunta del usuario (una sola llamada, liviana). */
export async function embedQuery(query: string): Promise<number[]> {
  if (!API_KEY) throw new Error("Falta configurar NEXT_PUBLIC_GEMINI_API_KEY.");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: `models/${EMBEDDING_MODEL}`,
      content: { parts: [{ text: query }] },
      taskType: "RETRIEVAL_QUERY",
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Error generando embedding de la pregunta (${res.status}). ${detail.slice(0, 150)}`);
  }

  const data = await res.json();
  return data.embedding.values;
}

/** Similitud coseno entre dos vectores (qué tan "parecidos" son en significado). */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/** Devuelve los k fragmentos más relevantes para una pregunta, ordenados por relevancia. */
export function topKChunks(queryEmbedding: number[], chunks: Chunk[], k = 4): Chunk[] {
  return [...chunks]
    .map((c) => ({ chunk: c, score: cosineSimilarity(queryEmbedding, c.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((r) => r.chunk);
}
