import {generatePDF as rnGeneratePDF} from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import {ScannedPage} from '../types';

// On Android, `directory` is a relative subdirectory name appended to
// getExternalFilesDir()/filesDir — NOT an absolute path.
const PDF_SUBDIR = 'pdfs';

// 1 CSS px = 0.75 pt. react-native-html-to-pdf takes page dimensions in points.
const PX_TO_PT = 0.75;

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
  if (pages.length === 0) {
    throw new Error('PDF generation failed: no pages provided');
  }

  const imageHtml = await Promise.all(
    pages.map(async p => {
      const b64 = await pageToBase64(p.uri);
      return `<img src="data:image/jpeg;base64,${b64}" />`;
    }),
  );

  // react-native-html-to-pdf applies one page size to the whole document, so
  // derive it from the first image. All pages share this aspect ratio; with
  // `img { width: 100%; height: auto }` each image fills its page exactly.
  const first = pages[0];
  const widthPt = Math.round(first.width * PX_TO_PT);
  const heightPt = Math.round(first.height * PX_TO_PT);

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { background: #fff; }
      img { width: 100%; height: auto; display: block; page-break-after: always; }
      img:last-of-type { page-break-after: auto; }
    </style>
  </head>
  <body>${imageHtml.join('')}</body>
</html>`;

  const fileName = name.replace(/[^a-z0-9_\-]/gi, '_');

  const result = await rnGeneratePDF({
    html,
    fileName,
    directory: PDF_SUBDIR,
    base64: false,
    width: widthPt,
    height: heightPt,
    // iOS defaults to 10pt padding on each side; zero it out so the image
    // fills the page edge-to-edge.
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  });

  if (!result.filePath) {
    throw new Error('PDF generation failed: library returned no file path');
  }

  return toFileUri(result.filePath);
}
