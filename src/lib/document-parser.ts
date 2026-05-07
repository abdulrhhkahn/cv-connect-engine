// Extract plain text from PDF or DOCX files in the browser.
import mammoth from "mammoth/mammoth.browser";

export const extractTextFromFile = async (file: File): Promise<string> => {
  const name = file.name.toLowerCase();

  if (name.endsWith(".docx")) {
    const buf = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return (result.value || "").trim();
  }

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    // Dynamically import pdfjs to keep initial bundle smaller.
    const pdfjs: any = await import("pdfjs-dist/build/pdf.mjs");
    // Use a CDN worker matching installed version to avoid bundling worker.
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    const buf = await file.arrayBuffer();
    const doc = await pdfjs.getDocument({ data: buf }).promise;
    let out = "";
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map((it: any) => ("str" in it ? it.str : "")).join(" ");
      out += text + "\n\n";
    }
    return out.trim();
  }

  // text/markdown/plain fallback
  return (await file.text()).trim();
};
