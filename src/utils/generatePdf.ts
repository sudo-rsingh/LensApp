import {PDFDocument} from 'pdf-lib';
import RNFS from 'react-native-fs';
import {ScannedPage} from '../types';

const PDF_SUBDIR = 'pdfs';

// 1 CSS px = 0.75 pt. PDF pages are sized in points.
const PX_TO_PT = 0.75;

async function readBase64(uri: string): Promise<string> {
  const path = uri.startsWith('file://') ? uri.slice(7) : uri;
  return RNFS.readFile(path, 'base64');
}

function toFileUri(p: string): string {
  return p.startsWith('file://') ? p : `file://${p}`;
}

// PNGs start with the 8-byte signature 89 50 4E 47 0D 0A 1A 0A, which in
// base64 begins with "iVBORw0KG". JPEGs start with FF D8 FF → "/9j/".
function isPng(base64: string): boolean {
  return base64.startsWith('iVBORw0KG');
}

export async function generatePdf(
  pages: ScannedPage[],
  name: string,
): Promise<string> {
  if (pages.length === 0) {
    throw new Error('PDF generation failed: no pages provided');
  }

  const pdfDoc = await PDFDocument.create();

  for (const p of pages) {
    const b64 = await readBase64(p.uri);
    const img = isPng(b64)
      ? await pdfDoc.embedPng(b64)
      : await pdfDoc.embedJpg(b64);
    const widthPt = p.width * PX_TO_PT;
    const heightPt = p.height * PX_TO_PT;
    const page = pdfDoc.addPage([widthPt, heightPt]);
    page.drawImage(img, {x: 0, y: 0, width: widthPt, height: heightPt});
  }

  const base64 = await pdfDoc.saveAsBase64();

  const safeName = name.replace(/[^a-z0-9_\-]/gi, '_');
  const dir = `${RNFS.DocumentDirectoryPath}/${PDF_SUBDIR}`;
  await RNFS.mkdir(dir);
  const filePath = `${dir}/${safeName}.pdf`;
  await RNFS.writeFile(filePath, base64, 'base64');

  return toFileUri(filePath);
}
