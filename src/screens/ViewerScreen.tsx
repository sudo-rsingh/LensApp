import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import Share from 'react-native-share';
import {ScannedDocument} from '../types';
import {generatePdf} from '../utils/generatePdf';
import {useTheme} from '../theme';

const {width: SW} = Dimensions.get('window');

interface Props {
  document: ScannedDocument;
  onBack: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
}

export default function ViewerScreen({document, onBack, onDelete, onRename}: Props) {
  const t = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameText, setRenameText] = useState('');

  const sharePdf = async (pageIndices?: number[]) => {
    setGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 0));
    try {
      const pages = pageIndices
        ? pageIndices.map(i => document.pages[i]).filter(Boolean)
        : document.pages;
      const label = pageIndices?.length === 1
        ? `${document.name} — page ${pageIndices[0] + 1}`
        : document.name;
      const pdfPath = await generatePdf(pages, label);
      await Share.open({
        title: label,
        type: 'application/pdf',
        url: pdfPath,
        failOnCancel: false,
      });
    } catch (err: any) {
      Alert.alert('Share failed', err?.message ?? 'Could not generate PDF.');
    } finally {
      setGenerating(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert('Delete', `Delete "${document.name}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', style: 'destructive', onPress: onDelete},
    ]);
  };

  return (
    <View style={[styles.container, {backgroundColor: t.bg}]}>
      <StatusBar barStyle={t.statusBar} backgroundColor={t.bg} />

      <View style={[styles.header, {borderBottomColor: t.border}]}>
        <TouchableOpacity testID="viewer-back" onPress={onBack} style={styles.headerBtn}>
          <Text style={[styles.back, {color: t.accent}]}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.title, {color: t.text}]} numberOfLines={1}>{document.name}</Text>
          <Text style={[styles.subtitle, {color: t.textSecondary}]}>
            {currentIndex + 1} / {document.pages.length}
          </Text>
        </View>
        <TouchableOpacity
          testID="share-pdf-btn"
          onPress={() => sharePdf()}
          style={styles.headerBtn}
          disabled={generating}>
          <Text style={[styles.shareText, {color: t.accent}]}>Share PDF</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SW);
          setCurrentIndex(idx);
        }}>
        {document.pages.map((page, i) => (
          <View key={page.id} style={styles.pageContainer}>
            <Image
              source={{uri: page.uri}}
              style={styles.pageImage}
              resizeMode="contain"
            />
            <Text style={[styles.pageNum, {color: t.textSecondary}]}>Page {i + 1}</Text>
          </View>
        ))}
      </ScrollView>

      {document.pages.length > 1 && (
        <View style={styles.dots}>
          {document.pages.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, {backgroundColor: t.border}, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}

      <View style={[styles.toolbar, {borderTopColor: t.border}]}>
        <TouchableOpacity style={styles.toolBtn} onPress={() => sharePdf([currentIndex])} disabled={generating}>
          <Text style={[styles.toolIcon, {color: t.accent}]}>⬆</Text>
          <Text style={[styles.toolLabel, {color: t.accent}]}>Share Page</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={() => sharePdf()} disabled={generating}>
          <Text style={[styles.toolIcon, {color: t.accent}]}>📄</Text>
          <Text style={[styles.toolLabel, {color: t.accent}]}>Share All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => {setRenameText(document.name); setRenaming(true);}}>
          <Text style={[styles.toolIcon, {color: t.accent}]}>✎</Text>
          <Text style={[styles.toolLabel, {color: t.accent}]}>Rename</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={confirmDelete}>
          <Text style={[styles.toolIcon, {color: t.danger}]}>🗑</Text>
          <Text style={[styles.toolLabel, {color: t.danger}]}>Delete</Text>
        </TouchableOpacity>
      </View>

{generating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Generating PDF…</Text>
        </View>
      )}

      <Modal
        visible={renaming}
        transparent
        animationType="fade"
        onRequestClose={() => setRenaming(false)}>
        <TouchableOpacity
          style={styles.modalBg}
          activeOpacity={1}
          onPress={() => setRenaming(false)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={[styles.modalBox, {backgroundColor: t.surface}]}>
              <Text style={[styles.modalTitle, {color: t.text}]}>Rename Document</Text>
              <TextInput
                style={[styles.modalInput, {backgroundColor: t.bg, color: t.text, borderColor: t.border}]}
                value={renameText}
                onChangeText={setRenameText}
                autoFocus
                selectTextOnFocus
                placeholderTextColor={t.textSecondary}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setRenaming(false)} style={styles.modalBtn}>
                  <Text style={[styles.modalCancel, {color: t.danger}]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (renameText.trim()) onRename(renameText.trim());
                    setRenaming(false);
                  }}
                  style={styles.modalBtn}>
                  <Text style={[styles.modalConfirm, {color: t.accent}]}>Rename</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: {minWidth: 60},
  headerCenter: {flex: 1, alignItems: 'center'},
  back: {fontSize: 17},
  title: {fontSize: 15, fontWeight: '600'},
  subtitle: {fontSize: 13, marginTop: 2},
  shareText: {fontSize: 15, textAlign: 'right'},
  pageContainer: {
    width: SW,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  pageImage: {flex: 1, width: '100%', borderRadius: 4},
  pageNum: {fontSize: 13, marginTop: 8},
  dots: {flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 8},
  dot: {width: 6, height: 6, borderRadius: 3},
  dotActive: {backgroundColor: '#007AFF', width: 18},
  toolbar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: 32,
  },
  toolBtn: {flex: 1, alignItems: 'center', paddingVertical: 14, gap: 4},
  toolIcon: {fontSize: 20},
  toolLabel: {fontSize: 13},
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {color: '#fff', fontSize: 15},
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
