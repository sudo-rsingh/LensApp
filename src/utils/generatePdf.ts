import {generatePDF as rnGeneratePDF} from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import {ScannedPage} from '../types';

// On Android, `directory` is a relative subdirectory name appended to
// getExternalFilesDir()/filesDir — NOT an absolute path.
const PDF_SUBDIR = 'pdfs';

async function pageToBase64(uri: string): Promise<string> {
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
  const imageHtml = await Promise.all(
    pages.map(async p => {
      const b64 = await pageToBase64(p.uri);
      return `<div class="page"><img src="data:image/jpeg;base64,${b64}" /></div>`;
    }),
  );

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { background: #fff; }
      .page { width: 100%; page-break-after: always; }
      .page:last-child { page-break-after: avoid; }
      img { width: 100%; height: auto; display: block; }
    </style>
  </head>
  <body>${imageHtml.join('\n')}</body>
</html>`;

  const fileName = name.replace(/[^a-z0-9_\-]/gi, '_');

  const result = await rnGeneratePDF({
    html,
    fileName,
    directory: PDF_SUBDIR,
    base64: false,
  });

  if (!result.filePath) {
    throw new Error('PDF generation failed: library returned no file path');
  }

  return toFileUri(result.filePath);
}
