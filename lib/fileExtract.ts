// Extrae texto plano de un archivo subido por el usuario, para poder
// indexarlo con embeddings. Todo corre en el navegador — el archivo nunca
// se sube a ningún servidor propio, solo se procesa en memoria.

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("El archivo es muy grande (máximo 8 MB).");
  }

  const name = file.name.toLowerCase();

  if (name.endsWith(".txt") || name.endsWith(".md")) {
    return file.text();
  }

  if (name.endsWith(".pdf")) {
    return extractPdfText(file);
  }

  throw new Error("Formato no soportado. Usa .txt, .md o .pdf.");
}

async function extractPdfText(file: File): Promise<string> {
  // Import dinámico: pdfjs-dist es pesado y solo hace falta si suben un PDF.
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n\n";
  }

  if (!fullText.trim()) {
    throw new Error("No se pudo extraer texto del PDF (¿es un PDF escaneado como imagen?).");
  }

  return fullText;
}
