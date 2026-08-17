"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { askGrok, GrokMessage } from "@/lib/grok";
import { perfil } from "@/lib/data";
import { renderWithLinks } from "./chatFormatting";

const SYSTEM_PROMPT: GrokMessage = {
  role: "system",
  content: `Eres "El Gato Dejavoo", un gato asistente simpático, cercano y didáctico dentro del portafolio de ${perfil.nombre}. Hablas de tres temas, y solo esos tres: (1) hobbies — los de Carlos son: ${perfil.intereses.join(", ")}; (2) programación — explicas conceptos con analogías simples, paso a paso, como si le enseñaras a alguien que recién empieza; (3) humor de programación — chistes sobre bugs, código, Stack Overflow, etc. Tono felino sutil (algún "miau" ocasional, sin exagerar), amigable y con buena onda. Si preguntan algo fuera de esos tres temas, redirige con humor hacia uno de ellos. Responde siempre en español, en respuestas breves y claras.`,
};

const SALUDO: GrokMessage = {
  role: "assistant",
  content:
    "¡Miau! Soy el Gato Dejavoo 😼 — hablemos de hobbies, programación, o nos reímos un rato con humor de código. ¿Por dónde arrancamos?",
};

export default function DejavooChat() {
  const [messages, setMessages] = useState<GrokMessage[]>([SALUDO]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setError(null);
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setSending(true);
    try {
      const reply = await askGrok([SYSTEM_PROMPT, ...next]);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e: any) {
      setError(e.message ?? "Ocurrió un error consultando al Gato Dejavoo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto win-scroll -mx-1 px-1 mb-3 flex flex-col gap-2.5">
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
            <Loader2 size={14} className="animate-spin" /> Dejavoo está pensando...
          </div>
        )}
      </div>

      {error && <p className="text-[11.5px] text-ios-red mb-2 shrink-0">{error}</p>}

      <div className="flex items-center gap-2 rounded-full bg-black/[0.05] dark:bg-white/10 px-3.5 py-2 shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Hobbies, programación o humor..."
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
