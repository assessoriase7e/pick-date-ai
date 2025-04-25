import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }
    if (file.size === 0) {
      reject(new Error("File is empty"));
      return;
    }
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      // PDF: usar pdfjs para extrair texto
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
          const typedarray = new Uint8Array(
            event.target?.result as ArrayBuffer
          );
          const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items
              .map((item: any) => item.str)
              .join("\n");
            text += pageText + "\n";
          }
          resolve(text.trim());
        } catch (err) {
          reject(new Error("Erro ao extrair texto do PDF"));
        }
      };
      reader.onerror = () => {
        reject(new Error("Erro ao ler o arquivo PDF"));
      };
      reader.readAsArrayBuffer(file);
    } else {
      // TXT: leitura normal
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result.toString());
        } else {
          reject(new Error("File read result is empty"));
        }
      };
      reader.onerror = (event) => {
        reject(new Error("Erro ao ler o arquivo TXT"));
      };
      reader.readAsText(file);
    }
  });
};
