// Mock native + pdf-lib modules before importing the module under test
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  readFile: jest.fn().mockResolvedValue('base64imagedata'),
  writeFile: jest.fn().mockResolvedValue(undefined),
  mkdir: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('pdf-lib', () => {
  const drawImage = jest.fn();
  const addPage = jest.fn(() => ({drawImage}));
  const embedJpg = jest.fn(async (b64: string) => ({__image: b64}));
  const saveAsBase64 = jest.fn(async () => 'generatedpdfbase64');
  const create = jest.fn(async () => ({addPage, embedJpg, saveAsBase64}));
  return {
    PDFDocument: {create},
    __mocks__: {addPage, embedJpg, saveAsBase64, drawImage, create},
  };
});

import RNFS from 'react-native-fs';
import {generatePdf} from '../utils/generatePdf';
import {ScannedPage} from '../types';

const pdfLibMocks = (jest.requireMock('pdf-lib') as any).__mocks__;

const PX_TO_PT = 0.75;

const mockPages: ScannedPage[] = [
  {id: 'p1', uri: 'file:///mock/scans/scan1.jpg', width: 1240, height: 1754},
  {id: 'p2', uri: '/mock/scans/scan2.jpg', width: 1240, height: 1754},
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('generatePdf', () => {
  it('strips file:// before reading and embeds each page as JPEG', async () => {
    await generatePdf(mockPages, 'test doc');

    expect(RNFS.readFile).toHaveBeenCalledTimes(2);
    expect(RNFS.readFile).toHaveBeenCalledWith('/mock/scans/scan1.jpg', 'base64');
    expect(RNFS.readFile).toHaveBeenCalledWith('/mock/scans/scan2.jpg', 'base64');
    expect(pdfLibMocks.embedJpg).toHaveBeenCalledTimes(2);
  });

  it('sizes each page to its image and draws the image edge-to-edge', async () => {
    const variedPages: ScannedPage[] = [
      {id: 'p1', uri: 'file:///a.jpg', width: 1240, height: 1754}, // portrait
      {id: 'p2', uri: 'file:///b.jpg', width: 2000, height: 1000}, // wide landscape
      {id: 'p3', uri: 'file:///c.jpg', width: 800, height: 600}, // 4:3
    ];

    await generatePdf(variedPages, 'varied');

    expect(pdfLibMocks.addPage).toHaveBeenCalledTimes(3);
    expect(pdfLibMocks.addPage).toHaveBeenNthCalledWith(1, [
      1240 * PX_TO_PT,
      1754 * PX_TO_PT,
    ]);
    expect(pdfLibMocks.addPage).toHaveBeenNthCalledWith(2, [
      2000 * PX_TO_PT,
      1000 * PX_TO_PT,
    ]);
    expect(pdfLibMocks.addPage).toHaveBeenNthCalledWith(3, [
      800 * PX_TO_PT,
      600 * PX_TO_PT,
    ]);

    expect(pdfLibMocks.drawImage).toHaveBeenCalledTimes(3);
    expect(pdfLibMocks.drawImage).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      {x: 0, y: 0, width: 1240 * PX_TO_PT, height: 1754 * PX_TO_PT},
    );
    expect(pdfLibMocks.drawImage).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      {x: 0, y: 0, width: 2000 * PX_TO_PT, height: 1000 * PX_TO_PT},
    );
    expect(pdfLibMocks.drawImage).toHaveBeenNthCalledWith(
      3,
      expect.anything(),
      {x: 0, y: 0, width: 800 * PX_TO_PT, height: 600 * PX_TO_PT},
    );
  });

  it('writes the PDF under DocumentDirectoryPath/pdfs with a sanitised name', async () => {
    await generatePdf(mockPages, 'Scan 2024/06/15 — page 1');

    expect(RNFS.mkdir).toHaveBeenCalledWith('/mock/documents/pdfs');
    const writeCall = (RNFS.writeFile as jest.Mock).mock.calls[0];
    const [writtenPath, contents, encoding] = writeCall;
    expect(writtenPath).toMatch(/^\/mock\/documents\/pdfs\/[a-z0-9_\-]+\.pdf$/i);
    const fileName = writtenPath.split('/').pop() as string;
    expect(fileName).not.toMatch(/[^a-z0-9_\-.]/i);
    expect(contents).toBe('generatedpdfbase64');
    expect(encoding).toBe('base64');
  });

  it('returns a file:// URI', async () => {
    const result = await generatePdf(mockPages, 'test');
    expect(result).toBe('file:///mock/documents/pdfs/test.pdf');
  });

  it('throws when no pages are provided', async () => {
    await expect(generatePdf([], 'test')).rejects.toThrow(
      'PDF generation failed',
    );
  });

  it('propagates errors from pdf-lib', async () => {
    pdfLibMocks.saveAsBase64.mockRejectedValueOnce(new Error('save failed'));

    await expect(generatePdf(mockPages, 'test')).rejects.toThrow('save failed');
  });
});
