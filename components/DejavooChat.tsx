"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Volume2, VolumeX, Mic, MicOff } from "lucide-react";
import { askGrok, GrokMessage } from "@/lib/grok";
import { perfil } from "@/lib/data";
import { renderWithLinks } from "./chatFormatting";
import {
  speak,
  stopSpeaking,
  isSpeechSynthesisSupported,
  isSpeechRecognitionSupported,
  createRecognizer,
} from "@/lib/speech";

type Lang = "es-CL" | "en-US";

const SYSTEM_PROMPT: GrokMessage = {
  role: "system",
  content: `Eres "El Gato Dejavoo", un gato asistente con personalidad propia dentro del portafolio de ${perfil.nombre}. Sos ocurrente, picarón, con buena onda y un poco atrevido con el humor (sin nunca ser ofensivo, cruel, ni tocar temas sexuales, violentos o discriminatorios) — como ese amigo gracioso que siempre tiene una respuesta ingeniosa. Podés conversar de CUALQUIER tema que te pregunten: hobbies (los de Carlos son: ${perfil.intereses.join(", ")}), programación, cultura general, y también contás chistes de cualquier tipo (de programación, de gatos, cotidianos, juegos de palabras), no solo de código. Un rol especial tuyo es ser PROFESOR DE INGLÉS: si te piden practicar o aprender inglés, adoptás un modo didáctico y paciente — corregís errores con amabilidad, explicás gramática con ejemplos simples, traducís cuando haga falta, y podés alternar frases en inglés y español para que la persona practique. Mantené las respuestas conversacionales, no acartonadas. Algún "miau" o guiño felino ocasional está bien, sin exagerar. Respondé en español por defecto, salvo que la conversación sea específicamente una práctica de inglés.`,
};

const SALUDO: GrokMessage = {
  role: "assistant",
  content:
    "¡Miau! Soy el Gato Dejavoo 😼 — el gato con más labia del portafolio. Hablemos de lo que quieras: hobbies, programación, chistes random, o si querés practicar inglés, soy tu profe felino. ¿Por dónde arrancamos?",
};

export default function DejavooChat() {
  const [messages, setMessages] = useState<GrokMessage[]>([SALUDO]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("es-CL");
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognizerRef = useRef<any>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    // Detener cualquier lectura en curso al desmontar (cerrar el sheet)
    return () => stopSpeaking();
  }, []);

  const send = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
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

  const toggleSpeak = (index: number, text: string) => {
    if (speakingIndex === index) {
      stopSpeaking();
      setSpeakingIndex(null);
      return;
    }
    setSpeakingIndex(index);
    speak(text, lang, () => setSpeakingIndex(null));
  };

  const toggleListen = () => {
    if (listening) {
      recognizerRef.current?.stop();
      setListening(false);
      return;
    }
    const recognizer = createRecognizer(lang, (transcript) => {
      setListening(false);
      send(transcript);
    });
    if (!recognizer) return;
    recognizerRef.current = recognizer;
    recognizer.onerror = () => setListening(false);
    recognizer.onend = () => setListening(false);
    recognizer.start();
    setListening(true);
  };

  const speechOk = isSpeechSynthesisSupported();
  const micOk = isSpeechRecognitionSupported();

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Idioma de voz (afecta lectura en voz alta y dictado) */}
      {(speechOk || micOk) && (
        <div className="flex items-center justify-end gap-1 mb-2 shrink-0">
          <span className="text-[11px] text-ios-textSub dark:text-white/40 mr-1">Voz:</span>
          <div className="flex rounded-full bg-black/[0.05] dark:bg-white/10 p-0.5">
            {(["es-CL", "en-US"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2.5 py-1 rounded-full text-[11.5px] font-medium transition-colors ${lang === l ? "bg-ios-blue text-white" : "text-ios-textSub dark:text-white/50"
                  }`}
              >
                {l === "es-CL" ? "🇨🇱 ES" : "🇺🇸 EN"}
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto win-scroll -mx-1 px-1 mb-3 flex flex-col gap-2.5">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13.5px] leading-relaxed whitespace-pre-wrap flex items-end gap-1.5 ${m.role === "user"
              ? "self-end bg-ios-blue text-white rounded-br-md"
              : "self-start bg-black/[0.05] dark:bg-white/10 text-ios-text dark:text-white rounded-bl-md"
              }`}
          >
            <span className="min-w-0">{renderWithLinks(m.content)}</span>
            {m.role === "assistant" && speechOk && (
              <button
                onClick={() => toggleSpeak(i, m.content)}
                className="shrink-0 text-ios-textSub dark:text-white/40 hover:text-ios-blue transition-colors"
                aria-label="Leer en voz alta"
              >
                {speakingIndex === i ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            )}
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
        {micOk && (
          <button
            onClick={toggleListen}
            className={`shrink-0 transition-colors ${listening ? "text-ios-red animate-pulse" : "text-ios-textSub dark:text-white/50 hover:text-ios-blue"}`}
            aria-label={listening ? "Detener dictado" : "Hablar"}
          >
            {listening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        )}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={listening ? "Escuchando..." : "Lo que quieras — hasta inglés"}
          disabled={sending}
          className="flex-1 bg-transparent outline-none text-[13.5px] text-ios-text dark:text-white placeholder:text-ios-textSub dark:placeholder:text-white/40"
        />
        <button
          onClick={() => send()}
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
