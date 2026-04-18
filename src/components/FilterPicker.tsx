import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {FilterMode} from '../types';

const FILTERS: {label: string; value: FilterMode}[] = [
  {label: 'Original', value: 'original'},
  {label: 'Grayscale', value: 'grayscale'},
  {label: 'B&W', value: 'blackwhite'},
  {label: 'Enhanced', value: 'enhanced'},
];

interface Props {
  selected: FilterMode;
  onChange: (mode: FilterMode) => void;
}

export default function FilterPicker({selected, onChange}: Props) {
  return (
    <View style={styles.row}>
      {FILTERS.map(f => (
        <TouchableOpacity
          key={f.value}
          style={[styles.chip, selected === f.value && styles.chipActive]}
          onPress={() => onChange(f.value)}>
          <Text style={[styles.label, selected === f.value && styles.labelActive]}>
            {f.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: '#1c1c1e',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  chipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  label: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '500',
  },
  labelActive: {
    color: '#fff',
  },
});
