// Mock native modules before importing the module under test
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  readFile: jest.fn().mockResolvedValue('base64data'),
  mkdir: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('react-native-html-to-pdf', () => ({
  generatePDF: jest.fn(),
}));

import RNFS from 'react-native-fs';
import {generatePDF as mockGeneratePDF} from 'react-native-html-to-pdf';
import {generatePdf} from '../utils/generatePdf';
import {ScannedPage} from '../types';

const mockPages: ScannedPage[] = [
  {id: 'p1', uri: 'file:///mock/scans/scan1.jpg', width: 1240, height: 1754},
  {id: 'p2', uri: '/mock/scans/scan2.jpg', width: 1240, height: 1754},
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('generatePdf', () => {
  it('strips file:// before reading and passes base64 to HTML', async () => {
    (mockGeneratePDF as jest.Mock).mockResolvedValue({
      filePath: '/mock/documents/pdfs/test.pdf',
    });

    await generatePdf(mockPages, 'test doc');

    // Should have been called for each page
    expect(RNFS.readFile).toHaveBeenCalledTimes(2);
    // file:// prefix stripped for first page
    expect(RNFS.readFile).toHaveBeenCalledWith('/mock/scans/scan1.jpg', 'base64');
    // path without prefix used as-is for second page
    expect(RNFS.readFile).toHaveBeenCalledWith('/mock/scans/scan2.jpg', 'base64');
  });

  it('passes a relative directory name, not an absolute path', async () => {
    (mockGeneratePDF as jest.Mock).mockResolvedValue({
      filePath: '/mock/documents/pdfs/test.pdf',
    });

    await generatePdf(mockPages, 'My Doc');

    const call = (mockGeneratePDF as jest.Mock).mock.calls[0][0];
    expect(call.directory).toBe('pdfs');
    expect(call.directory).not.toContain('/');
  });

  it('sanitises the file name', async () => {
    (mockGeneratePDF as jest.Mock).mockResolvedValue({
      filePath: '/mock/documents/pdfs/test.pdf',
    });

    await generatePdf(mockPages, 'Scan 2024/06/15 — page 1');

    const call = (mockGeneratePDF as jest.Mock).mock.calls[0][0];
    expect(call.fileName).not.toMatch(/[^a-z0-9_\-]/i);
  });

  it('returns a file:// URI', async () => {
    (mockGeneratePDF as jest.Mock).mockResolvedValue({
      filePath: '/mock/documents/pdfs/test.pdf',
    });

    const result = await generatePdf(mockPages, 'test');
    expect(result).toBe('file:///mock/documents/pdfs/test.pdf');
  });

  it('does not double-prefix an already file:// path', async () => {
    (mockGeneratePDF as jest.Mock).mockResolvedValue({
      filePath: 'file:///mock/documents/pdfs/test.pdf',
    });

    const result = await generatePdf(mockPages, 'test');
    expect(result).toBe('file:///mock/documents/pdfs/test.pdf');
    expect(result).not.toContain('file://file://');
  });

  it('throws when the library returns no filePath', async () => {
    (mockGeneratePDF as jest.Mock).mockResolvedValue({filePath: null});

    await expect(generatePdf(mockPages, 'test')).rejects.toThrow(
      'PDF generation failed',
    );
  });

  it('throws when the library rejects', async () => {
    (mockGeneratePDF as jest.Mock).mockRejectedValue(new Error('native crash'));

    await expect(generatePdf(mockPages, 'test')).rejects.toThrow('native crash');
  });
});
