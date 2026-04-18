import {FilterMode, Corners} from '../types';

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

// Builds a CSS-style matrix string for perspective transform preview
export function cornersToTransform(corners: Corners, width: number, height: number): string {
  const {topLeft, topRight, bottomLeft, bottomRight} = corners;
  // Normalized 0-1 coordinates for display
  const tl = `${(topLeft.x / width) * 100}% ${(topLeft.y / height) * 100}%`;
  const tr = `${(topRight.x / width) * 100}% ${(topRight.y / height) * 100}%`;
  const br = `${(bottomRight.x / width) * 100}% ${(bottomRight.y / height) * 100}%`;
  const bl = `${(bottomLeft.x / width) * 100}% ${(bottomLeft.y / height) * 100}%`;
  return `polygon(${tl}, ${tr}, ${br}, ${bl})`;
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
