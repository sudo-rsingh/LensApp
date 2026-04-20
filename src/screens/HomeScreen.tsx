import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  TextInput,
  Modal,
} from 'react-native';
import {ScannedDocument} from '../types';
import DocumentCard from '../components/DocumentCard';
import {useTheme} from '../theme';

interface Props {
  documents: ScannedDocument[];
  onScan: () => void;
  onView: (doc: ScannedDocument) => void;
  onDelete: (docId: string) => void;
  onRename: (docId: string, name: string) => void;
}

export default function HomeScreen({documents, onScan, onView, onDelete, onRename}: Props) {
  const t = useTheme();
  const [renameTarget, setRenameTarget] = useState<ScannedDocument | null>(null);
  const [renameText, setRenameText] = useState('');

  const confirmDelete = (doc: ScannedDocument) => {
    Alert.alert('Delete Document', `Delete "${doc.name}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', style: 'destructive', onPress: () => onDelete(doc.id)},
    ]);
  };

  const startRename = (doc: ScannedDocument) => {
    setRenameTarget(doc);
    setRenameText(doc.name);
  };

  const submitRename = () => {
    if (renameTarget && renameText.trim()) {
      onRename(renameTarget.id, renameText.trim());
    }
    setRenameTarget(null);
  };

  return (
    <View style={[styles.container, {backgroundColor: t.bg}]}>
      <StatusBar barStyle={t.statusBar} backgroundColor={t.bg} />
      <View style={[styles.header, {borderBottomColor: t.border}]}>
        <Text style={[styles.title, {color: t.text}]}>Lens</Text>
        <Text style={[styles.subtitle, {color: t.textSecondary}]}>
          {documents.length} document{documents.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {documents.length === 0 ? (
        <View testID="empty-state" style={styles.empty}>
          <Text style={styles.emptyIcon}>📄</Text>
          <Text style={[styles.emptyTitle, {color: t.text}]}>No scans yet</Text>
          <Text style={[styles.emptyHint, {color: t.textSecondary}]}>
            Tap the button below to scan a document
          </Text>
        </View>
      ) : (
        <FlatList
          testID="document-list"
          data={documents}
          keyExtractor={d => d.id}
          renderItem={({item}) => (
            <DocumentCard
              document={item}
              onPress={() => onView(item)}
              onDelete={() => confirmDelete(item)}
              onRename={() => startRename(item)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity testID="scan-fab" style={styles.fab} onPress={onScan} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>⊕</Text>
        <Text style={styles.fabLabel}>Scan</Text>
      </TouchableOpacity>

      <Modal visible={!!renameTarget} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View testID="rename-modal" style={[styles.modalBox, {backgroundColor: t.surface}]}>
            <Text style={[styles.modalTitle, {color: t.text}]}>Rename Document</Text>
            <TextInput
              testID="rename-input"
              style={[styles.modalInput, {backgroundColor: t.bg, color: t.text, borderColor: t.border}]}
              value={renameText}
              onChangeText={setRenameText}
              autoFocus
              selectTextOnFocus
              placeholderTextColor={t.textSecondary}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setRenameTarget(null)} style={styles.modalBtn}>
                <Text style={[styles.modalCancel, {color: t.textSecondary}]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity testID="rename-confirm" onPress={submitRename} style={styles.modalBtn}>
                <Text style={[styles.modalConfirm, {color: t.accent}]}>Rename</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {fontSize: 32, fontWeight: '700'},
  subtitle: {fontSize: 15, marginTop: 2},
  list: {paddingTop: 8, paddingBottom: 100},
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8},
  emptyIcon: {fontSize: 64},
  emptyTitle: {fontSize: 20, fontWeight: '600'},
  emptyHint: {fontSize: 15},
  fab: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 32,
    elevation: 6,
    shadowColor: '#007AFF',
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  fabIcon: {color: '#fff', fontSize: 22},
  fabLabel: {color: '#fff', fontSize: 17, fontWeight: '600'},
  modalBg: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24},
  modalBox: {borderRadius: 16, padding: 20, gap: 16},
  modalTitle: {fontSize: 17, fontWeight: '600'},
  modalInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  modalActions: {flexDirection: 'row', justifyContent: 'flex-end', gap: 16},
  modalBtn: {padding: 4},
  modalCancel: {fontSize: 15},
  modalConfirm: {fontSize: 15, fontWeight: '600'},
});
