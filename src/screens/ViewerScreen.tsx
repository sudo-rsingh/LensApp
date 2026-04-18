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
} from 'react-native';
import Share from 'react-native-share';
import {ScannedDocument} from '../types';
import {generatePdf} from '../utils/generatePdf';

const {width: SW} = Dimensions.get('window');

interface Props {
  document: ScannedDocument;
  onBack: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
}

export default function ViewerScreen({document, onBack, onDelete, onRename}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [generating, setGenerating] = useState(false);

  const sharePdf = async (pageIndices?: number[]) => {
    setGenerating(true);
    try {
      const pages =
        pageIndices
          ? pageIndices.map(i => document.pages[i]).filter(Boolean)
          : document.pages;

      const label =
        pageIndices?.length === 1
          ? `${document.name} — page ${pageIndices[0] + 1}`
          : document.name;

      const pdfPath = await generatePdf(pages, label);

      await Share.open({
        title: label,
        type: 'application/pdf',
        url: `file://${pdfPath}`,
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerBtn}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title} numberOfLines={1}>{document.name}</Text>
          <Text style={styles.subtitle}>
            {currentIndex + 1} / {document.pages.length}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => sharePdf()}
          style={styles.headerBtn}
          disabled={generating}>
          <Text style={styles.shareText}>Share PDF</Text>
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
            <Text style={styles.pageNum}>Page {i + 1}</Text>
          </View>
        ))}
      </ScrollView>

      {document.pages.length > 1 && (
        <View style={styles.dots}>
          {document.pages.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
          ))}
        </View>
      )}

      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => sharePdf([currentIndex])}
          disabled={generating}>
          <Text style={styles.toolIcon}>⬆</Text>
          <Text style={styles.toolLabel}>Share Page</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => sharePdf()}
          disabled={generating}>
          <Text style={styles.toolIcon}>📄</Text>
          <Text style={styles.toolLabel}>Share All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={() => onRename(document.name)}>
          <Text style={styles.toolIcon}>✎</Text>
          <Text style={styles.toolLabel}>Rename</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toolBtn, styles.toolBtnDanger]} onPress={confirmDelete}>
          <Text style={[styles.toolIcon, styles.toolIconDanger]}>🗑</Text>
          <Text style={[styles.toolLabel, styles.toolLabelDanger]}>Delete</Text>
        </TouchableOpacity>
      </View>

      {generating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Generating PDF…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerBtn: {minWidth: 60},
  headerCenter: {flex: 1, alignItems: 'center'},
  back: {color: '#007AFF', fontSize: 17},
  title: {color: '#fff', fontSize: 15, fontWeight: '600'},
  subtitle: {color: '#666', fontSize: 12, marginTop: 2},
  shareText: {color: '#007AFF', fontSize: 15, textAlign: 'right'},
  pageContainer: {
    width: SW,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  pageImage: {flex: 1, width: '100%', borderRadius: 4},
  pageNum: {color: '#444', fontSize: 12, marginTop: 8},
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  dot: {width: 6, height: 6, borderRadius: 3, backgroundColor: '#333'},
  dotActive: {backgroundColor: '#007AFF', width: 18},
  toolbar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingBottom: 32,
  },
  toolBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    gap: 4,
  },
  toolBtnDanger: {},
  toolIcon: {fontSize: 20, color: '#007AFF'},
  toolIconDanger: {color: '#ff453a'},
  toolLabel: {fontSize: 11, color: '#007AFF'},
  toolLabelDanger: {color: '#ff453a'},
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {color: '#fff', fontSize: 15},
});
