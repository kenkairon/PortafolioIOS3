"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { fetchGithubRepos, GithubRepo } from "@/lib/github";
import { askGemini, ChatMessage } from "@/lib/gemini";
import { githubConfig } from "@/lib/data";
import { renderWithLinks } from "./chatFormatting";

const SALUDO: ChatMessage = {
  role: "model",
  text: "¡Miau! Soy Miu 🐱. Puedo responder preguntas sobre los proyectos de GitHub de Carlos: qué hacen, con qué tecnología están hechos, etc. ¿Qué quieres saber?",
};

export default function ChatBot() {
  const [repos, setRepos] = useState<GithubRepo[] | null>(null);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([SALUDO]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGithubRepos(githubConfig.username)
      .then(setRepos)
      .catch((e: Error) => setRepoError(e.message))
      .finally(() => setLoadingRepos(false));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const buildContext = () => {
    if (!repos || repos.length === 0) {
      return `Eres Miu, un gato asistente amigable del portafolio de ${githubConfig.username}. No se pudieron cargar sus repositorios de GitHub ahora mismo; dilo con amabilidad y sugiere visitar su perfil de GitHub directamente.`;
    }
    const lista = repos
      .slice(0, 12)
      .map(
        (r) =>
          `- ${r.name}${r.language ? ` (${r.language})` : ""}: ${r.description ?? "sin descripción"} — ${r.stargazers_count}⭐ — ${r.html_url}`
      )
      .join("\n");
    return `Eres Miu, un gato asistente simpático del portafolio de ${githubConfig.username}. Responde en español, con un tono cálido y profesional, SOLO sobre estos repositorios públicos de GitHub (no inventes proyectos que no estén en la lista). Cuando menciones un proyecto específico, incluye siempre su link (la URL completa de html_url) al final de esa mención. Da respuestas completas y directas, sin cortarlas a la mitad; si listas varios proyectos usa viñetas con "- ". Si preguntan algo fuera de este tema, redirige amablemente hacia los proyectos o el contacto. Repositorios:\n${lista}`;
  };

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setError(null);
    const next = [...messages, { role: "user" as const, text }];
    setMessages(next);
    setSending(true);
    try {
      const reply = await askGemini(buildContext(), next);
      setMessages((m) => [...m, { role: "model", text: reply }]);
    } catch (e: any) {
      setError(e.message ?? "Ocurrió un error consultando a Gemini.");
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
            {renderWithLinks(m.text)}
          </div>
        ))}
        {sending && (
          <div className="self-start flex items-center gap-2 text-[12.5px] text-ios-textSub dark:text-white/50 px-1">
            <Loader2 size={14} className="animate-spin" /> Miu está pensando...
          </div>
        )}
      </div>

      {repoError && (
        <p className="text-[11.5px] text-ios-red mb-2">
          No pude cargar los repos de GitHub: {repoError}
        </p>
      )}
      {error && <p className="text-[11.5px] text-ios-red mb-2">{error}</p>}

      <div className="flex items-center gap-2 rounded-full bg-black/[0.05] dark:bg-white/10 px-3.5 py-2 shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={loadingRepos ? "Cargando proyectos de GitHub..." : "Pregunta sobre mis proyectos..."}
          disabled={loadingRepos}
          className="flex-1 bg-transparent outline-none text-[13.5px] text-ios-text dark:text-white placeholder:text-ios-textSub dark:placeholder:text-white/40"
        />
        <button
          onClick={send}
          disabled={sending || loadingRepos || !input.trim()}
          className="w-8 h-8 rounded-full bg-ios-blue flex items-center justify-center text-white disabled:opacity-40 shrink-0 transition-opacity"
          aria-label="Enviar"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
