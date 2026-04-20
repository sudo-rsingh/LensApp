import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {ScannedDocument} from '../types';
import {formatDate} from '../utils/imageProcessing';

interface Props {
  document: ScannedDocument;
  onPress: () => void;
  onDelete: () => void;
  onRename: () => void;
}

export default function DocumentCard({document, onPress, onDelete, onRename}: Props) {
  const thumb = document.pages[0]?.uri;
  return (
    <TouchableOpacity testID={`document-card-${document.id}`} style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.thumbContainer}>
        {thumb ? (
          <Image source={{uri: thumb}} style={styles.thumb} resizeMode="cover" />
        ) : (
          <View style={[styles.thumb, styles.placeholder]} />
        )}
        {document.pages.length > 1 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{document.pages.length}</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{document.name}</Text>
        <Text style={styles.date}>{formatDate(document.createdAt)}</Text>
        <Text style={styles.pages}>
          {document.pages.length} {document.pages.length === 1 ? 'page' : 'pages'}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity testID={`rename-card-${document.id}`} onPress={onRename} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={styles.renameText}>✎</Text>
        </TouchableOpacity>
        <TouchableOpacity testID={`delete-card-${document.id}`} onPress={onDelete} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    overflow: 'hidden',
    elevation: 2,
  },
  thumbContainer: {
    width: 80,
    height: 100,
  },
  thumb: {
    width: 80,
    height: 100,
  },
  placeholder: {
    backgroundColor: '#333',
  },
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
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  name: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    color: '#888',
    fontSize: 12,
    marginBottom: 2,
  },
  pages: {
    color: '#666',
    fontSize: 12,
  },
  actions: {
    padding: 12,
    justifyContent: 'center',
    gap: 16,
  },
  renameText: {
    color: '#007AFF',
    fontSize: 18,
  },
  deleteText: {
    color: '#ff453a',
    fontSize: 16,
    fontWeight: '600',
  },
});
