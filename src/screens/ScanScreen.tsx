import React, {useState, useRef, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import DocumentScanner, {ResponseType} from 'react-native-document-scanner-plugin';
import RNFS from 'react-native-fs';
import {ScannedPage} from '../types';
import {useTheme} from '../theme';

interface Props {
  onComplete: (pages: ScannedPage[]) => void;
  onCancel: () => void;
}

let pageIdCounter = 0;
const pageUid = () => `page-${Date.now()}-${++pageIdCounter}`;

const SCANS_DIR = `${RNFS.DocumentDirectoryPath}/scans`;

async function copyToPermanent(tempUri: string): Promise<string> {
  await RNFS.mkdir(SCANS_DIR);
  const filename = `scan_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
  const dest = `${SCANS_DIR}/${filename}`;
  await RNFS.copyFile(tempUri, dest);
  return `file://${dest}`;
}

export default function ScanScreen({onComplete, onCancel}: Props) {
  const t = useTheme();
  const [scanning, setScanning] = useState(false);
  const pagesRef = useRef<ScannedPage[]>([]);

  const scan = useCallback(async () => {
    setScanning(true);
    try {
      const {scannedImages, status} = await DocumentScanner.scanDocument({
        responseType: ResponseType.ImageFilePath,
        maxNumDocuments: 20,
      });

      if (status === 'cancel') {
        if (pagesRef.current.length === 0) {
          onCancel();
          return;
        }
        setScanning(false);
        return;
      }

      if (!scannedImages || scannedImages.length === 0) {
        setScanning(false);
        return;
      }

      const permanentUris = await Promise.all(scannedImages.map(copyToPermanent));

      const newPages: ScannedPage[] = permanentUris.map(uri => ({
        id: pageUid(),
        uri,
        width: 1240,
        height: 1754,
      }));

      pagesRef.current = [...pagesRef.current, ...newPages];

      Alert.alert(
        `${pagesRef.current.length} page${pagesRef.current.length !== 1 ? 's' : ''} scanned`,
        'Add more pages or finish?',
        [
          {text: 'Add More'},
          {text: 'Finish', style: 'default', onPress: () => { setScanning(false); onComplete(pagesRef.current); }},
        ],
      );
    } catch (err: any) {
      setScanning(false);
      Alert.alert('Scan Error', err?.message ?? 'Could not scan document.');
    }
  }, [onCancel, onComplete]);

  useEffect(() => {
    scan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[styles.container, {backgroundColor: t.bg}]}>
      <StatusBar barStyle={t.statusBar} backgroundColor={t.bg} />
      {scanning && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={t.accent} />
          <Text style={[styles.hint, {color: t.textSecondary}]}>Opening camera…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12},
  hint: {fontSize: 15, marginTop: 12},
});
