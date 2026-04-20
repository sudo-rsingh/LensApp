import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {FilterMode} from '../types';
import {useTheme} from '../theme';

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
  const t = useTheme();
  return (
    <View style={[styles.row, {backgroundColor: t.surface, borderTopColor: t.border}]}>
      {FILTERS.map(f => (
        <TouchableOpacity
          key={f.value}
          style={[
            styles.chip,
            {borderColor: t.border},
            selected === f.value && {backgroundColor: t.accent, borderColor: t.accent},
          ]}
          onPress={() => onChange(f.value)}>
          <Text style={[
            styles.label,
            {color: t.textSecondary},
            selected === f.value && {color: '#fff'},
          ]}>
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
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  label: {fontSize: 14, fontWeight: '500'},
});
