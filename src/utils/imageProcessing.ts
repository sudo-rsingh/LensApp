import {FilterMode} from '../types';

export function getFilterStyle(mode: FilterMode): object {
  switch (mode) {
    case 'grayscale':
      return {filter: [{saturate: 0}]};
    case 'blackwhite':
      return {filter: [{saturate: 0}, {contrast: 2}]};
    case 'enhanced':
      return {filter: [{contrast: 1.3}, {brightness: 1.1}]};
    default:
      return {};
  }
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
