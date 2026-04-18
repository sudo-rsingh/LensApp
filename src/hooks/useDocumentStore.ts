import {useState, useCallback} from 'react';
import {ScannedDocument, ScannedPage} from '../types';

let idCounter = 0;
const uid = () => `${Date.now()}-${++idCounter}`;

export function useDocumentStore() {
  const [documents, setDocuments] = useState<ScannedDocument[]>([]);

  const createDocument = useCallback((pages: ScannedPage[]): ScannedDocument => {
    const doc: ScannedDocument = {
      id: uid(),
      pages,
      createdAt: new Date(),
      name: `Scan ${new Date().toLocaleDateString()}`,
    };
    setDocuments(prev => [doc, ...prev]);
    return doc;
  }, []);

  const addPage = useCallback((docId: string, page: ScannedPage) => {
    setDocuments(prev =>
      prev.map(d => (d.id === docId ? {...d, pages: [...d.pages, page]} : d)),
    );
  }, []);

  const deleteDocument = useCallback((docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  }, []);

  const renameDocument = useCallback((docId: string, name: string) => {
    setDocuments(prev =>
      prev.map(d => (d.id === docId ? {...d, name} : d)),
    );
  }, []);

  return {documents, createDocument, addPage, deleteDocument, renameDocument};
}
