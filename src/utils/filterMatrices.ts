import {concatColorMatrices, saturate, contrast, brightness, normal} from 'react-native-color-matrix-image-filters';
import {FilterMode} from '../types';

export function getFilterMatrix(filter: FilterMode): number[] {
  switch (filter) {
    case 'grayscale':
      return saturate(0);
    case 'blackwhite':
      return concatColorMatrices(saturate(0), contrast(4));
    case 'enhanced':
      return concatColorMatrices(contrast(1.3), brightness(1.1));
    default:
      return normal();
  }
}
