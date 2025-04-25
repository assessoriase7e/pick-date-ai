import mammoth from "mammoth";

// Função para converter HTML em texto preservando quebras de linha
function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '') // remove outras tags
    .replace(/\n{3,}/g, '\n\n') // evita excesso de linhas em branco
    .trim();
}

export async function docxToText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammoth.convertToHtml({ arrayBuffer });
  return htmlToPlainText(value);
}
