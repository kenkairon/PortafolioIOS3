"use client";

import { useRef, useState, useEffect } from "react";
import { Upload, FileText, Loader2, Send, X, Sparkles } from "lucide-react";
import { extractTextFromFile } from "@/lib/fileExtract";
import { chunkText, embedChunks, embedQuery, topKChunks, Chunk } from "@/lib/embeddings";
import { askGemini, ChatMessage as GeminiMsg } from "@/lib/gemini";
import { askGrok, GrokMessage } from "@/lib/grok";
import { renderWithLinks } from "./chatFormatting";

type Status = "idle" | "leyendo" | "indexando" | "listo" | "error";
type Provider = "gemini" | "grok";
interface Msg {
  role: "user" | "assistant";
  content: string;
}

function buildContextPrompt(context: string): string {
  return `Eres un asistente que responde preguntas ÚNICAMENTE basándote en el siguiente contexto, extraído de un archivo que subió el usuario. Si la respuesta no está en el contexto, decilo claramente en vez de inventar algo. Sé claro y conciso. Responde en español.\n\n--- CONTEXTO DEL ARCHIVO ---\n${context}\n--- FIN DEL CONTEXTO ---`;
}

export default function RagChat() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [provider, setProvider] = useState<Provider>("gemini");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const processFile = async (f: File) => {
    setFile(f);
    setError(null);
    setMessages([]);
    setChunks([]);
    try {
      setStatus("leyendo");
      setStatusMsg("Extrayendo texto del archivo...");
      const text = await extractTextFromFile(f);

      const pieces = chunkText(text);
      if (pieces.length === 0) throw new Error("El archivo no tiene texto para indexar.");

      setStatus("indexando");
      setStatusMsg(`Generando embeddings de ${pieces.length} fragmentos...`);
      const vectors = await embedChunks(pieces);

      setChunks(pieces.map((text, i) => ({ text, embedding: vectors[i] })));
      setStatus("listo");
      setStatusMsg("");
    } catch (e: any) {
      setStatus("error");
      setError(e.message ?? "No se pudo procesar el archivo.");
    }
  };

  const send = async () => {
    const question = input.trim();
    if (!question || sending || status !== "listo") return;
    setInput("");
    setError(null);
    const nextMessages: Msg[] = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setSending(true);

    try {
      const queryEmbedding = await embedQuery(question);
      const relevant = topKChunks(queryEmbedding, chunks, 4);
      const context = relevant.map((c) => c.text).join("\n\n---\n\n");
      const systemPrompt = buildContextPrompt(context);

      let answer: string;
      if (provider === "gemini") {
        const history: GeminiMsg[] = nextMessages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          text: m.content,
        }));
        answer = await askGemini(systemPrompt, history);
      } else {
        const history: GrokMessage[] = [
          { role: "system", content: systemPrompt },
          ...nextMessages.map((m) => ({
            role: (m.role === "assistant" ? "assistant" : "user") as "assistant" | "user",
            content: m.content,
          })),
        ];
        answer = await askGrok(history);
      }

      setMessages((m) => [...m, { role: "assistant", content: answer }]);
    } catch (e: any) {
      setError(e.message ?? "Ocurrió un error al responder.");
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setChunks([]);
    setMessages([]);
    setError(null);
  };

  // --- Pantalla de subida de archivo ---
  if (status === "idle" || status === "leyendo" || status === "indexando" || (status === "error" && !file)) {
    return (
      <div className="flex flex-col h-full min-h-0 items-center justify-center gap-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) processFile(f);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full rounded-2xl border-2 border-dashed p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
            dragOver
              ? "border-ios-blue bg-ios-blue/5"
              : "border-black/15 dark:border-white/20 hover:border-ios-blue/50"
          }`}
        >
          {status === "leyendo" || status === "indexando" ? (
            <>
              <Loader2 size={28} className="animate-spin text-ios-blue" />
              <p className="text-[13px] text-ios-textSub dark:text-white/60 text-center">{statusMsg}</p>
            </>
          ) : (
            <>
              <Upload size={28} className="text-ios-textSub dark:text-white/50" />
              <p className="text-[13.5px] font-medium text-ios-text dark:text-white text-center">
                Arrastra un archivo o toca para elegir
              </p>
              <p className="text-[11.5px] text-ios-textSub dark:text-white/40 text-center">.txt, .md o .pdf — hasta 8 MB</p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) processFile(f);
          }}
        />
        {error && <p className="text-[12px] text-ios-red text-center px-2">{error}</p>}
      </div>
    );
  }

  // --- Pantalla de chat sobre el archivo ya indexado ---
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={16} className="text-ios-blue shrink-0" />
          <div className="min-w-0">
            <p className="text-[12.5px] font-medium text-ios-text dark:text-white truncate">{file?.name}</p>
            <p className="text-[11px] text-ios-textSub dark:text-white/40">{chunks.length} fragmentos indexados</p>
          </div>
        </div>
        <button
          onClick={reset}
          className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-ios-textSub dark:text-white/60 shrink-0"
          aria-label="Cambiar archivo"
        >
          <X size={13} />
        </button>
      </div>

      {/* Selector de quién responde */}
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <span className="text-[11.5px] text-ios-textSub dark:text-white/40 flex items-center gap-1">
          <Sparkles size={12} /> Responde:
        </span>
        <div className="flex rounded-full bg-black/[0.05] dark:bg-white/10 p-0.5">
          {(["gemini", "grok"] as Provider[]).map((p) => (
            <button
              key={p}
              onClick={() => setProvider(p)}
              className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors ${
                provider === p
                  ? "bg-ios-blue text-white"
                  : "text-ios-textSub dark:text-white/50"
              }`}
            >
              {p === "gemini" ? "Miu (Gemini)" : "Dejavoo (Grok)"}
            </button>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto win-scroll -mx-1 px-1 mb-3 flex flex-col gap-2.5">
        {messages.length === 0 && (
          <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13.5px] leading-relaxed self-start bg-black/[0.05] dark:bg-white/10 text-ios-text dark:text-white rounded-bl-md">
            Ya indexé "{file?.name}". Preguntame lo que quieras sobre su contenido.
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13.5px] leading-relaxed whitespace-pre-wrap ${
              m.role === "user"
                ? "self-end bg-ios-blue text-white rounded-br-md"
                : "self-start bg-black/[0.05] dark:bg-white/10 text-ios-text dark:text-white rounded-bl-md"
            }`}
          >
            {renderWithLinks(m.content)}
          </div>
        ))}
        {sending && (
          <div className="self-start flex items-center gap-2 text-[12.5px] text-ios-textSub dark:text-white/50 px-1">
            <Loader2 size={14} className="animate-spin" /> Buscando en el archivo...
          </div>
        )}
      </div>

      {error && <p className="text-[11.5px] text-ios-red mb-2 shrink-0">{error}</p>}

      <div className="flex items-center gap-2 rounded-full bg-black/[0.05] dark:bg-white/10 px-3.5 py-2 shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Pregunta sobre el archivo..."
          disabled={sending}
          className="flex-1 bg-transparent outline-none text-[13.5px] text-ios-text dark:text-white placeholder:text-ios-textSub dark:placeholder:text-white/40"
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          className="w-8 h-8 rounded-full bg-ios-blue flex items-center justify-center text-white disabled:opacity-40 shrink-0 transition-opacity"
          aria-label="Enviar"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
