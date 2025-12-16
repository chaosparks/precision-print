export const Orientation = {
  PORTRAIT: 'portrait',
  LANDSCAPE: 'landscape',
} as const;

export type Orientation = typeof Orientation[keyof typeof Orientation];

export interface ImageConfig {
  url: string | null;
  x: number; // in mm relative to paper center
  y: number; // in mm relative to paper center
  scale: number; // percentage (1 = 100%)
  rotation: number; // degrees
  naturalWidth?: number; // px
  naturalHeight?: number; // px
}

export interface PaperConfig {
  orientation: Orientation;
  showGrid: boolean;
}
