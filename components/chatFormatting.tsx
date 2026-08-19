const URL_REGEX = /(https?:\/\/[^\s)]+)/g;

/** Detecta URLs dentro de un texto y las convierte en <a> clickeables. */
export function renderWithLinks(text: string) {
  const parts = text.split(URL_REGEX);
  return parts.map((part, i) =>
    part.startsWith("http://") || part.startsWith("https://") ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 font-medium break-all"
      >
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}
