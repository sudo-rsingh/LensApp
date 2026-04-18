export interface ScannedDocument {
  id: string;
  pages: ScannedPage[];
  createdAt: Date;
  name: string;
}

export interface ScannedPage {
  id: string;
  uri: string;
  corners?: Corners;
  width: number;
  height: number;
}

export interface Corners {
  topLeft: Point;
  topRight: Point;
  bottomLeft: Point;
  bottomRight: Point;
}

export interface Point {
  x: number;
  y: number;
}

export type ScanMode = 'auto' | 'manual';
export type FilterMode = 'original' | 'grayscale' | 'blackwhite' | 'enhanced';
