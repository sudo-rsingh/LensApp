export interface ScannedDocument {
  id: string;
  pages: ScannedPage[];
  createdAt: Date;
  name: string;
  filter: FilterMode;
}

export interface ScannedPage {
  id: string;
  uri: string;
  width: number;
  height: number;
}

export type FilterMode = 'original' | 'grayscale' | 'blackwhite' | 'enhanced';
