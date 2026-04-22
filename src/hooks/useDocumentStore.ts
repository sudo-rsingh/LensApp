import {useState, useCallback, useEffect, useRef} from 'react';
import RNFS from 'react-native-fs';
import {ScannedDocument, ScannedPage, FilterMode} from '../types';

let idCounter = 0;
const uid = () => `${Date.now()}-${++idCounter}`;

const INDEX_FILE = `${RNFS.DocumentDirectoryPath}/documents.json`;

async function loadFromDisk(): Promise<ScannedDocument[]> {
  try {
    const exists = await RNFS.exists(INDEX_FILE);
    if (!exists) return [];
    const raw = await RNFS.readFile(INDEX_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Array<ScannedDocument & {createdAt: string}>;
    return parsed.map(d => ({...d, createdAt: new Date(d.createdAt)}));
  } catch {
    return [];
  }
}

async function saveToDisk(docs: ScannedDocument[]): Promise<void> {
  await RNFS.writeFile(INDEX_FILE, JSON.stringify(docs), 'utf8');
}

export function useDocumentStore() {
  const [documents, setDocuments] = useState<ScannedDocument[]>([]);
  const ready = useRef(false);

  // Load persisted documents on mount
  useEffect(() => {
    loadFromDisk().then(docs => {
      setDocuments(docs);
      ready.current = true;
    });
  }, []);

  // Persist whenever documents change (skip the initial empty state before load)
  useEffect(() => {
    if (ready.current) {
      saveToDisk(documents);
    }
  }, [documents]);

  const createDocument = useCallback((pages: ScannedPage[], filter: FilterMode): ScannedDocument => {
    const doc: ScannedDocument = {
      id: uid(),
      pages,
      createdAt: new Date(),
      name: `Scan ${new Date().toLocaleDateString()}`,
      filter,
    };
    setDocuments(prev => [doc, ...prev]);
    return doc;
  }, []);

  const deleteDocument = useCallback((docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  }, []);

  const renameDocument = useCallback((docId: string, name: string) => {
    setDocuments(prev =>
      prev.map(d => (d.id === docId ? {...d, name} : d)),
    );
  }, []);

  return {documents, createDocument, deleteDocument, renameDocument};
}
