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
} from 'react-native';
import {ScannedPage, FilterMode} from '../types';
import FilterPicker from '../components/FilterPicker';
import {useTheme} from '../theme';

const {width: SW} = Dimensions.get('window');

interface Props {
  pages: ScannedPage[];
  onSave: (pages: ScannedPage[], filter: FilterMode) => void;
  onAddMore: () => void;
  onCancel: () => void;
}

export default function ReviewScreen({pages, onSave, onAddMore, onCancel}: Props) {
  const t = useTheme();
  const [filter, setFilter] = useState<FilterMode>('original');
  const [currentIndex, setCurrentIndex] = useState(0);

  const imageContainerStyle = () => {
    switch (filter) {
      case 'grayscale': return styles.filterGrayscale;
      case 'blackwhite': return styles.filterBW;
      case 'enhanced': return styles.filterEnhanced;
      default: return null;
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: t.bg}]}>
      <StatusBar barStyle={t.statusBar} backgroundColor={t.bg} />

      <View style={[styles.header, {borderBottomColor: t.border}]}>
        <TouchableOpacity onPress={onCancel} style={styles.headerBtn}>
          <Text style={[styles.headerBtnText, {color: t.accent}]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: t.text}]}>
          {currentIndex + 1} / {pages.length}
        </Text>
        <TouchableOpacity onPress={() => onSave(pages, filter)} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Save</Text>
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
        {pages.map(page => (
          <View key={page.id} style={styles.pageContainer}>
            <View style={[styles.imageWrapper, imageContainerStyle()]}>
              <Image source={{uri: page.uri}} style={styles.pageImage} resizeMode="contain" />
            </View>
          </View>
        ))}
      </ScrollView>

      {pages.length > 1 && (
        <View style={styles.dots}>
          {pages.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, {backgroundColor: t.border}, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}

      <FilterPicker selected={filter} onChange={setFilter} />

      <View style={[styles.bottomActions, {borderTopColor: t.border}]}>
        <TouchableOpacity style={[styles.actionBtn, {borderColor: t.border}]} onPress={onAddMore}>
          <Text style={[styles.actionIcon, {color: t.accent}]}>+</Text>
          <Text style={[styles.actionLabel, {color: t.accent}]}>Add Page</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnPrimary]}
          onPress={() => onSave(pages, filter)}>
          <Text style={[styles.actionLabel, styles.actionLabelPrimary]}>Save Document</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: {padding: 4},
  headerBtnText: {fontSize: 16},
  headerTitle: {fontSize: 16, fontWeight: '600'},
  saveBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  saveBtnText: {color: '#fff', fontSize: 15, fontWeight: '600'},
  pageContainer: {
    width: SW,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  imageWrapper: {flex: 1, width: '100%', borderRadius: 8, overflow: 'hidden'},
  pageImage: {flex: 1, width: '100%'},
  filterGrayscale: {opacity: 0.9},
  filterBW: {opacity: 1},
  filterEnhanced: {opacity: 1},
  dots: {flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 8},
  dot: {width: 6, height: 6, borderRadius: 3},
  dotActive: {backgroundColor: '#007AFF', width: 18},
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionBtnPrimary: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
    flex: 2,
  },
  actionIcon: {fontSize: 20, fontWeight: '600'},
  actionLabel: {fontSize: 15, fontWeight: '500'},
  actionLabelPrimary: {color: '#fff', fontWeight: '600'},
});
