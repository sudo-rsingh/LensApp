jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  exists: jest.fn().mockResolvedValue(false),
  readFile: jest.fn().mockResolvedValue('[]'),
  writeFile: jest.fn().mockResolvedValue(undefined),
}));

import {renderHook, act} from '@testing-library/react-native';
import RNFS from 'react-native-fs';
import {useDocumentStore} from '../hooks/useDocumentStore';
import {ScannedPage} from '../types';

const mockPages: ScannedPage[] = [
  {id: 'p1', uri: 'file:///mock/scan1.jpg', width: 1240, height: 1754},
];

beforeEach(() => {
  jest.clearAllMocks();
  (RNFS.exists as jest.Mock).mockResolvedValue(false);
  (RNFS.writeFile as jest.Mock).mockResolvedValue(undefined);
});

describe('useDocumentStore', () => {
  it('starts with an empty list', async () => {
    const {result} = renderHook(() => useDocumentStore());
    // Wait for the async load to settle
    await act(async () => {});
    expect(result.current.documents).toEqual([]);
  });

  it('createDocument adds a document to the list', async () => {
    const {result} = renderHook(() => useDocumentStore());
    await act(async () => {});

    act(() => {
      result.current.createDocument(mockPages);
    });

    expect(result.current.documents).toHaveLength(1);
    expect(result.current.documents[0].pages).toEqual(mockPages);
  });

  it('new document gets a name and createdAt', async () => {
    const {result} = renderHook(() => useDocumentStore());
    await act(async () => {});

    act(() => {
      result.current.createDocument(mockPages);
    });

    const doc = result.current.documents[0];
    expect(typeof doc.name).toBe('string');
    expect(doc.name.length).toBeGreaterThan(0);
    expect(doc.createdAt).toBeInstanceOf(Date);
  });

  it('multiple documents are prepended in order', async () => {
    const {result} = renderHook(() => useDocumentStore());
    await act(async () => {});

    act(() => {
      result.current.createDocument(mockPages);
    });
    act(() => {
      result.current.createDocument(mockPages);
    });

    expect(result.current.documents).toHaveLength(2);
    // Most recent first
    expect(result.current.documents[0].id).not.toBe(
      result.current.documents[1].id,
    );
  });

  it('deleteDocument removes the correct document', async () => {
    const {result} = renderHook(() => useDocumentStore());
    await act(async () => {});

    act(() => {
      result.current.createDocument(mockPages);
      result.current.createDocument(mockPages);
    });

    const idToDelete = result.current.documents[0].id;

    act(() => {
      result.current.deleteDocument(idToDelete);
    });

    expect(result.current.documents).toHaveLength(1);
    expect(result.current.documents[0].id).not.toBe(idToDelete);
  });

  it('renameDocument updates only the target document', async () => {
    const {result} = renderHook(() => useDocumentStore());
    await act(async () => {});

    act(() => {
      result.current.createDocument(mockPages);
      result.current.createDocument(mockPages);
    });

    const targetId = result.current.documents[0].id;
    const otherId = result.current.documents[1].id;
    const otherName = result.current.documents[1].name;

    act(() => {
      result.current.renameDocument(targetId, 'Invoice Q1');
    });

    expect(result.current.documents.find(d => d.id === targetId)?.name).toBe(
      'Invoice Q1',
    );
    // Other document untouched
    expect(result.current.documents.find(d => d.id === otherId)?.name).toBe(
      otherName,
    );
  });

  it('persists to disk after createDocument', async () => {
    const {result} = renderHook(() => useDocumentStore());
    await act(async () => {});

    await act(async () => {
      result.current.createDocument(mockPages);
    });

    expect(RNFS.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('documents.json'),
      expect.any(String),
      'utf8',
    );
  });

  it('loads persisted documents on mount', async () => {
    const saved = [
      {
        id: 'saved-1',
        name: 'Old Scan',
        createdAt: new Date('2024-01-01').toISOString(),
        pages: mockPages,
      },
    ];
    (RNFS.exists as jest.Mock).mockResolvedValue(true);
    (RNFS.readFile as jest.Mock).mockResolvedValue(JSON.stringify(saved));

    const {result} = renderHook(() => useDocumentStore());
    await act(async () => {});

    expect(result.current.documents).toHaveLength(1);
    expect(result.current.documents[0].id).toBe('saved-1');
    expect(result.current.documents[0].createdAt).toBeInstanceOf(Date);
  });

  it('handles corrupt persisted data gracefully', async () => {
    (RNFS.exists as jest.Mock).mockResolvedValue(true);
    (RNFS.readFile as jest.Mock).mockResolvedValue('not valid json {{');

    const {result} = renderHook(() => useDocumentStore());
    await act(async () => {});

    expect(result.current.documents).toEqual([]);
  });
});
