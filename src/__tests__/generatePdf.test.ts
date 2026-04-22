jest.mock('react-native', () => ({
  NativeModules: {
    PdfGenerator: {
      generate: jest.fn(),
    },
  },
  Platform: {OS: 'android'},
}));

jest.mock('../utils/filterMatrices', () => ({
  getFilterMatrix: jest.fn(() => new Array(20).fill(0)),
}));

import {NativeModules} from 'react-native';
import {generatePdf} from '../utils/generatePdf';
import {ScannedPage} from '../types';

const mockGenerate = NativeModules.PdfGenerator.generate as jest.Mock;

const mockPages: ScannedPage[] = [
  {id: 'p1', uri: 'file:///mock/scans/scan1.jpg', width: 1240, height: 1754},
  {id: 'p2', uri: '/mock/scans/scan2.jpg', width: 1240, height: 1754},
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('generatePdf', () => {
  it('passes all image URIs to the native module', async () => {
    mockGenerate.mockResolvedValue('file:///mock/pdfs/test.pdf');

    await generatePdf(mockPages, 'test');

    expect(mockGenerate).toHaveBeenCalledWith(
      ['file:///mock/scans/scan1.jpg', '/mock/scans/scan2.jpg'],
      'test',
      expect.any(Array),
    );
  });

  it('sanitises the file name before passing to native module', async () => {
    mockGenerate.mockResolvedValue('file:///mock/pdfs/test.pdf');

    await generatePdf(mockPages, 'Scan 2024/06/15 — page 1');

    const fileName = mockGenerate.mock.calls[0][1];
    expect(fileName).not.toMatch(/[^a-z0-9_\-]/i);
  });

  it('returns the path resolved by the native module', async () => {
    mockGenerate.mockResolvedValue('file:///mock/pdfs/test.pdf');

    const result = await generatePdf(mockPages, 'test');
    expect(result).toBe('file:///mock/pdfs/test.pdf');
  });

  it('throws when the native module rejects', async () => {
    mockGenerate.mockRejectedValue(new Error('native crash'));

    await expect(generatePdf(mockPages, 'test')).rejects.toThrow('native crash');
  });
});
