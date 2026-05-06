// Lightweight pdfmake wrapper. We import vfs lazily.
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// pdfmake vfs_fonts shapes vary by version; assign safely
// @ts-ignore
pdfMake.vfs = (pdfFonts as any).pdfMake?.vfs ?? (pdfFonts as any).vfs ?? pdfFonts;

export type DocDef = Parameters<typeof pdfMake.createPdf>[0];

export function downloadPdf(def: DocDef, filename: string) {
  pdfMake.createPdf(def).download(filename);
}

export const BRAND_HEADER = (subtitle: string) => ({
  stack: [
    { text: "WAVELENGTH INFRATECH", style: "brand" },
    { text: subtitle, style: "subtitle" },
    { canvas: [{ type: "line", x1: 0, y1: 4, x2: 515, y2: 4, lineWidth: 1.5, lineColor: "#1a237e" }] },
  ],
  margin: [0, 0, 0, 16] as [number, number, number, number],
});

export const PDF_STYLES = {
  brand: { fontSize: 20, bold: true, color: "#1a237e" },
  subtitle: { fontSize: 11, color: "#666", margin: [0, 2, 0, 6] as [number, number, number, number] },
  th: { bold: true, fillColor: "#1a237e", color: "#ffffff", fontSize: 10 },
  td: { fontSize: 10 },
  totalRow: { bold: true, fillColor: "#fff3e0", fontSize: 11 },
};
