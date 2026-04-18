import React, {useState, useCallback, useEffect} from 'react';
import {Alert, BackHandler} from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import ScanScreen from './src/screens/ScanScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import ViewerScreen from './src/screens/ViewerScreen';
import {useDocumentStore} from './src/hooks/useDocumentStore';
import {ScannedDocument, ScannedPage, FilterMode} from './src/types';

type Screen = 'home' | 'scan' | 'review' | 'viewer';

export default function App() {
  const {documents, createDocument, deleteDocument, renameDocument} =
    useDocumentStore();

  const [screen, setScreen] = useState<Screen>('home');
  const [pendingPages, setPendingPages] = useState<ScannedPage[]>([]);
  const [viewingDoc, setViewingDoc] = useState<ScannedDocument | null>(null);

  const goHome = useCallback(() => {
    setScreen('home');
    setPendingPages([]);
    setViewingDoc(null);
  }, []);

  const handleScanComplete = useCallback((pages: ScannedPage[]) => {
    setPendingPages(pages);
    setScreen('review');
  }, []);

  const handleSaveDocument = useCallback(
    (pages: ScannedPage[], _filter: FilterMode) => {
      createDocument(pages);
      goHome();
    },
    [createDocument, goHome],
  );

  const handleView = useCallback((doc: ScannedDocument) => {
    setViewingDoc(doc);
    setScreen('viewer');
  }, []);

  useEffect(() => {
    if (screen === 'home') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      goHome();
      return true;
    });
    return () => sub.remove();
  }, [screen, goHome]);

  const handleRenameFromViewer = useCallback(
    (_currentName: string) => {
      if (!viewingDoc) return;
      // Alert.prompt is iOS-only; on Android show a simple alert
      if (Alert.prompt) {
        Alert.prompt(
          'Rename',
          undefined,
          text => {
            if (text?.trim()) renameDocument(viewingDoc.id, text.trim());
          },
          'plain-text',
          _currentName,
        );
      } else {
        // Android fallback: navigate home and use HomeScreen rename modal
        renameDocument(viewingDoc.id, _currentName);
      }
    },
    [viewingDoc, renameDocument],
  );

  if (screen === 'scan') {
    return (
      <ScanScreen
        onComplete={handleScanComplete}
        onCancel={goHome}
      />
    );
  }

  if (screen === 'review') {
    return (
      <ReviewScreen
        pages={pendingPages}
        onSave={handleSaveDocument}
        onAddMore={() => setScreen('scan')}
        onCancel={goHome}
      />
    );
  }

  if (screen === 'viewer' && viewingDoc) {
    const fresh = documents.find(d => d.id === viewingDoc.id) ?? viewingDoc;
    return (
      <ViewerScreen
        document={fresh}
        onBack={goHome}
        onDelete={() => {
          deleteDocument(fresh.id);
          goHome();
        }}
        onRename={handleRenameFromViewer}
      />
    );
  }

  return (
    <HomeScreen
      documents={documents}
      onScan={() => setScreen('scan')}
      onView={handleView}
      onDelete={deleteDocument}
      onRename={renameDocument}
    />
  );
}
