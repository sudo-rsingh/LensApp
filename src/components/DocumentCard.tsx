import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {ColorMatrix} from 'react-native-color-matrix-image-filters';
import {ScannedDocument} from '../types';
import {formatDate} from '../utils/imageProcessing';
import {getFilterMatrix} from '../utils/filterMatrices';
import {useTheme} from '../theme';

interface Props {
  document: ScannedDocument;
  onPress: () => void;
}

export default function DocumentCard({document, onPress}: Props) {
  const t = useTheme();
  const thumb = document.pages[0]?.uri;
  return (
    <TouchableOpacity
      testID={`document-card-${document.id}`}
      style={[styles.card, {backgroundColor: t.surface, borderColor: t.border}]}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={styles.thumbContainer}>
        {thumb ? (
          <ColorMatrix matrix={getFilterMatrix(document.filter)} style={styles.thumb}>
            <Image source={{uri: thumb}} style={styles.thumb} resizeMode="cover" />
          </ColorMatrix>
        ) : (
          <View style={[styles.thumb, {backgroundColor: t.border}]} />
        )}
        {document.pages.length > 1 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{document.pages.length}</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, {color: t.text}]} numberOfLines={1}>{document.name}</Text>
        <Text style={[styles.meta, {color: t.textSecondary}]}>{formatDate(document.createdAt)}</Text>
        <Text style={[styles.meta, {color: t.textSecondary}]}>
          {document.pages.length} {document.pages.length === 1 ? 'page' : 'pages'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
    marginVertical: 6,
    overflow: 'hidden',
    elevation: 2,
  },
  thumbContainer: {width: 80, height: 100},
  thumb: {width: 80, height: 100},
  badge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {color: '#fff', fontSize: 11, fontWeight: '700'},
  info: {flex: 1, padding: 12, justifyContent: 'center', gap: 3},
  name: {fontSize: 15, fontWeight: '600'},
  meta: {fontSize: 13},
});
