import {NativeModules} from 'react-native';
import {ScannedPage} from '../types';

const {PdfGenerator} = NativeModules;

export async function generatePdf(pages: ScannedPage[], name: string): Promise<string> {
  const imagePaths = pages.map(p => p.uri);
  const fileName = name.replace(/[^a-z0-9_\-]/gi, '_');
  return PdfGenerator.generate(imagePaths, fileName);
}
