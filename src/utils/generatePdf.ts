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
    const img = await pdfDoc.embedJpg(b64);
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
