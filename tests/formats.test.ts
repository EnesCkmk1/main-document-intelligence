import { expect, it } from "vitest";
import JSZip from "jszip";
import { extractContent } from "../lib/extract";

async function wordFile(text: string) {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  zip.file("word/document.xml", `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>${text}</w:t></w:r></w:p></w:body></w:document>`);
  return new File([await zip.generateAsync({ type: "uint8array" })], "synthetic.docx");
}

it("extracts Danish text from a real DOCX container", async () => {
  expect(await extractContent(await wordFile("Fiktiv aftale: frist 15. oktober 2026. ÆØÅ")))
    .toEqual({ kind: "text", text: "Fiktiv aftale: frist 15. oktober 2026. ÆØÅ" });
});
it("rejects an empty DOCX", async () => {
  await expect(extractContent(await wordFile(""))).rejects.toThrow();
});
it("rejects a corrupt DOCX", async () => {
  await expect(extractContent(new File(["invalid zip"], "broken.docx"))).rejects.toThrow();
});
it("preserves PDF bytes for provider processing (not an OCR test)", async () => {
  const bytes = "%PDF-1.4\n%synthetic transport fixture\n%%EOF";
  expect(await extractContent(new File([bytes], "fixture.pdf", { type: "application/pdf" })))
    .toEqual({ kind: "pdf", base64: Buffer.from(bytes).toString("base64") });
});
it.each(["image/jpeg", "image/png", "image/gif", "image/webp"])("preserves image bytes and MIME for %s", async mediaType => {
  const bytes = new Uint8Array([0, 1, 127, 255]);
  expect(await extractContent(new File([bytes], "fixture", { type: mediaType })))
    .toEqual({ kind: "image", mediaType, base64: Buffer.from(bytes).toString("base64") });
});
