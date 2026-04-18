import {generatePDF as rnGeneratePDF} from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import {ScannedPage} from '../types';

const PDF_DIR = `${RNFS.DocumentDirectoryPath}/pdfs`;

async function pageToBase64(uri: string): Promise<string> {
  const path = uri.startsWith('file://') ? uri.slice(7) : uri;
  return RNFS.readFile(path, 'base64');
}

export async function generatePdf(
  pages: ScannedPage[],
  name: string,
): Promise<string> {
  await RNFS.mkdir(PDF_DIR);

  const imageHtml = await Promise.all(
    pages.map(async p => {
      const b64 = await pageToBase64(p.uri);
      return `<div class="page"><img src="data:image/jpeg;base64,${b64}" /></div>`;
    }),
  );

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #fff; }
          .page {
            width: 100%;
            page-break-after: always;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .page:last-child { page-break-after: avoid; }
          img { width: 100%; height: auto; display: block; }
        </style>
      </head>
      <body>${imageHtml.join('\n')}</body>
    </html>
  `;

  const result = await rnGeneratePDF({
    html,
    fileName: name.replace(/[^a-z0-9_\-]/gi, '_'),
    directory: PDF_DIR,
    base64: false,
  });

  if (!result.filePath) {
    throw new Error('PDF generation failed — no output path returned');
  }

  return result.filePath;
}
