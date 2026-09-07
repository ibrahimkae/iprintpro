export interface PrintHistoryItem {
  id: string;
  timestamp: number;
  title: string;
  type: 'editor' | 'image' | 'template' | 'collage' | 'document' | 'banner' | 'tools';
  previewDataUrl: string;
  width: number;
  height: number;
  copies?: number;
}

export interface SavedDraftItem {
  id: string;
  timestamp: number;
  title: string;
  category: string;
  previewDataUrl?: string;
  payload: any;
}

export type ImageFilterPreset = 'normal' | 'photo' | 'sketch' | 'document' | 'high-contrast' | 'invert';

export interface ImageProcessingOptions {
  brightness: number; // -100 to 100
  contrast: number;   // -100 to 100
  sharpness: number;  // 0 to 100
  invert: boolean;
  preset: ImageFilterPreset;
}
