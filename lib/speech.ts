// Voz para Dejavoo usando la Web Speech API del propio navegador — nativa,
// gratis, sin ninguna key ni servicio externo. Se detecta el soporte porque
// no todos los navegadores la implementan igual (Chrome/Edge son los más
// completos; Safari/Firefox varían).

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== "undefined" && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

/** Lee un texto en voz alta. Devuelve una función para detenerlo antes de tiempo. */
export function speak(text: string, lang: "es-CL" | "en-US", onEnd?: () => void): () => void {
  if (!isSpeechSynthesisSupported()) return () => { };
  window.speechSynthesis.cancel(); // corta cualquier lectura anterior

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1;
  utterance.pitch = 1.15; // un toque más agudo, para que suene "a gato"
  if (onEnd) utterance.onend = onEnd;

  window.speechSynthesis.speak(utterance);
  return () => window.speechSynthesis.cancel();
}

export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
}

/** Crea un reconocedor de voz (dictado) para un idioma dado. null si no hay soporte. */
export function createRecognizer(lang: "es-CL" | "en-US", onResult: (text: string) => void) {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };
  return recognition;
}
